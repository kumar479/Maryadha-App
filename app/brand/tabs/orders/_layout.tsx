import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF9F7' }
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="[id]" 
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}