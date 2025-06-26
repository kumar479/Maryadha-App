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
    const { orderId, trackingNumber } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update order status and tracking number
    const { error: updateError } = await supabase.rpc(
      'update_order_status',
      {
        order_id: orderId,
        new_status: 'shipped',
        notes: `Order shipped with tracking number: ${trackingNumber}`
      }
    );

    if (updateError) throw updateError;

    // Update tracking number
    const { error: trackingError } = await supabase
      .from('orders')
      .update({ tracking_number: trackingNumber })
      .eq('id', orderId);

    if (trackingError) throw trackingError;

    // Get order details for notifications
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        brands (id, email),
        reps (id, user_id)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Create notification for brand
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: order.brands.id,
        title: 'Order Shipped',
        message: `Your order is on the way! Track it here: ${trackingNumber}`,
        type: 'order_shipped',
        metadata: {
          order_id: orderId,
          tracking_number: trackingNumber
        }
      });

    if (notificationError) throw notificationError;

    const { data: brandTokens, error: brandTokensError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', order.brands.id);

    if (brandTokensError) throw brandTokensError;

    await sendPush(
      brandTokens.map((t: { token: string }) => t.token),
      'Order Shipped',
      `Your order is on the way! Track it here: ${trackingNumber}`
    );

    // Create notification for rep
    const { error: repNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: order.reps.user_id,
        title: 'Order Shipped - Follow Up Required',
        message: `Order ${orderId} has been shipped. Please confirm shipping details with the manufacturer.`,
        type: 'rep_followup',
        metadata: {
          order_id: orderId,
          tracking_number: trackingNumber
        }
      });

    if (repNotificationError) throw repNotificationError;

    const { data: repTokens, error: repTokensError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', order.reps.user_id);

    if (repTokensError) throw repTokensError;

    await sendPush(
      repTokens.map((t: { token: string }) => t.token),
      'Order Shipped - Follow Up Required',
      `Order ${orderId} has been shipped. Please confirm shipping details with the manufacturer.`
    );

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error processing shipping notification:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
