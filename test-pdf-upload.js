const { createClient } = require('@supabase/supabase-js');

// Test PDF upload using the same approach as the working invoice upload
async function testPdfUpload() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Testing PDF upload using the working approach...');
    
    // Create a simple PDF content (minimal valid PDF)
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids []\n/Count 0\n>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n\ntrailer\n<<\n/Size 3\n/Root 1 0 R\n>>\nstartxref\n149\n%%EOF';
    
    // Create a blob from the PDF content (simulating the fetch response)
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    // Test upload to sample-files bucket (same as factory form)
    console.log('\nTesting upload to sample-files bucket...');
    const testFileName = `test-factory-${Date.now()}.pdf`;
    const filePath = `tech-packs/${testFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sample-files')
      .upload(filePath, blob, { 
        contentType: 'application/pdf',
        upsert: true 
      });
    
    if (uploadError) {
      console.error('❌ PDF upload to sample-files failed:', uploadError);
    } else {
      console.log('✅ PDF upload to sample-files successful:', uploadData.path);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sample-files')
        .getPublicUrl(filePath);
      
      console.log('✅ Public URL:', publicUrl);
      
      // Clean up test file
      await supabase.storage.from('sample-files').remove([filePath]);
      console.log('✅ Test file cleaned up');
    }
    
    // Test upload to sample-invoices bucket (same as working invoice upload)
    console.log('\nTesting upload to sample-invoices bucket...');
    const invoiceFileName = `test-invoice-${Date.now()}.pdf`;
    const invoiceFilePath = `test/${invoiceFileName}`;
    
    const { data: invoiceUploadData, error: invoiceUploadError } = await supabase.storage
      .from('sample-invoices')
      .upload(invoiceFilePath, blob, { 
        contentType: 'application/pdf',
        upsert: true 
      });
    
    if (invoiceUploadError) {
      console.error('❌ PDF upload to sample-invoices failed:', invoiceUploadError);
    } else {
      console.log('✅ PDF upload to sample-invoices successful:', invoiceUploadData.path);
      
      // Get public URL
      const { data: { publicUrl: invoiceUrl } } = supabase.storage
        .from('sample-invoices')
        .getPublicUrl(invoiceFilePath);
      
      console.log('✅ Invoice Public URL:', invoiceUrl);
      
      // Clean up test file
      await supabase.storage.from('sample-invoices').remove([invoiceFilePath]);
      console.log('✅ Invoice test file cleaned up');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPdfUpload(); 