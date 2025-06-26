import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Twilio from 'npm:twilio@4.0.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sampleId } = await req.json();
    if (!sampleId) throw new Error('sampleId is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existing, error: existingError } = await supabase
      .from('group_chats')
      .select('id')
      .eq('sample_id', sampleId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return new Response(
        JSON.stringify({ success: true, chatId: existing.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const { data: sample, error: sampleError } = await supabase
      .from('samples')
      .select('brand_id, factory_id, rep_id')
      .eq('id', sampleId)
      .single();

    if (sampleError || !sample) throw sampleError;

    const { data: chat, error: chatError } = await supabase
      .from('group_chats')
      .insert({
        sample_id: sampleId,
        brand_id: sample.brand_id,
        factory_id: sample.factory_id,
      })
      .select()
      .single();

    if (chatError) throw chatError;

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { chat_id: chat.id, user_id: sample.brand_id, role: 'brand' },
        { chat_id: chat.id, user_id: sample.factory_id, role: 'manufacturer' },
        { chat_id: chat.id, user_id: sample.rep_id, role: 'rep' }
      ]);

    if (participantsError) throw participantsError;

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') ?? '';
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
    const proxyNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') ?? '';
    const factoryNumber = Deno.env.get('FACTORY_WHATSAPP_NUMBER');
    const twilio = Twilio(accountSid, authToken);

    const conversation = await twilio.conversations.v1.conversations.create({
      friendlyName: `sample-${sampleId}`
    });

    if (factoryNumber) {
      await twilio.conversations
        .v1.conversations(conversation.sid)
        .participants.create({
          'messagingBinding.address': `whatsapp:${factoryNumber}`,
          'messagingBinding.proxyAddress': `whatsapp:${proxyNumber}`,
        });
    }

    await twilio.conversations
      .v1.conversations(conversation.sid)
      .participants.create({ identity: sample.brand_id });

    await twilio.conversations
      .v1.conversations(conversation.sid)
      .participants.create({ identity: sample.rep_id });

    await supabase
      .from('group_chats')
      .update({ external_id: conversation.sid })
      .eq('id', chat.id);

    return new Response(
      JSON.stringify({ success: true, chatId: chat.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('Error creating sample chat:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
