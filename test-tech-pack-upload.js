const { createClient } = require('@supabase/supabase-js');

// Test tech pack upload using the new dedicated bucket
async function testTechPackUpload() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Testing tech pack upload with new dedicated bucket...');
    
    // Create a simple PDF content (minimal valid PDF)
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids []\n/Count 0\n>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n\ntrailer\n<<\n/Size 3\n/Root 1 0 R\n>>\nstartxref\n149\n%%EOF';
    
    // Create a blob from the PDF content
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    // Test upload to tech-pack-guides bucket
    console.log('\nTesting upload to tech-pack-guides bucket...');
    const testFileName = `test-tech-pack-${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tech-pack-guides')
      .upload(testFileName, blob, { 
        contentType: 'application/pdf',
        upsert: true 
      });
    
    if (uploadError) {
      console.error('❌ Tech pack upload failed:', uploadError);
    } else {
      console.log('✅ Tech pack upload successful:', uploadData.path);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tech-pack-guides')
        .getPublicUrl(testFileName);
      
      console.log('✅ Public URL:', publicUrl);
      
      // Clean up test file
      await supabase.storage.from('tech-pack-guides').remove([testFileName]);
      console.log('✅ Test file cleaned up');
    }
    
    // Also test the working sample-invoices bucket for comparison
    console.log('\nTesting upload to sample-invoices bucket (for comparison)...');
    const invoiceFileName = `test-invoice-${Date.now()}.pdf`;
    
    const { data: invoiceUploadData, error: invoiceUploadError } = await supabase.storage
      .from('sample-invoices')
      .upload(invoiceFileName, blob, { 
        contentType: 'application/pdf',
        upsert: true 
      });
    
    if (invoiceUploadError) {
      console.error('❌ Invoice upload failed:', invoiceUploadError);
    } else {
      console.log('✅ Invoice upload successful:', invoiceUploadData.path);
      
      // Get public URL
      const { data: { publicUrl: invoiceUrl } } = supabase.storage
        .from('sample-invoices')
        .getPublicUrl(invoiceFileName);
      
      console.log('✅ Invoice Public URL:', invoiceUrl);
      
      // Clean up test file
      await supabase.storage.from('sample-invoices').remove([invoiceFileName]);
      console.log('✅ Invoice test file cleaned up');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTechPackUpload(); 