import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SpeakUP = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await getLevelsForGame("pronunciation");
      setLevels(rows);
    })();
  }, []);

  return (
    <GameLayout title="SpeakUP">
      <View style={styles.container}>
        <TouchableOpacity style={styles.card}
        onPress={()=>router.push(`/(root)/speakup/${2}`)}
        >
          <Text style={styles.title}>test button</Text>
        </TouchableOpacity>
        <FlatList
          data={levels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(root)/speakup/${item.id}`)}
            >
              <Text style={styles.title}>
                {item.title || `Level ${item.level_number}`}
              </Text>
              <Text style={styles.subtitle}>
                {item.description || "Practice pronunciation"}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </GameLayout>
  );
};

export default SpeakUP;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: {
    backgroundColor: "#2F2F42",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: "#fff", fontSize: 16, fontFamily: "Poppins-Bold" },
  subtitle: { color: "#aaa", marginTop: 4, fontSize: 12 },
});
