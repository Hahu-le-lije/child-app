import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ListRenderItem,
} from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GameLayout from "@/components/GameLayout";

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
  title: string;
  subtitle: string;
  questionCount: number;
  thumbnail: string;
  difficulty: "easy" | "medium" | "hard";
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

const { width } = Dimensions.get("window");
const cardWidth = (width - 54) / 2;

const difficultyGradients = {
  easy: ["#34C973", "#1FA65E"] as const,
  medium: ["#FFBF54", "#FF9F35"] as const,
  hard: ["#FF7D78", "#F35C58"] as const,
};

const difficultyText = {
  easy: "Easy",
  medium: "Medium",
  hard: "Challenge",
};

const PicToWord = () => {
  const levels = useMemo<LevelCard[]>(() => {
    const levelEntries = Object.entries(
      PICTURE_TO_WORD_CONTENT.contents["picture to word"].levels,
    );

    return levelEntries.map(([levelId, levelData], index) => {
      const firstQuestion = Object.values(levelData)[0];
      const difficulty: LevelCard["difficulty"] =
        index === 0 ? "easy" : index === 1 ? "medium" : "hard";

      return {
        id: levelId,
        title: `Level ${index + 1}`,
        subtitle: `Find pictures for words like "${firstQuestion.questiontext}"`,
        questionCount: Object.keys(levelData).length,
        thumbnail:
          firstQuestion.images[0]?.imagelink ??
          "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=700",
        difficulty,
      };
    });
  }, []);

  const totalQuestions = useMemo(
    () => levels.reduce((sum, level) => sum + level.questionCount, 0),
    [levels],
  );

  const renderLevelCard: ListRenderItem<LevelCard> = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => router.push(`/(root)/pictoword/${item.id}`)}
        activeOpacity={0.92}
      >
        <LinearGradient
          colors={["#2F355B", "#242B4A"]}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />

          <View style={styles.badgeRow}>
            <LinearGradient
              colors={difficultyGradients[item.difficulty]}
              style={styles.difficultyBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.difficultyBadgeText}>
                {difficultyText[item.difficulty]}
              </Text>
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>L{index + 1}</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.levelTitle}>{item.title}</Text>
            <Text style={styles.levelSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.questionPill}>
                <MaterialCommunityIcons
                  name="image-multiple"
                  size={14}
                  color="#A1E5FF"
                />
                <Text style={styles.questionPillText}>
                  {item.questionCount} Questions
                </Text>
              </View>

              <View style={styles.startPill}>
                <Text style={styles.startPillText}>Start</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={14}
                  color="#fff"
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <GameLayout title="Picture to Word">
      <View style={styles.container}>
        <LinearGradient
          colors={["#4D72FF", "#62A7FF"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Look, Read, Tap</Text>
            <Text style={styles.heroSubtitle}>
              Choose the image that matches each word.
            </Text>
          </View>
          <MaterialCommunityIcons name="sticker-emoji" size={44} color="#fff" />
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{levels.length}</Text>
            <Text style={styles.statLabel}>Levels</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>JSON</Text>
            <Text style={styles.statLabel}>Source</Text>
          </View>
        </View>

        <FlatList
          data={levels}
          keyExtractor={(item) => item.id}
          renderItem={renderLevelCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 24,
  },
  heroSubtitle: {
    marginTop: 5,
    color: "rgba(255,255,255,0.92)",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#2D3458",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  statNumber: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
  statLabel: {
    color: "#B3B8D5",
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardContainer: {
    width: cardWidth,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#47507D",
  },
  thumbnail: {
    width: "100%",
    height: 95,
  },
  badgeRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
  },
  levelBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(22,24,38,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
  },
  cardContent: {
    padding: 10,
  },
  levelTitle: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  levelSubtitle: {
    color: "#BCC2E0",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    minHeight: 32,
    fontFamily: "Poppins-Regular",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  questionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  questionPillText: {
    color: "#A1E5FF",
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  startPill: {
    backgroundColor: "#5A76FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  startPillText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
  },
});

export default PicToWord;
