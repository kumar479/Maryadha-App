const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    // Create the sample-files bucket if it doesn't exist
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('sample-files', {
      public: false,
      fileSizeLimit: 52428800, // 50MB in bytes
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ]
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Bucket sample-files already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('Created sample-files bucket successfully');
    }

    console.log('\nIMPORTANT: Please set up the following storage policies in your Supabase dashboard:');
    console.log('1. Allow authenticated users to upload files:');
    console.log(`   - Policy name: "authenticated users can upload"`);
    console.log(`   - Policy definition: auth.role() = 'authenticated'`);
    console.log(`   - Operation: INSERT\n`);
    console.log('2. Allow authenticated users to read their own files:');
    console.log(`   - Policy name: "authenticated users can read own files"`);
    console.log(`   - Policy definition: auth.role() = 'authenticated'`);
    console.log(`   - Operation: SELECT\n`);
    console.log('You can set these up at: https://app.supabase.com/project/_/storage/buckets\n');

  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage(); 