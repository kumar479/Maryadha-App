import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from './utils/env-validation';

async function testFactoryAccess() {
  try {
    console.log('Validating environment configuration...');
    const config = getEnvConfig();
    console.log('Environment configuration is valid');

    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

    // Test factory ID from your URL
    const testFactoryId = 'd4027467-0d17-48be-940a-1fadce4c4384';

    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('factories')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('Connection Error:', connectionError);
      return;
    }

    console.log('Successfully connected to Supabase!');

    // Test RLS policies
    console.log('Testing RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('factories')
      .select('id')
      .limit(1);

    if (rlsError) {
      console.error('RLS Policy Error:', rlsError);
      return;
    }

    console.log('RLS policies are working correctly');

    // Test specific factory access
    console.log(`Testing access to factory ${testFactoryId}...`);
    const { data: factory, error: factoryError } = await supabase
      .from('factories')
      .select(`
        *,
        rep:rep_id (*)
      `)
      .eq('id', testFactoryId)
      .single();

    if (factoryError) {
      console.error('Factory Access Error:', factoryError);
      return;
    }

    if (!factory) {
      console.error('Factory not found');
      return;
    }

    console.log('Successfully accessed factory:', factory);

  } catch (err) {
    console.error('Test failed:', err);
  }
}

testFactoryAccess(); 