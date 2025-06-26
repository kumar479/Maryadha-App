import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { sendPush } from '../_shared/push.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sampleId, repId, type, title, message } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get rep's user ID
    const { data: rep, error: repError } = await supabase
      .from('reps')
      .select('user_id')
      .eq('id', repId)
      .single();

    if (repError) throw repError;

    // Create notification
    const { error: notificationError } = await supabase
      .from('sample_notifications')
      .insert({
        sample_id: sampleId,
        recipient_id: rep.user_id,
        type,
        title,
        message,
      });

    if (notificationError) throw notificationError;

    // Send push notification via FCM
    const { data: tokens, error: tokensError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', rep.user_id);

    if (tokensError) throw tokensError;

    await sendPush(tokens.map((t: { token: string }) => t.token), title, message);

    // In a real app, you could also:
    // - Send email notification
    // - Send WhatsApp notification if configured

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error sending notification:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
