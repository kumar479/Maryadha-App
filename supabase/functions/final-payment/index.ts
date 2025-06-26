import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        brands (id, email),
        stripe_customers (stripe_customer_id)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Calculate final payment amount (70% of total)
    const finalAmount = Math.round(order.total_amount * 0.7 * 100); // Convert to cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: order.currency.toLowerCase(),
      customer: order.stripe_customers.stripe_customer_id,
      metadata: {
        orderId: order.id,
        paymentType: 'final'
      }
    });

    // Store payment intent
    const { error: paymentRecordError } = await supabase
      .from('order_payments')
      .insert({
        order_id: orderId,
        amount: finalAmount / 100, // Convert back to dollars
        payment_type: 'final',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      });

    if (paymentRecordError) throw paymentRecordError;

    // Create notification for brand
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: order.brands.id,
        title: 'Final Payment Required',
        message: 'Your order has been delivered. Please complete the final payment.',
        type: 'payment_request',
        metadata: {
          order_id: orderId,
          payment_intent_id: paymentIntent.id,
          amount: finalAmount / 100
        }
      });

    if (notificationError) throw notificationError;

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error processing final payment:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});