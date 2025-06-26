const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ztcqieqmchpqlouflrhh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3FpZXFtY2hwcWxvdWZscmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODQ4MzYsImV4cCI6MjA2MTg2MDgzNn0.h9A6svPuVhvsIVUcbk1JbUELD0XqE0M_WCcrDGT6sP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testList() {
  const { data, error } = await supabase.storage.from('images').list('Explicit Leather Group');
  console.log('Data:', data);
  console.log('Error:', error);
}

testList(); 