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
import GameLayout from "@/components/GameLayout";
import { LinearGradient } from "expo-linear-gradient";

type StoryKeywordInfo = {
  meaning: string;
  pronunciation: string;
  example: string;
};

type StoryPage = {
  storytext: string;
  keywords: string[];
  imagelink: string;
};

type StoryQuestion = {
  text: string;
  choices: string[];
  correctanswer: string;
};

type StoryItem = {
  title: string;
  pagecount: number;
  thumbnaillink: string;
  pages: StoryPage[];
  questions: StoryQuestion[];
  keywordInfo: Record<string, StoryKeywordInfo>;
};

type StoryGameContent = {
  contents: {
    story: {
      stories: Record<string, StoryItem>;
    };
  };
};

export const STORY_GAME_CONTENT: StoryGameContent = {
  contents: {
    story: {
      stories: {
        story_1: {
          title: "The Lion and the Mouse",
          pagecount: 3,
          thumbnaillink:
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=900",
          pages: [
            {
              storytext:
                "One warm afternoon, a lion was sleeping under a tree in the forest.",
              keywords: ["lion", "forest"],
              imagelink:
                "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1200",
            },
            {
              storytext:
                "A tiny mouse ran across the lion's paw and woke him up. The lion was angry, but the mouse asked for mercy.",
              keywords: ["mouse", "mercy"],
              imagelink:
                "https://images.unsplash.com/photo-1598751337485-41099df6c7f6?w=1200",
            },
            {
              storytext:
                "Later, the lion was trapped in a hunter's net. The mouse chewed the ropes and saved the lion.",
              keywords: ["hunter", "saved"],
              imagelink:
                "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1200",
            },
          ],
          questions: [
            {
              text: "Who helped the lion at the end?",
              choices: ["A bird", "The mouse", "A hunter", "Another lion"],
              correctanswer: "The mouse",
            },
            {
              text: "Where was the lion trapped?",
              choices: ["In a cave", "In a net", "In a river", "In a house"],
              correctanswer: "In a net",
            },
          ],
          keywordInfo: {
            lion: {
              meaning: "A big wild cat known as the king of the jungle.",
              pronunciation: "LAI-uhn",
              example: "The lion roared loudly.",
            },
            forest: {
              meaning: "A large area full of trees and plants.",
              pronunciation: "FOR-ist",
              example: "We walked through the forest.",
            },
            mouse: {
              meaning: "A very small animal with a long tail.",
              pronunciation: "maws",
              example: "The mouse ran quickly.",
            },
            mercy: {
              meaning: "Kindness shown to someone who is in your power.",
              pronunciation: "MUR-see",
              example: "She asked for mercy.",
            },
            hunter: {
              meaning: "A person who catches or kills animals.",
              pronunciation: "HUN-ter",
              example: "The hunter set a trap.",
            },
            saved: {
              meaning: "Helped someone stay safe from danger.",
              pronunciation: "sayvd",
              example: "He saved his friend.",
            },
          },
        },
        story_2: {
          title: "The Honest Woodcutter",
          pagecount: 3,
          thumbnaillink:
            "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900",
          pages: [
            {
              storytext:
                "A woodcutter worked by the river every day with his old axe.",
              keywords: ["woodcutter", "axe"],
              imagelink:
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
            },
            {
              storytext:
                "One day, his axe slipped and fell into the deep river. He felt very sad.",
              keywords: ["river", "deep"],
              imagelink:
                "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?w=1200",
            },
            {
              storytext:
                "A spirit rewarded his honesty and returned his axe. He went home happily.",
              keywords: ["spirit", "honesty"],
              imagelink:
                "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200",
            },
          ],
          questions: [
            {
              text: "What did the woodcutter lose?",
              choices: ["His hat", "His axe", "His shoes", "His bag"],
              correctanswer: "His axe",
            },
            {
              text: "Why was he rewarded?",
              choices: [
                "For running fast",
                "For honesty",
                "For singing",
                "For fishing",
              ],
              correctanswer: "For honesty",
            },
          ],
          keywordInfo: {
            woodcutter: {
              meaning: "A person who cuts wood from trees.",
              pronunciation: "WOOD-kuh-ter",
              example: "The woodcutter carried logs.",
            },
            axe: {
              meaning: "A tool with a sharp blade used for cutting wood.",
              pronunciation: "aks",
              example: "He sharpened his axe.",
            },
            river: {
              meaning: "A natural stream of flowing water.",
              pronunciation: "RIV-er",
              example: "Fish swim in the river.",
            },
            deep: {
              meaning: "Going far down from the top.",
              pronunciation: "deep",
              example: "The well is very deep.",
            },
            spirit: {
              meaning: "A magical being in stories.",
              pronunciation: "SPIR-it",
              example: "The spirit appeared in the light.",
            },
            honesty: {
              meaning: "Telling the truth and being fair.",
              pronunciation: "ON-uh-stee",
              example: "Honesty builds trust.",
            },
          },
        },
      },
    },
  },
};

type StoryCard = {
  id: string;
  title: string;
  pagecount: number;
  thumbnaillink: string;
  questionCount: number;
};

const StoryQuizIndex = () => {
  const stories = useMemo<StoryCard[]>(() => {
    return Object.entries(STORY_GAME_CONTENT.contents.story.stories).map(
      ([id, story]) => ({
        id,
        title: story.title,
        pagecount: story.pagecount,
        thumbnaillink: story.thumbnaillink,
        questionCount: story.questions.length,
      }),
    );
  }, []);

  return (
    <GameLayout title="Story Quiz">
      <View style={styles.container}>
        <LinearGradient colors={["#3A4CA8", "#5A67D8"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Story Adventure</Text>
          <Text style={styles.heroSubtitle}>
            Read one page at a time, explore key words, then answer quiz
            questions.
          </Text>
        </LinearGradient>

        <FlatList
          data={stories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/(root)/storyquiz/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Image
                source={{ uri: item.thumbnaillink }}
                style={styles.thumb}
              />
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>
                  {item.pagecount} pages • {item.questionCount} quiz questions
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No story levels found.</Text>
            </View>
          }
        />
      </View>
    </GameLayout>
  );
};

export default StoryQuizIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#AEB1D0",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "#2A2E58",
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    marginBottom: 4,
  },
  subtitle: {
    color: "#C9CCE8",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
    fontSize: 15,
  },
});
