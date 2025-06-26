const { createClient } = require('@supabase/supabase-js');

// Test storage bucket setup
async function testStorageSetup() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Testing storage bucket setup...');
    
    // Test if buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Check if required buckets exist
    const requiredBuckets = ['images', 'sample-files'];
    const existingBuckets = buckets.map(b => b.name);
    
    for (const bucketName of requiredBuckets) {
      if (existingBuckets.includes(bucketName)) {
        console.log(`✅ Bucket '${bucketName}' exists`);
      } else {
        console.log(`❌ Bucket '${bucketName}' missing`);
      }
    }
    
    // Test file upload to sample-files bucket
    console.log('\nTesting PDF upload...');
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids []\n/Count 0\n>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n\ntrailer\n<<\n/Size 3\n/Root 1 0 R\n>>\nstartxref\n149\n%%EOF';
    const testFileName = `test-${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sample-files')
      .upload(testFileName, new TextEncoder().encode(testPdfContent), {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ PDF upload failed:', uploadError);
    } else {
      console.log('✅ PDF upload successful:', uploadData.path);
      
      // Clean up test file
      await supabase.storage.from('sample-files').remove([testFileName]);
      console.log('✅ Test file cleaned up');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStorageSetup(); 