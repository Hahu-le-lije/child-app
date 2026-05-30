import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { getCompletedLevelIds } from "@/services/db/levelProgress.service";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

type MatchLevel = {
  id: string;
  level_number?: number;
  title?: string | null;
  description?: string | null;
  difficulty?: number | null;
};

const Match = () => {
  const language = useLanguageStore((state) => state.language);
  const [levels, setLevels] = useState<MatchLevel[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    (async () => {
      const rows = await getLevelsForGame("matching");
      if (!active) return;
      setLevels(rows as MatchLevel[]);
      setCompletedIds(getCompletedLevelIds(["voice_word_match"]));
    })();

    return () => {
      active = false;
    };
  }, []);

  const levelNodes = useMemo<LevelMapItem[]>(
    () =>
      levels.map((level, index) => ({
        id: level.id,
        levelNumber: level.level_number ?? index + 1,
        completed: completedIds.has(level.id),
      })),
    [completedIds, levels],
  );

  return (
    <GameLayout title={t(language, "games.fidelMatch.title")} fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle={t(language, "games.fidelMatch.title")}
          guideTitle={t(language, "games.howToPlay")}
          guideText={t(language, "games.fidelMatch.guide")}
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/match/${item.id}`)}
          emptyMessage={t(language, "games.fidelMatch.empty")}
        />
      </View>
    </GameLayout>
  );
};

export default Match;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
