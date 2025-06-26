import { Stack } from 'expo-router';

export default function SamplesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF9F7' }
      }}
    />
  );
}