/**
 * Debug script for sample request issues
 * 
 * This script helps debug issues with sample requests, brand lookups,
 * and database schema problems.
 * 
 * Usage:
 * node scripts/debug-sample-request.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

// Try to load from .env first, then .env.local
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
} else {
  console.log('⚠️  No .env or .env.local file found, using system environment variables');
}

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSampleRequest() {
  console.log('🔍 Debugging Sample Request Issues\n');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl}\n`);

  try {
    // Step 1: Get a sample request
    console.log('1. Fetching sample request...');
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select('*')
      .limit(1);

    if (samplesError) {
      throw new Error(`Failed to fetch samples: ${samplesError.message}`);
    }

    if (!samples || samples.length === 0) {
      console.log('⚠️  No sample requests found');
      return;
    }

    const sample = samples[0];
    console.log(`   ✅ Found sample: ${sample.id}`);
    console.log(`   Product: ${sample.product_name || 'Unnamed'}`);
    console.log(`   Brand ID: ${sample.brand_id || 'NULL'}`);
    console.log(`   Factory ID: ${sample.factory_id || 'NULL'}`);
    console.log(`   Rep ID: ${sample.rep_id || 'NULL'}`);

    // Step 2: Check brands table
    console.log('\n2. Checking brands table...');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, email')
      .limit(5);

    if (brandsError) {
      console.log('   ❌ Brands table error:', brandsError.message);
    } else {
      console.log(`   ✅ Found ${brands.length} brands`);
      brands.forEach(brand => {
        console.log(`      - ${brand.name} (${brand.email}) - ID: ${brand.id}`);
      });
    }

    // Step 3: Check if the sample's brand exists
    if (sample.brand_id) {
      console.log('\n3. Checking sample brand...');
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id, name, email')
        .eq('id', sample.brand_id)
        .single();

      if (brandError) {
        console.log('   ❌ Brand lookup failed:', brandError.message);
      } else if (brand) {
        console.log('   ✅ Brand found:', brand.name);
      } else {
        console.log('   ❌ Brand not found for ID:', sample.brand_id);
      }
    } else {
      console.log('\n3. Sample has no brand_id');
    }

    // Step 4: Check factories table
    console.log('\n4. Checking factories table...');
    const { data: factories, error: factoriesError } = await supabase
      .from('factories')
      .select('id, name, rep_id')
      .limit(5);

    if (factoriesError) {
      console.log('   ❌ Factories table error:', factoriesError.message);
    } else {
      console.log(`   ✅ Found ${factories.length} factories`);
      factories.forEach(factory => {
        console.log(`      - ${factory.name} - Rep ID: ${factory.rep_id || 'NULL'}`);
      });
    }

    // Step 5: Check if the sample's factory exists
    if (sample.factory_id) {
      console.log('\n5. Checking sample factory...');
      const { data: factory, error: factoryError } = await supabase
        .from('factories')
        .select('id, name, rep_id')
        .eq('id', sample.factory_id)
        .single();

      if (factoryError) {
        console.log('   ❌ Factory lookup failed:', factoryError.message);
      } else if (factory) {
        console.log('   ✅ Factory found:', factory.name);
        console.log('   Rep ID:', factory.rep_id || 'NULL');
      } else {
        console.log('   ❌ Factory not found for ID:', sample.factory_id);
      }
    } else {
      console.log('\n5. Sample has no factory_id');
    }

    // Step 6: Check reps table
    console.log('\n6. Checking reps table...');
    const { data: reps, error: repsError } = await supabase
      .from('reps')
      .select('id, name, email, user_id')
      .limit(5);

    if (repsError) {
      console.log('   ❌ Reps table error:', repsError.message);
    } else {
      console.log(`   ✅ Found ${reps.length} reps`);
      reps.forEach(rep => {
        console.log(`      - ${rep.name} (${rep.email}) - User ID: ${rep.user_id || 'NULL'}`);
      });
    }

    // Step 7: Check if the sample's rep exists
    if (sample.rep_id) {
      console.log('\n7. Checking sample rep...');
      const { data: rep, error: repError } = await supabase
        .from('reps')
        .select('id, name, email, user_id')
        .eq('id', sample.rep_id)
        .single();

      if (repError) {
        console.log('   ❌ Rep lookup failed:', repError.message);
      } else if (rep) {
        console.log('   ✅ Rep found:', rep.name);
        console.log('   Email:', rep.email);
        console.log('   User ID:', rep.user_id || 'NULL');
      } else {
        console.log('   ❌ Rep not found for ID:', sample.rep_id);
      }
    } else {
      console.log('\n7. Sample has no rep_id');
    }

    // Step 8: Check notifications table
    console.log('\n8. Checking notifications table...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(3);

    if (notificationsError) {
      console.log('   ❌ Notifications table error:', notificationsError.message);
    } else {
      console.log(`   ✅ Found ${notifications.length} notifications`);
      notifications.forEach(notification => {
        console.log(`      - ${notification.title}: ${notification.message}`);
        console.log(`        Type: ${notification.type}, User ID: ${notification.user_id}`);
      });
    }

    // Step 9: Check user_push_tokens table
    console.log('\n9. Checking user_push_tokens table...');
    try {
      const { data: tokens, error: tokensError } = await supabase
        .from('user_push_tokens')
        .select('*')
        .limit(3);

      if (tokensError) {
        console.log('   ❌ user_push_tokens table error:', tokensError.message);
      } else {
        console.log(`   ✅ Found ${tokens.length} push tokens`);
        tokens.forEach(token => {
          console.log(`      - User ID: ${token.user_id}, Token: ${token.token?.substring(0, 20)}...`);
        });
      }
    } catch (error) {
      console.log('   ⚠️  user_push_tokens table might not exist:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('\n🎉 Debug completed!');
    console.log('\nRecommendations:');
    console.log('1. If brand is null, check if the sample has a valid brand_id');
    console.log('2. If factory is null, check if the sample has a valid factory_id');
    console.log('3. If rep is null, check if the sample has a valid rep_id');
    console.log('4. Run cleanup script if there are orphaned references: node scripts/cleanup-orphaned-samples.js');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug
debugSampleRequest(); 