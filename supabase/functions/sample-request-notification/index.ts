// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { sendSampleRequestEmail } from '../_shared/email.ts';

const sendPush = async (tokens: string[], title: string, body: string) => {
  if (!tokens.length) return;
  
  const notifications = tokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { type: 'sample_request' }
  }));

  await Promise.all(notifications.map(notification =>
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification)
    })
  ));
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { sampleId } = await req.json();

    if (!sampleId) {
      throw new Error('Sample ID is required');
    }

    // Get sample request details with related data using manual joins
    // Avoid relationship queries to prevent schema cache issues
    const { data: sample, error: sampleError } = await supabaseClient
      .from('samples')
      .select('*')
      .eq('id', sampleId)
      .single();

    if (sampleError) throw sampleError;
    if (!sample) throw new Error('Sample request not found');

    // Fetch related data separately
    let brandName = 'Unknown Brand';
    let factoryName = 'Unknown Factory';
    let repData = null;

    // Get brand information
    if (sample.brand_id) {
      const { data: brand, error: brandError } = await supabaseClient
        .from('brands')
        .select('name')
        .eq('id', sample.brand_id)
        .single();
      
      if (brandError) {
        console.warn('Brand lookup failed:', brandError.message);
      } else if (brand) {
        brandName = brand.name;
      } else {
        console.warn('Brand not found for ID:', sample.brand_id);
      }
    } else {
      console.warn('Sample has no brand_id');
    }

    // Get factory information
    if (sample.factory_id) {
      const { data: factory, error: factoryError } = await supabaseClient
        .from('factories')
        .select('name')
        .eq('id', sample.factory_id)
        .single();
      
      if (factoryError) {
        console.warn('Factory lookup failed:', factoryError.message);
      } else if (factory) {
        factoryName = factory.name;
      } else {
        console.warn('Factory not found for ID:', sample.factory_id);
      }
    } else {
      console.warn('Sample has no factory_id');
    }

    // Get rep information
    if (sample.rep_id) {
      const { data: rep, error: repError } = await supabaseClient
        .from('reps')
        .select('user_id, name, email')
        .eq('id', sample.rep_id)
        .single();
      
      if (repError) {
        console.warn('Rep lookup failed:', repError.message);
      } else if (rep) {
        repData = rep;
      } else {
        console.warn('Rep not found for ID:', sample.rep_id);
      }
    } else {
      console.warn('Sample has no rep_id');
    }

    // Validate that we have the required data
    if (!repData) {
      throw new Error('No rep assigned to this sample request');
    }

    if (!sample.brand_id) {
      throw new Error('Brand information not found');
    }

    if (!sample.factory_id) {
      throw new Error('Factory information not found');
    }

    // Create notification for the sales rep
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: repData.user_id,
        title: 'New Sample Request',
        message: `${brandName} has requested a sample from ${factoryName}`,
        type: 'sample_request',
        metadata: {
          sample_id: sampleId,
          brand_id: sample.brand_id,
          factory_id: sample.factory_id
        }
      });

    if (notificationError) throw notificationError;

    // Get rep's push tokens
    let repTokens = [];
    try {
      const { data: tokens, error: repTokensError } = await supabaseClient
        .from('user_push_tokens')
        .select('token')
        .eq('user_id', repData.user_id);

      if (repTokensError) {
        console.warn('Push tokens lookup failed:', repTokensError.message);
      } else if (tokens) {
        repTokens = tokens;
      }
    } catch (error) {
      console.warn('user_push_tokens table might not exist:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Send push notification to rep
    let pushSent = false;
    if (repTokens && repTokens.length > 0) {
      await sendPush(
        repTokens.map((t: { token: string }) => t.token),
        'New Sample Request',
        `${brandName} has requested a sample from ${factoryName}`
      );
      pushSent = true;
    }

    // Send email notification to rep
    let emailSent = false;
    if (repData.email) {
      emailSent = await sendSampleRequestEmail(repData.email, {
        brandName: brandName,
        factoryName: factoryName,
        productName: sample.product_name,
        quantity: sample.quantity,
        preferredMoq: sample.preferred_moq,
        deliveryAddress: sample.delivery_address,
        comments: sample.comments,
        finishNotes: sample.finish_notes,
        sampleId: sample.id,
        appUrl: Deno.env.get('APP_URL'),
      });
    } else {
      console.warn('No email found for rep:', repData.user_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        notifications_sent: {
          in_app: true,
          push: pushSent,
          email: emailSent
        },
        sample_id: sampleId,
        rep_id: repData.user_id,
        rep_email: repData.email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error processing sample request notification:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 