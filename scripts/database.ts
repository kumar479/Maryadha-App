import { supabase } from '@/lib/supabase';

async function runDatabaseTests() {
  console.log('Starting database tests...\n');

  // Test 1: Check Reps table
  try {
    const { data: reps, error: repsError } = await supabase
      .from('reps')
      .select(`
        id,
        name,
        email,
        active,
        user:user_id (email)
      `);
    
    console.log('Reps table test:');
    if (repsError) throw repsError;
    console.log(`Found ${reps?.length || 0} reps`);
    if (reps?.length) console.log('Sample rep:', reps[0]);
  } catch (err) {
    console.error('Reps table error:', err);
  }

  // Test 2: Check Brands table
  try {
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*');
    
    console.log('\nBrands table test:');
    if (brandsError) throw brandsError;
    console.log(`Found ${brands?.length || 0} brands`);
    if (brands?.length) console.log('Sample brand:', brands[0]);
  } catch (err) {
    console.error('Brands table error:', err);
  }

  // Test 3: Check Factories table
  try {
    const { data: factories, error: factoriesError } = await supabase
      .from('factories')
      .select('*');
    
    console.log('\nFactories table test:');
    if (factoriesError) throw factoriesError;
    console.log(`Found ${factories?.length || 0} factories`);
    if (factories?.length) console.log('Sample factory:', factories[0]);
  } catch (err) {
    console.error('Factories table error:', err);
  }

  // Test 4: Check Orders with relationships
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        quantity,
        unit_price,
        total_amount,
        currency,
        payment_status,
        brand:brand_id (name, email),
        factory:factory_id (name),
        rep:rep_id (name)
      `);
    
    console.log('\nOrders relationship test:');
    if (ordersError) throw ordersError;
    console.log(`Found ${orders?.length || 0} orders`);
    if (orders?.length) console.log('Sample order with relationships:', orders[0]);
  } catch (err) {
    console.error('Orders relationship error:', err);
  }

  // Test 5: Check Samples with relationships
  try {
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select(`
        id,
        status,
        brand:brand_id (name),
        factory:factory_id (name),
        rep:rep_id (name)
      `);
    
    console.log('\nSamples relationship test:');
    if (samplesError) throw samplesError;
    console.log(`Found ${samples?.length || 0} samples`);
    if (samples?.length) console.log('Sample request:', samples[0]);
  } catch (err) {
    console.error('Samples relationship error:', err);
  }

  // Test 6: Check Messages with relationships
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        text,
        created_at,
        sender:sender_id (email),
        receiver:receiver_id (email)
      `);
    
    console.log('\nMessages relationship test:');
    if (messagesError) throw messagesError;
    console.log(`Found ${messages?.length || 0} messages`);
    if (messages?.length) console.log('Sample message:', messages[0]);
  } catch (err) {
    console.error('Messages relationship error:', err);
  }

  // Test 7: Check RLS Policies
  try {
    // First try as unauthenticated
    const { data: publicData, error: publicError } = await supabase
      .from('factories')
      .select('name, location')
      .eq('verified', true);
    
    console.log('\nRLS Policy test (unauthenticated):');
    if (publicError) throw publicError;
    console.log('Can access public factory data:', publicData?.length > 0);

    // Then try as authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: privateData, error: privateError } = await supabase
        .from('orders')
        .select('id')
        .eq('brand_id', user.id);

      console.log('\nRLS Policy test (authenticated):');
      if (privateError) throw privateError;
      console.log('Can access private order data:', privateData?.length >= 0);
    }
  } catch (err) {
    console.error('RLS policy test error:', err);
  }

  console.log('\nDatabase tests completed.');
}

// Run the tests
runDatabaseTests();