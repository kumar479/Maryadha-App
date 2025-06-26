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
    const { orderId, status, notes } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch current order status
    const { data: current, error: currentError } = await supabase
      .from('orders')
      .select('status, rep_id')
      .eq('id', orderId)
      .single();

    if (currentError) throw currentError;

    // Update order status using the database function
    const { error: updateError } = await supabase.rpc('update_order_status', {
      order_id: orderId,
      new_status: status,
      notes: notes || null,
    });

    if (updateError) throw updateError;

    // Manage quality check transitions
    if (status === 'quality_check' && current.status !== 'quality_check') {
      await supabase.from('order_quality_checks').insert({
        order_id: orderId,
        rep_id: current.rep_id,
        status: 'in_progress',
      });
    }

    if (current.status === 'quality_check' && status !== 'quality_check') {
      await supabase
        .from('order_quality_checks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('order_id', orderId);
    }

    // Get order details for notifications
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        brands (email),
        factories (name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Handle payment-related status changes
    if (status === 'confirmed') {
      // Create payment record for upfront payment
      const upfrontAmount = order.total_amount * 0.3; // 30% upfront
      
      await supabase
        .from('order_payments')
        .insert({
          order_id: orderId,
          amount: upfrontAmount,
          payment_type: 'upfront',
          status: 'pending',
        });

      // Send payment request to brand
      // In a real app, this would trigger an email/notification
      console.log(`Payment request sent to ${order.brands.email} for ${upfrontAmount}`);
    }

    // Send WhatsApp notification if configured
    if (status === 'in_production' || status === 'quality_check' || status === 'shipped') {
      // In a real app, this would use WhatsApp Business API
      console.log(`WhatsApp notification would be sent for order ${orderId}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error updating order status:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});