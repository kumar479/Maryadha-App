/**
 * Test script for email notification functionality
 * 
 * This script tests the sample-request-notification Edge Function
 * to ensure emails are being sent correctly to reps.
 * 
 * Usage:
 * 1. Set up your environment variables (see email-setup-guide.md)
 * 2. Run: node scripts/test-email-notification.js
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
  console.log('Current values:');
  console.log(`  EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl || 'NOT SET'}`);
  console.log(`  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'NOT SET'}`);
  console.log('\nMake sure your .env file contains:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailNotification() {
  console.log('🧪 Testing Email Notification System\n');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl}\n`);

  try {
    // Step 1: Get a sample request from the database
    console.log('1. Fetching sample request from database...');
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select(`
        id,
        brand_id,
        factory_id,
        rep_id,
        product_name,
        quantity,
        preferred_moq,
        delivery_address,
        comments,
        finish_notes
      `)
      .limit(1);

    if (samplesError) {
      throw new Error(`Failed to fetch samples: ${samplesError.message}`);
    }

    if (!samples || samples.length === 0) {
      console.log('⚠️  No sample requests found in database');
      console.log('   Create a sample request first, then run this test again');
      return;
    }

    const sample = samples[0];
    console.log(`   ✅ Found sample request: ${sample.id}`);
    
    // Fetch related data separately to avoid relationship queries
    let brandName = 'Unknown';
    let factoryName = 'Unknown';
    let repName = 'Unknown';
    let repEmail = 'No email';
    let repUserId = null;
    
    if (sample.brand_id) {
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('name')
        .eq('id', sample.brand_id)
        .single();
      
      if (!brandError && brand) {
        brandName = brand.name;
      }
    }
    
    if (sample.factory_id) {
      const { data: factory, error: factoryError } = await supabase
        .from('factories')
        .select('name')
        .eq('id', sample.factory_id)
        .single();
      
      if (!factoryError && factory) {
        factoryName = factory.name;
      }
    }
    
    if (sample.rep_id) {
      const { data: rep, error: repError } = await supabase
        .from('reps')
        .select('name, email, user_id')
        .eq('id', sample.rep_id)
        .single();
      
      if (!repError && rep) {
        repName = rep.name;
        repEmail = rep.email;
        repUserId = rep.user_id;
      }
    }
    
    console.log(`   Brand: ${brandName}`);
    console.log(`   Factory: ${factoryName}`);
    console.log(`   Rep: ${repName} (${repEmail})`);
    
    // Check if rep is assigned
    if (!sample.rep_id) {
      console.log('   ⚠️  Sample request has no rep assigned');
      console.log('   This will cause the notification to fail');
    }

    // Step 2: Test the Edge Function
    console.log('\n2. Testing Edge Function...');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('   ⚠️  No active session, using anon key');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/sample-request-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
      },
      body: JSON.stringify({ sampleId: sample.id }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Edge Function executed successfully');
      console.log('   Response:', JSON.stringify(result, null, 2));
      
      if (result.notifications_sent) {
        console.log('\n📊 Notification Summary:');
        console.log(`   In-app notification: ${result.notifications_sent.in_app ? '✅' : '❌'}`);
        console.log(`   Push notification: ${result.notifications_sent.push ? '✅' : '❌'}`);
        console.log(`   Email notification: ${result.notifications_sent.email ? '✅' : '❌'}`);
      }
    } else {
      console.log('   ❌ Edge Function failed');
      console.log('   Status:', response.status);
      console.log('   Error:', result.error);
      
      // Provide helpful debugging information
      if (result.error && result.error.includes('No rep assigned')) {
        console.log('\n💡 Debugging Tips:');
        console.log('   - Make sure the sample request has a rep_id assigned');
        console.log('   - Check if the factory has a rep assigned');
        console.log('   - Verify that reps exist in the database');
      }
    }

    // Step 3: Check if notification was created in database
    console.log('\n3. Checking database for notification...');
    if (repUserId) {
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', repUserId)
        .eq('type', 'sample_request')
        .order('created_at', { ascending: false })
        .limit(1);

      if (notificationsError) {
        console.log('   ❌ Failed to fetch notifications:', notificationsError.message);
      } else if (notifications && notifications.length > 0) {
        console.log('   ✅ Notification created in database');
        console.log(`   Title: ${notifications[0].title}`);
        console.log(`   Message: ${notifications[0].message}`);
      } else {
        console.log('   ⚠️  No notification found in database');
      }
    } else {
      console.log('   ⚠️  Cannot check notifications - no rep user_id available');
    }

    // Step 4: Verify environment variables
    console.log('\n4. Checking environment variables...');
    const requiredVars = ['RESEND_API_KEY', 'APP_URL'];
    let allVarsSet = true;

    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: ${varName.includes('KEY') ? '***' + value.slice(-4) : value}`);
      } else {
        console.log(`   ❌ ${varName}: Not set`);
        allVarsSet = false;
      }
    }

    if (!allVarsSet) {
      console.log('\n⚠️  Some environment variables are missing');
      console.log('   See email-setup-guide.md for setup instructions');
    }

    // Step 5: Check database schema
    console.log('\n5. Checking database schema...');
    
    // Check if factories table has rep_id column
    try {
      const { data: factoryTest, error: factoryError } = await supabase
        .from('factories')
        .select('rep_id')
        .limit(1);
      
      if (factoryError && factoryError.message.includes('rep_id')) {
        console.log('   ⚠️  Factories table missing rep_id column');
        console.log('   Run the migration: 20250702000000_add_rep_id_to_factories.sql');
      } else {
        console.log('   ✅ Factories table has rep_id column');
      }
    } catch (err) {
      console.log('   ⚠️  Could not check factories table schema');
    }

    console.log('\n🎉 Test completed!');
    console.log('\nNext steps:');
    console.log('1. Check your email inbox for the notification');
    console.log('2. Check the Supabase Edge Function logs for any errors');
    console.log('3. Verify the notification appears in the rep\'s samples page');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testEmailNotification(); 