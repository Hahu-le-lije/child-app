import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { getCompletedLevelIds } from "@/services/db/levelProgress.service";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

type LevelCard = {
  id: string;
  levelNumber: number;
};

const PicToWord = () => {
  const [levels, setLevels] = useState<LevelCard[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    (async () => {
      const rows = await getLevelsForGame("picture");
      if (!active) return;
      setLevels(
        rows.map((row, index) => ({
          id: String(row.id),
          levelNumber: Number(row.level_number) || index + 1,
        })),
      );
      setCompletedIds(getCompletedLevelIds(["picture_to_word"]));
    })();

    return () => {
      active = false;
    };
  }, []);

  const levelNodes = useMemo<LevelMapItem[]>(
    () =>
      levels.map((level) => ({
        id: level.id,
        levelNumber: level.levelNumber,
        completed: completedIds.has(level.id),
      })),
    [completedIds, levels],
  );

  return (
    <GameLayout title="Picture to Word" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Picture to Word"
          guideTitle="How to Play"
          guideText="Read the word and tap the picture that matches it."
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/pictoword/${item.id}`)}
          emptyMessage="No picture levels available right now."
        />
      </View>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default PicToWord;
