import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function RepLayout() {
  const { session, initialized } = useAuth();

  if (!initialized) {
    return null;
  }

  // Ensure only reps can access this layout
  if (!session?.user || session.user.app_metadata?.role !== 'rep') {
    return <Redirect href="/auth/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" />
    </Stack>
  );
}