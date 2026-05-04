import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import React from "react";
import GameLayout from "@/components/GameLayout";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const DUMMY_LEVELS = [
  { id: "1", level_number: 1, title: "Basic Letters", difficulty: "Easy" },
  { id: "2", level_number: 2, title: "Family Words", difficulty: "Medium" },
  { id: "3", level_number: 3, title: "Animal Names", difficulty: "Hard" },
];

const WordBuilder = () => {
  const router = useRouter();

  return (
    <GameLayout title="Word Builder">
      <View style={styles.container}>
        <Text style={styles.headerSubtitle}>
          Select a level to start connecting letters!
        </Text>

        <FlatList
          data={DUMMY_LEVELS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => router.push(`/(root)/wordbuilder/${item.id}`)}
            >
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{item.level_number}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.difficultyText}>
                  {item.difficulty} • 2 Words
                </Text>
              </View>

              <View style={styles.playButton}>
                <Text style={styles.playText}>Play</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </GameLayout>
  );
};

export default WordBuilder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  headerSubtitle: {
    color: "#BABBC9",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#2F2F42",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#3D5CFF",
    justifyContent: "center",
    alignItems: "center",
  },
  levelNumber: {
    color: "white",
    fontSize: 20,
    fontFamily: "Poppins-Bold",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  difficultyText: {
    color: "#BABBC9",
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
  playButton: {
    backgroundColor: "rgba(61, 92, 255, 0.1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3D5CFF",
  },
  playText: {
    color: "#3D5CFF",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
});
