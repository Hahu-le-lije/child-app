import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

const Tracing = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await getLevelsForGame("tracing");
      setLevels(rows);
    })();
  }, []);

  return (
    <GameLayout title="Fidel Tracing">
      <FlatList
        data={levels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(root)/tracing/${item.id}`)}
          >
            <Text style={styles.title}>
              {item.title || `Level ${item.level_number}`}
            </Text>
          </TouchableOpacity>
        )}
      />
    </GameLayout>
  );
};

export default Tracing;

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  title: {
    fontSize: 18,
  },
});
