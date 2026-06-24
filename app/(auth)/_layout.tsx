import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="choose-role" />
      <Stack.Screen name="enter-numer" />
      <Stack.Screen name="otp-verify" />
    </Stack>
  );
}
