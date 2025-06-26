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
    const { orderId, customerId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', customerId)
      .single();

    if (customer) {
      stripeCustomerId = customer.stripe_customer_id;
    } else {
      const { data: userData } = await supabase
        .from('brands')
        .select('email, name')
        .eq('id', customerId)
        .single();

      const stripeCustomer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.name,
        metadata: {
          supabaseUserId: customerId,
        },
      });

      await supabase.from('stripe_customers').insert({
        user_id: customerId,
        stripe_customer_id: stripeCustomer.id,
      });

      stripeCustomerId = stripeCustomer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_amount * 100), // Convert to cents
      currency: order.currency.toLowerCase(),
      customer: stripeCustomerId,
      metadata: {
        orderId: order.id,
        brandId: order.brand_id,
        factoryId: order.factory_id,
      },
    });

    // Store payment intent in database
    await supabase.from('stripe_payment_intents').insert({
      stripe_payment_intent_id: paymentIntent.id,
      order_id: orderId,
      customer_id: customerId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error creating payment:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});