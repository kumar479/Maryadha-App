/**
 * Cleanup script for orphaned sample requests
 * 
 * This script identifies and fixes sample requests that have rep_id values
 * pointing to non-existent reps, which can cause notification failures.
 * 
 * Usage:
 * node scripts/cleanup-orphaned-samples.js
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

async function cleanupOrphanedSamples() {
  console.log('🧹 Cleaning up orphaned sample requests\n');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl}\n`);

  try {
    // Step 1: Get all sample requests with rep_id
    console.log('1. Fetching sample requests with rep_id...');
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select('id, product_name, rep_id, factory_id')
      .not('rep_id', 'is', null);

    if (samplesError) {
      throw new Error(`Failed to fetch samples: ${samplesError.message}`);
    }

    console.log(`   Found ${samples.length} sample requests with rep_id`);

    // Step 2: Get all valid rep IDs
    console.log('\n2. Fetching valid rep IDs...');
    const { data: reps, error: repsError } = await supabase
      .from('reps')
      .select('id, name, email');

    if (repsError) {
      throw new Error(`Failed to fetch reps: ${repsError.message}`);
    }

    const validRepIds = new Set(reps.map(rep => rep.id));
    console.log(`   Found ${reps.length} valid reps`);

    // Step 3: Identify orphaned samples
    console.log('\n3. Identifying orphaned samples...');
    const orphanedSamples = samples.filter(sample => !validRepIds.has(sample.rep_id));
    
    console.log(`   Found ${orphanedSamples.length} orphaned sample requests`);
    
    if (orphanedSamples.length === 0) {
      console.log('   ✅ No orphaned samples found');
      return;
    }

    // Display orphaned samples
    console.log('\n📋 Orphaned Sample Requests:');
    orphanedSamples.forEach(sample => {
      console.log(`   ❌ ${sample.product_name || 'Unnamed Product'} (ID: ${sample.id})`);
      console.log(`       Rep ID: ${sample.rep_id} (does not exist)`);
    });

    // Step 4: Get factory assignments to reassign orphaned samples
    console.log('\n4. Getting factory assignments...');
    const { data: factories, error: factoriesError } = await supabase
      .from('factories')
      .select('id, name, rep_id');

    if (factoriesError) {
      throw new Error(`Failed to fetch factories: ${factoriesError.message}`);
    }

    // Create factory to rep mapping
    const factoryRepMap = {};
    factories.forEach(factory => {
      if (factory.rep_id && validRepIds.has(factory.rep_id)) {
        factoryRepMap[factory.id] = factory.rep_id;
      }
    });

    console.log(`   Found ${Object.keys(factoryRepMap).length} factories with valid reps`);

    // Step 5: Fix orphaned samples
    console.log('\n5. Fixing orphaned samples...');
    let fixedCount = 0;
    let skippedCount = 0;

    for (const sample of orphanedSamples) {
      if (sample.factory_id && factoryRepMap[sample.factory_id]) {
        // Assign the factory's rep to the sample
        const newRepId = factoryRepMap[sample.factory_id];
        const { error: updateError } = await supabase
          .from('samples')
          .update({ rep_id: newRepId })
          .eq('id', sample.id);

        if (updateError) {
          console.log(`   ❌ Failed to fix sample ${sample.id}: ${updateError.message}`);
        } else {
          const rep = reps.find(r => r.id === newRepId);
          console.log(`   ✅ Fixed: ${sample.product_name || 'Unnamed Product'} → ${rep?.name || 'Unknown'} (${rep?.email || 'No email'})`);
          fixedCount++;
        }
      } else {
        // No factory or factory has no rep, remove the rep_id
        const { error: updateError } = await supabase
          .from('samples')
          .update({ rep_id: null })
          .eq('id', sample.id);

        if (updateError) {
          console.log(`   ❌ Failed to remove rep_id from sample ${sample.id}: ${updateError.message}`);
        } else {
          console.log(`   ⚠️  Removed rep_id from: ${sample.product_name || 'Unnamed Product'} (no factory rep available)`);
          skippedCount++;
        }
      }
    }

    // Step 6: Verify the cleanup
    console.log('\n6. Verifying cleanup...');
    const { data: remainingSamples, error: verifyError } = await supabase
      .from('samples')
      .select('id, product_name, rep_id')
      .not('rep_id', 'is', null);

    if (verifyError) {
      console.log('   ⚠️  Could not verify cleanup:', verifyError.message);
    } else {
      const remainingOrphaned = remainingSamples.filter(sample => !validRepIds.has(sample.rep_id));
      console.log(`   ✅ Cleanup complete. ${remainingOrphaned.length} orphaned samples remaining`);
      
      if (remainingOrphaned.length > 0) {
        console.log('   ⚠️  Some orphaned samples could not be fixed automatically');
      }
    }

    console.log('\n📊 Cleanup Summary:');
    console.log(`   Total orphaned samples: ${orphanedSamples.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Removed rep_id: ${skippedCount}`);

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run setup script again: node scripts/setup-rep-assignments.js');
    console.log('2. Test the notification system: node scripts/test-email-notification.js');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the cleanup
cleanupOrphanedSamples(); 