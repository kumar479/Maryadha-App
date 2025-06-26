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
    const { sampleId, message } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get sample details
    const { data: sample, error: sampleError } = await supabase
      .from('samples')
      .select('*, brands(name, email)')
      .eq('id', sampleId)
      .single();

    if (sampleError || !sample) throw new Error('Sample not found');

    // Update sample status
    const { error: updateError } = await supabase
      .from('samples')
      .update({ status: 'in_review' })
      .eq('id', sampleId);

    if (updateError) throw updateError;

    // Update assignment status
    const { error: assignmentError } = await supabase
      .from('sample_assignments')
      .update({ status: 'forwarded' })
      .eq('sample_id', sampleId);

    if (assignmentError) throw assignmentError;

    // Send WhatsApp message to manufacturer
    // This would integrate with WhatsApp Business API
    const whatsappMessage = `New sample request from ${sample.brands.name}:\n\n${message}\n\nPlease check the attached tech pack and respond through the Maryadha platform.`;

    // In a real implementation, you would:
    // 1. Use WhatsApp Business API to send the message
    // 2. Attach the tech pack file
    // 3. Handle delivery status

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Sample request forwarded to manufacturer'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error forwarding to manufacturer:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});