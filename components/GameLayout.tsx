import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SafeAreaComponent from "@/components/SafeAreaComponent";

const GameLayout = ({ title, children }: any) => {
  const router = useRouter();

  return (
    <SafeAreaComponent style={styles.container}>
      
    
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
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