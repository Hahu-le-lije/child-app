import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

type SentenceLevel = {
  id: string;
  level_number: number;
  title: string | null;
  description: string | null;
};

const SentenceFunIndex = () => {
  const [levels, setLevels] = useState<SentenceLevel[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const rows = await getLevelsForGame("sentence_building");
      if (!active) return;
      setLevels(rows as SentenceLevel[]);
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
    <GameLayout title="Sentence Fun" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Sentence Fun"
          guideTitle="How to Play"
          guideText="Tap the words in the correct order to build each sentence."
          levels={levelNodes}
          onPressLevel={(item) =>
            router.push({
              pathname: "/(root)/sentencefun/[id]",
              params: { id: item.id },
            })
          }
          emptyMessage="No sentence levels available right now."
        />
      </View>
    </GameLayout>
  );
};

export default SentenceFunIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
