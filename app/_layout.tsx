import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import * as SplashScreen from "expo-splash-screen";
import { initContentDB } from "@/database/contentDb";
import { initChildDataDB } from "@/database/childDatadb";
import {
  performSync,
  startSyncListener,
  stopSyncListener,
} from "@/services/sync/syncManager";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loading, checkAuthOnStart, user } = useAuthStore();
  const languageHydrated = useLanguageStore((state) => state.hydrated);
  const hydrateLanguage = useLanguageStore((state) => state.hydrateLanguage);

  const [loaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    Abyssinica_SIL: require("../assets/fonts/Abyssinica_SIL/AbyssinicaSIL-Regular.ttf"),
  });

  useEffect(() => {
    checkAuthOnStart();
    initContentDB();
    initChildDataDB();
    void hydrateLanguage();

    console.log(" databases ready");
  }, [checkAuthOnStart, hydrateLanguage]);

  useEffect(() => {
    if (!user) return;
    startSyncListener();
    performSync();
    return () => {
      stopSyncListener();
    };
  }, [user]);
  useEffect(() => {
    if (loaded && !loading && languageHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, loading, languageHydrated]);

  if (!loaded || loading || !languageHydrated) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
