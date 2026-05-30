import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const { user, loading } = useAuthStore();
console.log("ANALYSIS:", process.env.EXPO_PUBLIC_API_ANALYISIS);
console.log("CHILD:", process.env.EXPO_PUBLIC_API_CHILD);
console.log("SUB:", process.env.EXPO_PUBLIC_API_SUB);
console.log("SYNC:", process.env.EXPO_PUBLIC_API_SYNC);
  if (loading) return null;

  if (user) {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}