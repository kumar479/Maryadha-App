import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function BrandLayout() {
  const { session, initialized } = useAuth();

  if (!initialized) {
    return null;
  }

  // Ensure only brands can access this layout
  if (!session?.user || session.user.app_metadata?.role !== 'brand') {
    return <Redirect href="/auth/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
    </Stack>
  );
}