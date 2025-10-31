import { Stack } from 'expo-router';
import { MarkersProvider } from '@/contexts/MarkersContext';

export default function RootLayout() {
  return (
    <MarkersProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="marker/[id]" options={{ headerShown: false }} />
      </Stack>
    </MarkersProvider>
  );
}
