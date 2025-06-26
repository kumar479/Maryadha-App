import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, source, factoryId, userId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store message in Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          text: message,
          source: source, // 'whatsapp' or 'app'
          factory_id: factoryId,
          user_id: userId,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // If message is from WhatsApp, notify the app
    if (source === 'whatsapp') {
      // Implement real-time notification using Supabase's realtime features
      await supabase
        .from('message_notifications')
        .insert([
          {
            message_id: data.id,
            user_id: userId,
            read: false,
          },
        ]);
    }

    // If message is from app, send to WhatsApp
    if (source === 'app') {
      // Use WhatsApp Business API to send message
      const whatsappResponse = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('WHATSAPP_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: 'RECIPIENT_PHONE_NUMBER',
          type: 'text',
          text: {
            body: message,
          },
        }),
      });

      if (!whatsappResponse.ok) {
        throw new Error('Failed to send WhatsApp message');
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});