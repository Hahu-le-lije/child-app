import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";
import GameLayout from "@/components/GameLayout";
import LevelMap, { LevelMapItem } from "../listenandfill/LevelMap";

type JsonImage = {
  id: string;
  imagelink: string;
};

type JsonQuestion = {
  questiontext: string;
  images: JsonImage[];
  correctImageId: string;
};

type JsonLevel = Record<string, JsonQuestion>;

type PictureToWordJson = {
  contents: {
    "picture to word": {
      levels: Record<string, JsonLevel>;
    };
  };
};

type LevelCard = {
  id: string;
  levelNumber: number;
};

const PICTURE_TO_WORD_CONTENT: PictureToWordJson = {
  contents: {
    "picture to word": {
      levels: {
        level_1: {
          question1: {
            questiontext: "Dog",
            images: [
              {
                id: "dog",
                imagelink:
                  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
              },
              {
                id: "cat",
                imagelink:
                  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700",
              },
              {
                id: "cow",
                imagelink:
                  "https://images.unsplash.com/photo-1570042225831-d98af757d2f3?w=700",
              },
              {
                id: "horse",
                imagelink:
                  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=700",
              },
            ],
            correctImageId: "dog",
          },
          question2: {
            questiontext: "Cat",
            images: [
              {
                id: "cat",
                imagelink:
                  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700",
              },
              {
                id: "dog",
                imagelink:
                  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
              },
              {
                id: "cow",
                imagelink:
                  "https://images.unsplash.com/photo-1570042225831-d98af757d2f3?w=700",
              },
              {
                id: "hen",
                imagelink:
                  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700",
              },
            ],
            correctImageId: "cat",
          },
          question3: {
            questiontext: "Cow",
            images: [
              {
                id: "cow",
                imagelink:
                  "https://images.unsplash.com/photo-1570042225831-d98af757d2f3?w=700",
              },
              {
                id: "dog",
                imagelink:
                  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
              },
              {
                id: "cat",
                imagelink:
                  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700",
              },
              {
                id: "horse",
                imagelink:
                  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=700",
              },
            ],
            correctImageId: "cow",
          },
        },
        level_2: {
          question1: {
            questiontext: "Apple",
            images: [
              {
                id: "apple",
                imagelink:
                  "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=700",
              },
              {
                id: "banana",
                imagelink:
                  "https://images.unsplash.com/photo-1574226516831-e1dff420e37f?w=700",
              },
              {
                id: "bread",
                imagelink:
                  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700",
              },
              {
                id: "milk",
                imagelink:
                  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=700",
              },
            ],
            correctImageId: "apple",
          },
          question2: {
            questiontext: "Banana",
            images: [
              {
                id: "banana",
                imagelink:
                  "https://images.unsplash.com/photo-1574226516831-e1dff420e37f?w=700",
              },
              {
                id: "apple",
                imagelink:
                  "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=700",
              },
              {
                id: "milk",
                imagelink:
                  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=700",
              },
              {
                id: "bread",
                imagelink:
                  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700",
              },
            ],
            correctImageId: "banana",
          },
          question3: {
            questiontext: "Milk",
            images: [
              {
                id: "milk",
                imagelink:
                  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=700",
              },
              {
                id: "bread",
                imagelink:
                  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700",
              },
              {
                id: "apple",
                imagelink:
                  "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=700",
              },
              {
                id: "banana",
                imagelink:
                  "https://images.unsplash.com/photo-1574226516831-e1dff420e37f?w=700",
              },
            ],
            correctImageId: "milk",
          },
        },
        level_3: {
          question1: {
            questiontext: "Book",
            images: [
              {
                id: "book",
                imagelink:
                  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700",
              },
              {
                id: "chair",
                imagelink:
                  "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=700",
              },
              {
                id: "house",
                imagelink:
                  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700",
              },
              {
                id: "water",
                imagelink:
                  "https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=700",
              },
            ],
            correctImageId: "book",
          },
          question2: {
            questiontext: "Chair",
            images: [
              {
                id: "chair",
                imagelink:
                  "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=700",
              },
              {
                id: "book",
                imagelink:
                  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700",
              },
              {
                id: "house",
                imagelink:
                  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700",
              },
              {
                id: "water",
                imagelink:
                  "https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=700",
              },
            ],
            correctImageId: "chair",
          },
          question3: {
            questiontext: "House",
            images: [
              {
                id: "house",
                imagelink:
                  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700",
              },
              {
                id: "book",
                imagelink:
                  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700",
              },
              {
                id: "chair",
                imagelink:
                  "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=700",
              },
              {
                id: "water",
                imagelink:
                  "https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=700",
              },
            ],
            correctImageId: "house",
          },
        },
      },
    },
  },
};

const PicToWord = () => {
  const levels = useMemo<LevelCard[]>(() => {
    const levelEntries = Object.entries(
      PICTURE_TO_WORD_CONTENT.contents["picture to word"].levels,
    );

    return levelEntries.map(([levelId], index) => {
      return {
        id: levelId,
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
    <GameLayout title="Picture to Word" fullScreen>
      <View style={styles.container}>
        <LevelMap
          gameTitle="Picture to Word"
          guideTitle="How to Play"
          guideText="Read the word and tap the picture that matches it."
          levels={levelNodes}
          onPressLevel={(item) => router.push(`/(root)/pictoword/${item.id}`)}
        />
      </View>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default PicToWord;
