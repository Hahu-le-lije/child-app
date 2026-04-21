import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GameLayout from "@/components/GameLayout";

type VoiceChoice = {
  wordid: string;
  wordtext: string;
  imagelink?: string;
};

type VoiceRound = {
  voiceofwordlink: string;
  wordchoices: VoiceChoice[];
  correctwordid: string;
};

type VoiceLevel = Record<string, VoiceRound>;

type VoiceContent = {
  contents: {
    "voice/fidel to word game": {
      levels: Record<string, VoiceLevel>;
    };
  };
};

export const VOICE_TO_WORD_CONTENT: VoiceContent = {
  contents: {
    "voice/fidel to word game": {
      levels: {
        level_1: {
          question1: {
            voiceofwordlink:
              "https://cdn.pixabay.com/download/audio/2022/03/15/audio_3901f0f6f7.mp3?filename=kids-cheerful-piano-112194.mp3",
            wordchoices: [
              {
                wordid: "dog",
                wordtext: "Dog",
                imagelink:
                  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
              },
              {
                wordid: "cat",
                wordtext: "Cat",
                imagelink:
                  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
              },
              {
                wordid: "cow",
                wordtext: "Cow",
                imagelink:
                  "https://images.unsplash.com/photo-1570042225831-d98af757d2f3?w=600",
              },
              {
                wordid: "horse",
                wordtext: "Horse",
                imagelink:
                  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600",
              },
            ],
            correctwordid: "dog",
          },
          question2: {
            voiceofwordlink:
              "https://cdn.pixabay.com/download/audio/2023/03/27/audio_0e8e11a177.mp3?filename=light-tune-144935.mp3",
            wordchoices: [
              {
                wordid: "book",
                wordtext: "Book",
                imagelink:
                  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
              },
              {
                wordid: "chair",
                wordtext: "Chair",
                imagelink:
                  "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=600",
              },
              {
                wordid: "house",
                wordtext: "House",
                imagelink:
                  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600",
              },
              {
                wordid: "water",
                wordtext: "Water",
                imagelink:
                  "https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=600",
              },
            ],
            correctwordid: "book",
          },
        },
        level_2: {
          question1: {
            voiceofwordlink:
              "https://cdn.pixabay.com/download/audio/2022/08/04/audio_6f9f8f5f7a.mp3?filename=happy-kids-112698.mp3",
            wordchoices: [
              {
                wordid: "apple",
                wordtext: "Apple",
                imagelink:
                  "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600",
              },
              {
                wordid: "banana",
                wordtext: "Banana",
                imagelink:
                  "https://images.unsplash.com/photo-1574226516831-e1dff420e37f?w=600",
              },
              {
                wordid: "bread",
                wordtext: "Bread",
                imagelink:
                  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
              },
              {
                wordid: "milk",
                wordtext: "Milk",
                imagelink:
                  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600",
              },
            ],
            correctwordid: "apple",
          },
        },
      },
    },
  },
};

type LevelCard = {
  id: string;
  rounds: number;
  image: string;
};

const VoiceMatchIndex = () => {
  const levels = useMemo<LevelCard[]>(() => {
    return Object.entries(
      VOICE_TO_WORD_CONTENT.contents["voice/fidel to word game"].levels,
    ).map(([id, level]) => {
      const rounds = Object.keys(level).length;
      const first = Object.values(level)[0];
      return {
        id,
        rounds,
        image: first?.wordchoices?.[0]?.imagelink || "",
      };
    });
  }, []);

  return (
    <GameLayout title="Voice to Word">
      <View style={styles.container}>
        <LinearGradient colors={["#3A4CA8", "#5A67D8"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Listen and Match</Text>
          <Text style={styles.heroSubtitle}>
            Press voice, then choose the correct word card from 4 options.
          </Text>
        </LinearGradient>

        <FlatList
          data={levels}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/(root)/match/[id]",
                  params: { id: item.id },
                })
              }
            >
              {Boolean(item.image) ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Level {index + 1}</Text>
                <Text style={styles.cardSub}>{item.rounds} rounds</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#C2C8F0"
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </GameLayout>
  );
};

export default VoiceMatchIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#E2E8FF",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#2A2E58",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#3A406B",
  },
  cardBody: { flex: 1 },
  cardTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    marginBottom: 2,
  },
  cardSub: { color: "#C7CCEA", fontFamily: "Poppins-Regular", fontSize: 12 },
});
