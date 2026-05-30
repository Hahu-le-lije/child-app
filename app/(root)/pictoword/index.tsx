import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { getCompletedLevelIds } from "@/services/db/levelProgress.service";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

type LevelCard = {
  id: string;
  levelNumber: number;
};

const PicToWord = () => {
  const language = useLanguageStore((state) => state.language);
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
    <GameLayout title={t(language, "games.picToWord.title")} fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle={t(language, "games.picToWord.title")}
          guideTitle={t(language, "games.howToPlay")}
          guideText={t(language, "games.picToWord.guide")}
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/pictoword/${item.id}`)}
          emptyMessage={t(language, "games.picToWord.empty")}
        />
      </View>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default PicToWord;
