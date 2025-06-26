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
    const { orderId, certificateUrl } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Archive the order
    const { data: archivedOrder, error: archiveError } = await supabase
      .rpc('archive_order', {
        p_order_id: orderId,
        p_certificate_url: certificateUrl
      });

    if (archiveError) throw archiveError;

    // Get order details for notifications
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        brands (id, email),
        factories (id, name),
        reps (id, user_id)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Create notification for brand
    const { error: brandNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: order.brands.id,
        title: 'Order Completed',
        message: `Your order with ${order.factories.name} has been completed and archived.`,
        type: 'order_completed',
        metadata: {
          order_id: orderId,
          archived_order_id: archivedOrder,
          certificate_url: certificateUrl
        }
      });

    if (brandNotificationError) throw brandNotificationError;

    // Create notification for rep about follow-up
    const { error: repNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: order.reps.user_id,
        title: 'Follow-up Scheduled',
        message: `Follow-up for order ${orderId} has been scheduled for 30 days from now.`,
        type: 'followup_scheduled',
        metadata: {
          order_id: orderId,
          archived_order_id: archivedOrder
        }
      });

    if (repNotificationError) throw repNotificationError;

    return new Response(
      JSON.stringify({ success: true, archivedOrderId: archivedOrder }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error archiving order:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});