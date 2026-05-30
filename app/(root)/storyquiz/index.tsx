import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { getCompletedLevelIds } from "@/services/db/levelProgress.service";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";
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
  const language = useLanguageStore((state) => state.language);
  const [levels, setLevels] = useState<StoryLevel[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    const load = async () => {
      const rows = await getLevelsForGame("story");
      if (!active) return;
      setLevels(rows as StoryLevel[]);
      setCompletedIds(getCompletedLevelIds(["story"]));
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
        completed: completedIds.has(item.id),
      })),
    [completedIds, levels],
  );

  return (
    <GameLayout title={t(language, "games.storyQuiz.title")} fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle={t(language, "games.storyQuiz.title")}
          guideTitle={t(language, "games.howToPlay")}
          guideText={t(language, "games.storyQuiz.guide")}
          levels={levelNodes}
          onPressLevel={(item) =>
            router.push({
              pathname: "/(root)/storyquiz/[id]",
              params: { id: item.id },
            })
          }
          emptyMessage={t(language, "games.storyQuiz.empty")}
        />
      </View>
    </GameLayout>
  );
};

export default StoryQuizIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
