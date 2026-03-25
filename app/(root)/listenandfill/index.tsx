import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ListRenderItem,
} from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GameLayout from "@/components/GameLayout";

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
  title: string;
  subtitle: string;
  questionCount: number;
  difficulty: "starter" | "practice" | "challenge";
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

const gradients = {
  starter: ["#48C9B0", "#1ABC9C"] as const,
  practice: ["#F5B041", "#EB984E"] as const,
  challenge: ["#EC7063", "#CB4335"] as const,
};

const tags = {
  starter: "Starter",
  practice: "Practice",
  challenge: "Challenge",
};

const { width } = Dimensions.get("window");
const cardWidth = (width - 54) / 2;

const ListenAndFillIndex = () => {
  const levels = useMemo<LevelCard[]>(() => {
    const entries = Object.entries(
      LISTEN_AND_FILL_CONTENT.contents["listen and fill"].levels,
    );

    return entries.map(([id, data], index) => {
      const questionCount = Object.keys(data).length;
      const difficulty: LevelCard["difficulty"] =
        index === 0 ? "starter" : index === 1 ? "practice" : "challenge";

      return {
        id,
        title: `Level ${index + 1}`,
        subtitle:
          difficulty === "starter"
            ? "Simple one-word blanks"
            : difficulty === "practice"
              ? "Daily sentence practice"
              : "Bigger vocabulary round",
        questionCount,
        difficulty,
      };
    });
  }, []);

  const renderItem: ListRenderItem<LevelCard> = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrap}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/(root)/listenandfill/[id]",
          params: { id: item.id },
        })
      }
    >
      <LinearGradient
        colors={gradients[item.difficulty]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tags[item.difficulty]}</Text>
        </View>

        <MaterialCommunityIcons
          name="headphones"
          size={34}
          color="rgba(255,255,255,0.9)"
          style={styles.icon}
        />

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{item.questionCount} Questions</Text>
          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={22}
            color="#fff"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <GameLayout title="Listen and Fill">
      <View style={styles.container}>
        <LinearGradient
          colors={["#3A4CA8", "#5A67D8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Hear. Think. Fill.</Text>
          <Text style={styles.heroSubtitle}>
            Listen carefully and tap the word that completes each sentence.
          </Text>
        </LinearGradient>

        <FlatList
          data={levels}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GameLayout>
  );
};

export default ListenAndFillIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  listContent: { paddingBottom: 20 },
  gridRow: { justifyContent: "space-between", marginBottom: 12 },
  cardWrap: { width: cardWidth },
  card: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 190,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.26)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  badgeText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 10,
  },
  icon: { marginBottom: 10 },
  cardTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
});
