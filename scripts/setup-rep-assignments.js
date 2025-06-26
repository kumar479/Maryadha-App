/**
 * Setup script for rep assignments
 * 
 * This script helps set up the database for the notification system by:
 * 1. Adding rep_id column to factories table if missing
 * 2. Assigning reps to factories that don't have one
 * 3. Verifying the setup is correct
 * 
 * Usage:
 * node scripts/setup-rep-assignments.js
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

async function setupRepAssignments() {
  console.log('🔧 Setting up Rep Assignments for Notification System\n');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl}\n`);

  try {
    // Step 1: Check if factories table has rep_id column
    console.log('1. Checking factories table schema...');
    try {
      const { data: factoryTest, error: factoryError } = await supabase
        .from('factories')
        .select('rep_id')
        .limit(1);
      
      if (factoryError && factoryError.message.includes('rep_id')) {
        console.log('   ⚠️  Factories table missing rep_id column');
        console.log('   Please run the migration: 20250702000000_add_rep_id_to_factories.sql');
        console.log('   Command: supabase db push');
        return;
      } else {
        console.log('   ✅ Factories table has rep_id column');
      }
    } catch (err) {
      console.log('   ❌ Could not check factories table schema');
      return;
    }

    // Step 2: Get all factories and their current rep assignments
    console.log('\n2. Checking current factory assignments...');
    const { data: factories, error: factoriesError } = await supabase
      .from('factories')
      .select('id, name, rep_id');

    if (factoriesError) {
      throw new Error(`Failed to fetch factories: ${factoriesError.message}`);
    }

    console.log(`   Found ${factories.length} factories`);
    
    const factoriesWithRep = factories.filter(f => f.rep_id);
    const factoriesWithoutRep = factories.filter(f => !f.rep_id);
    
    console.log(`   Factories with rep: ${factoriesWithRep.length}`);
    console.log(`   Factories without rep: ${factoriesWithoutRep.length}`);

    // Step 3: Get available reps
    console.log('\n3. Getting available reps...');
    const { data: reps, error: repsError } = await supabase
      .from('reps')
      .select('id, name, email, active')
      .eq('active', true);

    if (repsError) {
      throw new Error(`Failed to fetch reps: ${repsError.message}`);
    }

    console.log(`   Found ${reps.length} active reps`);
    reps.forEach(rep => {
      console.log(`   - ${rep.name} (${rep.email})`);
    });

    if (reps.length === 0) {
      console.log('   ❌ No active reps found');
      console.log('   Please create some reps first');
      return;
    }

    // Step 4: Assign reps to factories that don't have one
    if (factoriesWithoutRep.length > 0) {
      console.log('\n4. Assigning reps to factories...');
      
      let repIndex = 0;
      for (const factory of factoriesWithoutRep) {
        const rep = reps[repIndex % reps.length]; // Round-robin assignment
        
        console.log(`   Assigning ${rep.name} to ${factory.name}`);
        
        const { error: updateError } = await supabase
          .from('factories')
          .update({ rep_id: rep.id })
          .eq('id', factory.id);

        if (updateError) {
          console.log(`   ❌ Failed to assign rep to ${factory.name}: ${updateError.message}`);
        } else {
          console.log(`   ✅ Successfully assigned ${rep.name} to ${factory.name}`);
        }
        
        repIndex++;
      }
    } else {
      console.log('\n4. All factories already have reps assigned');
    }

    // Step 5: Verify assignments
    console.log('\n5. Verifying assignments...');
    
    // First get all factories with their rep_id
    const { data: updatedFactories, error: verifyError } = await supabase
      .from('factories')
      .select('id, name, rep_id');

    if (verifyError) {
      throw new Error(`Failed to verify assignments: ${verifyError.message}`);
    }

    // Then get all reps for the rep_ids we found
    const repIds = [...new Set(updatedFactories.filter(f => f.rep_id).map(f => f.rep_id))];
    let repsData = {};
    
    if (repIds.length > 0) {
      const { data: repsForVerification, error: repsVerifyError } = await supabase
        .from('reps')
        .select('id, name, email')
        .in('id', repIds);

      if (repsVerifyError) {
        console.log('   ⚠️  Could not fetch reps for verification:', repsVerifyError.message);
      } else {
        // Create a lookup map
        repsData = repsForVerification.reduce((acc, rep) => {
          acc[rep.id] = rep;
          return acc;
        }, {});
      }
    }

    console.log('\n📋 Factory Assignments Summary:');
    updatedFactories.forEach(factory => {
      if (factory.rep_id && repsData[factory.rep_id]) {
        const rep = repsData[factory.rep_id];
        console.log(`   ✅ ${factory.name} → ${rep.name} (${rep.email})`);
      } else if (factory.rep_id) {
        console.log(`   ⚠️  ${factory.name} → Rep ID exists but rep not found: ${factory.rep_id}`);
      } else {
        console.log(`   ❌ ${factory.name} → No rep assigned`);
      }
    });

    // Step 6: Check sample requests
    console.log('\n6. Checking sample requests...');
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select('id, product_name, rep_id');

    if (samplesError) {
      console.log('   ⚠️  Could not fetch samples:', samplesError.message);
    } else {
      console.log(`   Found ${samples.length} sample requests`);
      
      const samplesWithRep = samples.filter(s => s.rep_id);
      const samplesWithoutRep = samples.filter(s => !s.rep_id);
      
      console.log(`   Samples with rep: ${samplesWithRep.length}`);
      console.log(`   Samples without rep: ${samplesWithoutRep.length}`);
      
      if (samplesWithoutRep.length > 0) {
        console.log('   ⚠️  Some sample requests don\'t have reps assigned');
        console.log('   These will fail when trying to send notifications');
      }
      
      // Show sample requests with their rep assignments
      if (samplesWithRep.length > 0) {
        console.log('\n📋 Sample Request Assignments:');
        const sampleRepIds = [...new Set(samplesWithRep.map(s => s.rep_id))];
        
        if (sampleRepIds.length > 0) {
          const { data: sampleReps, error: sampleRepsError } = await supabase
            .from('reps')
            .select('id, name, email')
            .in('id', sampleRepIds);

          if (!sampleRepsError && sampleReps) {
            const sampleRepsMap = sampleReps.reduce((acc, rep) => {
              acc[rep.id] = rep;
              return acc;
            }, {});
            
            samplesWithRep.forEach(sample => {
              const rep = sampleRepsMap[sample.rep_id];
              if (rep) {
                console.log(`   ✅ ${sample.product_name || 'Unnamed Product'} → ${rep.name} (${rep.email})`);
              } else {
                console.log(`   ⚠️  ${sample.product_name || 'Unnamed Product'} → Rep not found: ${sample.rep_id}`);
              }
            });
          }
        }
      }
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the notification system: node scripts/test-email-notification.js');
    console.log('2. Create a sample request to test the full flow');
    console.log('3. Check that reps receive notifications');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the setup
setupRepAssignments(); 