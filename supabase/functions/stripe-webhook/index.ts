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
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Update payment intent status
        await supabase
          .from('stripe_payment_intents')
          .update({ status: paymentIntent.status })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (paymentIntent.metadata?.sampleId) {
          await supabase
            .from('sample_payments')
            .update({ status: 'paid' })
            .eq('stripe_payment_intent_id', paymentIntent.id);
          await supabase
            .from('samples')
            .update({ status: 'sample_paid' })
            .eq('id', paymentIntent.metadata.sampleId);

          // Create or link WhatsApp group chat for the sample
          await supabase.functions.invoke('create-sample-chat', {
            body: { sampleId: paymentIntent.metadata.sampleId }
          });
        } else {
          await supabase
            .from('orders')
            .update({ payment_status: 'paid' })
            .eq('stripe_payment_intent_id', paymentIntent.id);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        await supabase
          .from('stripe_payment_intents')
          .update({ 
            status: paymentIntent.status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      // Add more event handlers as needed
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});