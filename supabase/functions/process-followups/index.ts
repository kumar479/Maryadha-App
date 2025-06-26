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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending followups that are due
    const { data: followups, error: followupsError } = await supabase
      .from('order_followups')
      .select(`
        *,
        orders (
          id,
          brands (id, email, name),
          reps (id, user_id)
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (followupsError) throw followupsError;

    // Process each followup
    const processedFollowups = await Promise.all(
      followups.map(async (followup) => {
        // Create notification for rep
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: followup.orders.reps.user_id,
            title: 'Follow-up Required',
            message: `Time to follow up with ${followup.orders.brands.name} about their order.`,
            type: 'followup_reminder',
            metadata: {
              followup_id: followup.id,
              order_id: followup.order_id
            }
          });

        if (notificationError) throw notificationError;

        // Update followup status
        const { error: updateError } = await supabase
          .from('order_followups')
          .update({ status: 'in_progress' })
          .eq('id', followup.id);

        if (updateError) throw updateError;

        return followup.id;
      })
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: processedFollowups.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error processing followups:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});