import { StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { getCompletedLevelIds } from "@/services/db/levelProgress.service";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";
import { router } from "expo-router";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

const WordBuilder = () => {
  const language = useLanguageStore((state) => state.language);
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
    <GameLayout title={t(language, "games.wordBuilder.title")} fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle={t(language, "games.wordBuilder.title")}
          guideTitle={t(language, "games.howToPlay")}
          guideText={t(language, "games.wordBuilder.guide")}
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/wordbuilder/${item.id}`)}
          emptyMessage={t(language, "games.wordBuilder.empty")}
        />
      </View>
    </GameLayout>
  );
};

export default WordBuilder;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
