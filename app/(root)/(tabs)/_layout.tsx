import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import CustomSidebar from "@/components/CustomSideBar";

export default function Layout() {
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
        <Drawer.Screen name="home" options={{ drawerLabel: "Home" }} />
        <Drawer.Screen name="progress" options={{ drawerLabel: "Stickers" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
