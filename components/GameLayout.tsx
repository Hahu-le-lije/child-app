import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SafeAreaComponent from "@/components/SafeAreaComponent";
import {COLORS} from "@/const";
const GameLayout = ({ title, children }: any) => {
  const router = useRouter();

  return (
    <SafeAreaComponent style={styles.container}>
      
    
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <View style={{ width: 26 }} />
      </View>

  
      <View style={styles.content}>
        {children}
      </View>

    </SafeAreaComponent>
  );
};

export default GameLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
 backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },

  content: {
    flex: 1,
    padding: 20,
  },
});