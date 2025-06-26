import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { chatId, text, senderId, source, metadata } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store message in database
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        text,
        attachments: metadata?.attachment ? [metadata.attachment] : [],
        event: 'message',
        topic: 'chat',
        extension: metadata?.attachment ? 'image' : 'text',
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Get chat participants for notifications
    const { data: participants, error: participantsError } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('chat_id', chatId)
      .neq('user_id', senderId);

    if (participantsError) throw participantsError;

    // Create notifications for other participants
    const notifications = participants.map(participant => ({
      message_id: message.id,
      recipient_id: participant.user_id,
    }));

    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('message_notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;
    }

    // If message is from app, sync to WhatsApp
    if (source === 'app') {
      // Get chat details for WhatsApp sync
      const { data: chat, error: chatError } = await supabase
        .from('group_chats')
        .select(`
          *,
          orders (
            brand_id,
            factory_id
          )
        `)
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;

      // Get phone numbers for WhatsApp
      const { data: phones, error: phonesError } = await supabase
        .from('user_contacts')
        .select('phone')
        .in('user_id', [chat.orders.brand_id, chat.orders.factory_id]);

      if (phonesError) throw phonesError;

      // Send to WhatsApp (mock implementation)
      for (const { phone } of phones) {
        console.log(`Would send WhatsApp message to ${phone}: ${text}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error syncing message:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});