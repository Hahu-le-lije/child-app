import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import CustomSidebar from "@/components/CustomSideBar";
import { useLanguageStore } from "@/store/languageStore";
import { t } from "@/services/locales";

export default function Layout() {
  const language = useLanguageStore((state) => state.language);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomSidebar {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#1F1F39",
            width: "75%",
          },
          swipeEdgeWidth: 100,
        }}
      >
        <Drawer.Screen
          name="home"
          options={{ drawerLabel: t(language, "navigation.home") }}
        />
        <Drawer.Screen
          name="progress"
          options={{ drawerLabel: t(language, "navigation.progress") }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
