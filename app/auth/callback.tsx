import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/shared/LoadingScreen';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // For web platform, the session will be automatically set
        // For mobile, we need to exchange the code for a session
        if (Platform.OS !== 'web') {
          const code = params?.code;
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code as string);
            if (error) throw error;
          }
        }

        // Get the session to check if the OAuth sign in was successful
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) throw new Error('No user data found');

        const { user } = session;
        const email = user.email;
        
        if (!email) throw new Error('No email found in user data');

        const domain = email.split('@')[1].toLowerCase();
        const role = domain === 'maryadha.com' ? 'rep' : 'brand';

        // Update user metadata with role if not already set
        if (!user.app_metadata?.role) {
          await supabase.auth.updateUser({
            data: { role }
          });
        }

        try {
          // Store additional user info in the appropriate table based on domain
          if (domain === 'maryadha.com') {
            // Check if rep already exists
            const { data: existingRep } = await supabase
              .from('reps')
              .select('id')
              .eq('email', email)
              .single();

            if (!existingRep) {
              // Store in reps table
              await supabase
                .from('reps')
                .insert({
                  user_id: user.id,
                  email: email,
                  name: user.user_metadata.full_name || email.split('@')[0],
                  active: true,
                });
            }
          } else {
            // Check if brand already exists
            const { data: existingBrand } = await supabase
              .from('brands')
              .select('id')
              .eq('email', email)
              .single();

            if (!existingBrand) {
              // Store in brands table
              await supabase
                .from('brands')
                .insert({
                  id: user.id,
                  email: email,
                  name: user.user_metadata.full_name || email.split('@')[0],
                  website: '', // Empty string - will be cast to text by Supabase
                  logo_url: '' // Empty string - will be cast to text by Supabase
                });
            }
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Continue with the flow even if database operations fail
          // The user can still access basic features
        }

        // Redirect to the appropriate screen based on role
        if (role === 'rep') {
          router.replace('/rep/tabs/home');
        } else {
          router.replace('/brand/tabs/factories');
        }

      } catch (error) {
        console.error('Error in OAuth callback:', error);
        router.replace('/auth/error');
      }
    };

    handleOAuthCallback();
  }, [router, params]);

  return <LoadingScreen message="Preparing your account..." />;
}
