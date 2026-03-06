import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import { useAuthStore } from '@/store/authStore'
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from '@/database/migrations';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const { loading, checkAuthOnStart } = useAuthStore();

  const [loaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"), 
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Abyssinica_SIL": require("../assets/fonts/Abyssinica_SIL/AbyssinicaSIL-Regular.ttf")
  });

  useEffect(() => {
    checkAuthOnStart();
    initDatabase();
  }, [checkAuthOnStart]);

  useEffect(() => {
    if (loaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, loading]);

  if (!loaded || loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}