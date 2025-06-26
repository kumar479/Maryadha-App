import { supabase } from '@/lib/supabase';

async function testLogin() {
  console.log('Testing login with Sarah Chen credentials...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'sarah.chen@maryadha.com',
      password: 'password123'
    });

    if (error) {
      console.error('Login failed:', error.message);
      return;
    }

    console.log('Login successful!');
    console.log('User role:', data.user?.app_metadata.role);
    console.log('Session expires:', new Date(data.session?.expires_at || 0).toLocaleString());
  } catch (err) {
    console.error('Test error:', err);
  }
}

testLogin();