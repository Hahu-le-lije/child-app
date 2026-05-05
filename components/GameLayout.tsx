import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SafeAreaComponent from "@/components/SafeAreaComponent";
import { COLORS } from "@/const";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type GameLayoutProps = {
  title: string;
  children: React.ReactNode;
  fullScreen?: boolean;
};

const GameLayout = ({
  title,
  children,
  fullScreen = false,
}: GameLayoutProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaComponent
      style={[styles.container, fullScreen && { paddingTop: 0 }]}
    >
      <View
        style={[
          styles.header,
          fullScreen ? styles.headerFullscreen : styles.headerRegular,
          fullScreen ? { paddingTop: insets.top + 12 } : { paddingTop: 12 },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={{ width: 26 }} />
      </View>

      <View style={[styles.content, !fullScreen && styles.contentRegular]}>
        {children}
      </View>
    </SafeAreaComponent>
  );
};

export default GameLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerFullscreen: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerRegular: {
    position: "relative",
  },

  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginTop: 8,
  },

  content: {
    flex: 1,
    padding: 0,
  },
  contentRegular: {
    paddingTop: 8,
  },
});
