import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { getCompletedLevelIds } from "@/services/db/levelProgress.service";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

const Tracing = () => {
  const language = useLanguageStore((state) => state.language);
  const [levels, setLevels] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const rows = await getLevelsForGame("tracing");
      setLevels(rows);
      setCompletedIds(getCompletedLevelIds(["tracing"]));
    })();
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
    <GameLayout title={t(language, "games.fidelTracing.title")} fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle={t(language, "games.fidelTracing.title")}
          guideTitle={t(language, "games.howToPlay")}
          guideText={t(language, "games.fidelTracing.guide")}
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/tracing/${item.id}`)}
          emptyMessage={t(language, "games.fidelTracing.empty")}
        />
      </View>
    </GameLayout>
  );
};

export default Tracing;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
