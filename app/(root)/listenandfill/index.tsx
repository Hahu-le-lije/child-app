import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";
import GameLayout from "@/components/GameLayout";
import LevelMap, { LevelMapItem } from "./LevelMap";

type ListenQuestion = {
  sentenceTemplate: string;
  answer: string;
  options: string[];
  audioUrl?: string;
};

type ListenLevel = Record<string, ListenQuestion>;

type ListenAndFillJson = {
  contents: {
    "listen and fill": {
      levels: Record<string, ListenLevel>;
    };
  };
};

type LevelCard = {
  id: string;
  levelNumber: number;
};

export const LISTEN_AND_FILL_CONTENT: ListenAndFillJson = {
  contents: {
    "listen and fill": {
      levels: {
        level_1: {
          question1: {
            sentenceTemplate: "The cat is on the ____.",
            answer: "mat",
            options: ["mat", "tree", "shoe", "sun"],
            audioUrl:
              "https://cdn.pixabay.com/download/audio/2022/03/15/audio_3901f0f6f7.mp3?filename=kids-cheerful-piano-112194.mp3",
          },
          question2: {
            sentenceTemplate: "I drink warm ____ in the morning.",
            answer: "milk",
            options: ["milk", "chair", "cloud", "clock"],
            audioUrl:
              "https://cdn.pixabay.com/download/audio/2023/03/27/audio_0e8e11a177.mp3?filename=light-tune-144935.mp3",
          },
          question3: {
            sentenceTemplate: "The dog likes to run in the ____.",
            answer: "park",
            options: ["park", "book", "sock", "moon"],
            audioUrl:
              "https://cdn.pixabay.com/download/audio/2022/08/04/audio_6f9f8f5f7a.mp3?filename=happy-kids-112698.mp3",
          },
        },
        level_2: {
          question1: {
            sentenceTemplate: "My pencil is inside my ____.",
            answer: "bag",
            options: ["bag", "rain", "fish", "star"],
          },
          question2: {
            sentenceTemplate: "We read a story from the ____.",
            answer: "book",
            options: ["book", "shoe", "milk", "grass"],
          },
          question3: {
            sentenceTemplate: "The baby bird sleeps in a ____.",
            answer: "nest",
            options: ["nest", "desk", "rice", "lamp"],
          },
          question4: {
            sentenceTemplate: "I wear a ____ when it is sunny.",
            answer: "hat",
            options: ["hat", "plate", "book", "tree"],
          },
        },
        level_3: {
          question1: {
            sentenceTemplate: "After rain, we can see a colorful ____.",
            answer: "rainbow",
            options: ["rainbow", "pillow", "window", "basket"],
          },
          question2: {
            sentenceTemplate: "The teacher writes on the ____.",
            answer: "board",
            options: ["board", "bread", "beach", "blanket"],
          },
          question3: {
            sentenceTemplate: "We plant seeds in the ____.",
            answer: "garden",
            options: ["garden", "pocket", "rocket", "kitchen"],
          },
          question4: {
            sentenceTemplate: "At night, stars shine in the ____.",
            answer: "sky",
            options: ["sky", "cup", "toy", "jam"],
          },
          question5: {
            sentenceTemplate: "The bus stops near the school ____.",
            answer: "gate",
            options: ["gate", "cake", "stone", "drum"],
          },
        },
      },
    },
  },
};

const ListenAndFillIndex = () => {
  const levels = useMemo<LevelCard[]>(() => {
    const entries = Object.entries(
      LISTEN_AND_FILL_CONTENT.contents["listen and fill"].levels,
    );

    return entries.map(([id], index) => {
      return {
        id,
        levelNumber: index + 1,
      };
    });
  }, []);

  const levelNodes = useMemo<LevelMapItem[]>(
    () =>
      levels.map((level) => ({
        id: level.id,
        levelNumber: level.levelNumber,
      })),
    [levels],
  );

  return (
    <GameLayout title="Listen and Fill" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Listen and Fill"
          guideTitle="How to Play"
          guideText="Listen to the audio, find the missing word, and fill the blank correctly."
          levels={levelNodes}
          onPressLevel={(item) =>
            router.push({
              pathname: "/(root)/listenandfill/[id]",
              params: { id: item.id },
            })
          }
        />
      </View>
    </GameLayout>
  );
};

export default ListenAndFillIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
