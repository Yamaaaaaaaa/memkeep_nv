import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { AuthContext } from '@/context/AuthContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    Alberts: require('../assets/fonts/AlbertSans-Regular.ttf'),
    JudSon: require('../assets/fonts/Judson-Regular.ttf'),
    Inika: require('../assets/fonts/Inika-Regular.ttf'),
    Montserrat: require('../assets/fonts/Montserrat-Regular.ttf'),
  });

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setAuthReady(true); // Chỉ khi auth sẵn sàng mới hiển thị layout
    });

    return () => unsubscribe();
  }, []);

  if (!loaded || !authReady) return null;

  return (
    <AuthContext.Provider value={{ user }}>
      <Slot />
    </AuthContext.Provider>
  );
}
