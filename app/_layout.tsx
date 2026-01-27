// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
// Agar theme ya providers chahiye toh yahan import kar sakta hai

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,              // tabs mein header hide rahega
        animation: 'fade_from_bottom',   // smooth transition
      }}
    >
      {/* Yeh line important hai — tabs group ko yahan link kar */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Agar future mein login, splash, modal screens add karna ho toh yahan daal sakta hai */}
      {/* <Stack.Screen name="login" options={{ presentation: 'modal' }} /> */}
    </Stack>
  );
}