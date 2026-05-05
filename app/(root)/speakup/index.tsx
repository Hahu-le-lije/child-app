import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

const SpeakUP = () => {
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await getLevelsForGame("pronunciation");
      setLevels(rows);
    })();
  }, []);

  const levelNodes = useMemo<LevelMapItem[]>(
    () =>
      (levels ?? []).map((item: any, index: number) => ({
        id: String(item.id),
        levelNumber: Number(item.level_number) || index + 1,
      })),
    [levels],
  );

  return (
    <GameLayout title="SpeakUP" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="SpeakUP"
          guideTitle="How to Play"
          guideText="Pick a level, listen to the word, then tap the mic and say it clearly."
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/speakup/${item.id}`)}
          emptyMessage="No pronunciation levels available right now."
        />
      </View>
    </GameLayout>
  );
};

export default SpeakUP;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
