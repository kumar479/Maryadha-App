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
    const { sampleId, customerId, amount, paymentType, currency, dueDate } = await req.json();
    console.log('Received payload:', { sampleId, customerId, amount, paymentType, currency, dueDate });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get sample and brand details
    const { data: sample, error: sampleError } = await supabase
      .from('samples')
      .select('*, brands (id, email, name)')
      .eq('id', sampleId)
      .single();

    if (sampleError || !sample) {
      console.error('Sample not found', sampleError);
      return new Response(JSON.stringify({ error: 'Sample not found' }), { headers: corsHeaders, status: 400 });
    }

    // Ensure Stripe customer exists
    let stripeCustomerId;
    let stripeCustomerRowId;
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('id, stripe_customer_id')
      .eq('user_id', customerId)
      .single();

    if (customer) {
      stripeCustomerId = customer.stripe_customer_id;
      stripeCustomerRowId = customer.id;
    } else {
      let email = sample.brands?.email;
      let name = sample.brands?.name;
      if (!email || !name) {
        const { data: userData } = await supabase
          .from('brands')
          .select('email, name')
          .eq('id', customerId)
          .single();
        email = userData?.email;
        name = userData?.name;
      }
      const stripeCustomer = await stripe.customers.create({
        email,
        name,
        metadata: { supabaseUserId: customerId },
      });
      await supabase.from('stripe_customers').insert({
        user_id: customerId,
        stripe_customer_id: stripeCustomer.id,
      });
      // Fetch the new row's id
      const { data: newCustomer } = await supabase
        .from('stripe_customers')
        .select('id, stripe_customer_id')
        .eq('user_id', customerId)
        .single();
      stripeCustomerId = stripeCustomer.id;
      stripeCustomerRowId = newCustomer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: (currency || 'usd').toLowerCase(),
      customer: stripeCustomerId,
      metadata: {
        sampleId: sampleId,
        brandId: sample.brand_id ?? customerId,
        paymentType,
      },
    });
    console.log('Stripe payment intent created:', paymentIntent.id);

    // Insert into stripe_payment_intents table to satisfy FK constraint
    const { error: intentInsertError } = await supabase.from('stripe_payment_intents').insert({
      stripe_payment_intent_id: paymentIntent.id,
      customer_id: stripeCustomerRowId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      order_id: null,
      payment_method: null,
      // created_at and updated_at will use default values
    });
    if (intentInsertError) {
      console.error('Error inserting into stripe_payment_intents:', intentInsertError);
      return new Response(JSON.stringify({ error: 'Failed to insert payment intent' }), { headers: corsHeaders, status: 400 });
    }

    // Insert payment record (new table) and update sample
    const { error: paymentInsertError } = await supabase.from('sample_payments').insert({
      sample_id: sampleId,
      amount: amount,
      payment_type: paymentType,
      stripe_payment_intent_id: paymentIntent.id,
      due_date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : null,
      status: 'pending',
    });
    if (paymentInsertError) {
      console.error('Error inserting payment:', paymentInsertError);
      return new Response(JSON.stringify({ error: 'Failed to insert payment' }), { headers: corsHeaders, status: 400 });
    }
    console.log('Inserted payment record for sample:', sampleId);

    // Update sample with payment intent
    const updateData: Record<string, unknown> = {};
    if (paymentType === 'deposit') {
      updateData.status = 'invoice_sent';
    }
    const { error: sampleUpdateError } = await supabase
      .from('samples')
      .update(updateData)
      .eq('id', sampleId);
    if (sampleUpdateError) {
      console.error('Error updating sample:', sampleUpdateError);
      return new Response(JSON.stringify({ error: 'Failed to update sample' }), { headers: corsHeaders, status: 400 });
    }
    console.log('Sample updated successfully:', sampleId);

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error creating sample payment:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
