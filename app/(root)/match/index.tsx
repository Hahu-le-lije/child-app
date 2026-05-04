import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
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
  const [levels, setLevels] = useState<MatchLevel[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const rows = await getLevelsForGame("matching");
      if (!active) return;
      setLevels(rows as MatchLevel[]);
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
      })),
    [levels],
  );

  return (
    <GameLayout title="Fidel Match" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Fidel Match"
          guideTitle="How to Play"
          guideText="Match the correct symbols and pairs as fast as you can."
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/match/${item.id}`)}
          emptyMessage="No match levels available right now."
        />
      </View>
    </GameLayout>
  );
};

export default Match;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
