import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

type StoryLevel = {
  id: string;
  level_number: number;
  title: string | null;
  description: string | null;
  difficulty: number | null;
};

const StoryQuizIndex = () => {
  const [levels, setLevels] = useState<StoryLevel[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const rows = await getLevelsForGame("story");
      if (!active) return;
      setLevels(rows as StoryLevel[]);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const levelNodes = useMemo<LevelMapItem[]>(
    () =>
      levels.map((item, index) => ({
        id: item.id,
        levelNumber: item.level_number ?? index + 1,
      })),
    [levels],
  );

  return (
    <GameLayout title="Story Quiz" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Story Quiz"
          guideTitle="How to Play"
          guideText="Read each story, understand it, and answer the quiz questions correctly."
          levels={levelNodes}
          onPressLevel={(item) =>
            router.push({
              pathname: "/(root)/storyquiz/[id]",
              params: { id: item.id },
            })
          }
          emptyMessage="No story levels found."
        />
      </View>
    </GameLayout>
  );
};

export default StoryQuizIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
