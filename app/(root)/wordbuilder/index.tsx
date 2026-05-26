import { StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { getCompletedLevelIds } from "@/services/db/levelProgress.service";
import { router } from "expo-router";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

const WordBuilder = () => {
  const [levels, setLevels] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    (async () => {
      const rows = await getLevelsForGame("word_builder");
      if (!active) return;
      setLevels(rows);
      setCompletedIds(getCompletedLevelIds(["word_builder"]));
    })();

    return () => {
      active = false;
    };
  }, []);

  const levelNodes = useMemo<LevelMapItem[]>(
    () =>
      (levels ?? []).map((item: any, index: number) => ({
        id: String(item.id),
        levelNumber: Number(item.level_number) || index + 1,
        completed: completedIds.has(String(item.id)),
      })),
    [completedIds, levels],
  );

  return (
    <GameLayout title="Word Builder" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Word Builder"
          guideTitle="How to Play"
          guideText="Pick a level, connect letters, and discover all the hidden words."
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/wordbuilder/${item.id}`)}
          emptyMessage="No word-builder levels available right now."
        />
      </View>
    </GameLayout>
  );
};

export default WordBuilder;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
