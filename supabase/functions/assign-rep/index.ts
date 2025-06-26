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
    const { sampleId, orderId, repId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (sampleId) {
      // Assign rep to sample
      const { error: sampleError } = await supabase
        .from('samples')
        .update({ rep_id: repId })
        .eq('id', sampleId);

      if (sampleError) throw sampleError;

      // Create sample assignment
      const { error: assignmentError } = await supabase
        .from('sample_assignments')
        .insert({
          sample_id: sampleId,
          rep_id: repId,
          status: 'pending'
        });

      if (assignmentError) throw assignmentError;
    }

    if (orderId) {
      // Assign rep to order
      const { error: orderError } = await supabase
        .from('orders')
        .update({ rep_id: repId })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Create order assignment
      const { error: assignmentError } = await supabase
        .from('order_assignments')
        .insert({
          order_id: orderId,
          rep_id: repId,
          status: 'pending'
        });

      if (assignmentError) throw assignmentError;

      // Create group chat for the order
      const { data: chat, error: chatError } = await supabase
        .from('group_chats')
        .insert({ order_id: orderId })
        .select()
        .single();

      if (chatError) throw chatError;

      // Get order details to add participants
      const { data: order, error: orderDetailsError } = await supabase
        .from('orders')
        .select('brand_id, factory_id')
        .eq('id', orderId)
        .single();

      if (orderDetailsError) throw orderDetailsError;

      // Add chat participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: chat.id, user_id: order.brand_id, role: 'brand' },
          { chat_id: chat.id, user_id: order.factory_id, role: 'manufacturer' },
          { chat_id: chat.id, user_id: repId, role: 'rep' }
        ]);

      if (participantsError) throw participantsError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error assigning rep:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});