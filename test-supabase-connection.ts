import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('factories')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('Connection Error:', connectionError.message);
      return;
    }

    console.log('Successfully connected to Supabase!');

    // Test factory data fetch
    const { data: factory, error: factoryError } = await supabase
      .from('factories')
      .select(`
        *,
        rep:rep_id (*)
      `)
      .limit(1);

    if (factoryError) {
      console.error('Factory Fetch Error:', factoryError.message);
      return;
    }

    console.log('Successfully fetched factory data:', factory);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSupabaseConnection(); 