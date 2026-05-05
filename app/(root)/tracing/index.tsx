import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

const Tracing = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await getLevelsForGame("tracing");
      setLevels(rows);
    })();
  }, []);

  const levelNodes = useMemo<LevelMapItem[]>(
    () =>
      (levels ?? []).map((item: any, index: number) => ({
        id: String(item.id),
        levelNumber: Number(item.level_number) || index + 1,
      })),
    [levels],
  );

  return (
    <GameLayout title="Fidel Tracing" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Fidel Tracing"
          guideTitle="How to Play"
          guideText="Pick a level, listen to the sound, then trace the character carefully."
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/tracing/${item.id}`)}
          emptyMessage="No tracing levels available right now."
        />
      </View>
    </GameLayout>
  );
};

export default Tracing;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
