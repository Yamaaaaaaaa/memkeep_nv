import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthentication } from '@/context/AuthContext';
export default function AuthLayout() {
  const { user } = useAuthentication();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user]);
  return (
    <Stack>
      {/* Định nghĩa các màn hình trong Stack xác thực */}
      <Stack.Screen name="login" options={{ title: 'Đăng nhập', headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Đăng kí', headerShown: false }} />

      {/* +not-found trong nhóm này sẽ bắt các route không khớp trong (auth) */}
      {/* <Stack.Screen name="+not-found" /> */}
    </Stack>
  );
}