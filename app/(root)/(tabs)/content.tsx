import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import SafeAreaComponent from "@/components/SafeAreaComponent";
import {
  ContentApiError,
  type ContentPackListItem,
} from "@/services/api/content.api";
import { useContentStore } from "@/store/contentStore";
import { getInstalledPacks } from "@/services/cms/contentQueryService";
import { getUser } from "@/services/db/authStorage";

async function getDeviceStorage(): Promise<{ free: number; total: number }> {
  try {
    const fs = FileSystem as typeof FileSystem & {
      getFreeDiskStorageAsync?: () => Promise<number>;
      getTotalDiskCapacityAsync?: () => Promise<number>;
    };
    const free = fs.getFreeDiskStorageAsync
      ? await fs.getFreeDiskStorageAsync()
      : 0;
    const total = fs.getTotalDiskCapacityAsync
      ? await fs.getTotalDiskCapacityAsync()
      : 0;
    return { free: free ?? 0, total: total ?? 0 };
  } catch {
    return { free: 0, total: 0 };
  }
}

const Content = () => {
  const { packs, progressSlug, downloadedSlugs, loadContent, downloadPack } =
    useContentStore();
  const [storage, setStorage] = useState({ free: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    await loadContent();
    const deviceStorage = await getDeviceStorage();
    setStorage(deviceStorage);
    setLoading(false);
  }, [loadContent]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const getItemStatus = (pack: ContentPackListItem) => {
    if (progressSlug === pack.slug) {
      return { status: "downloading" as const };
    }
    if (downloadedSlugs[pack.slug]) {
      return { status: "downloaded" as const };
    }
    return { status: "available" as const };
  };

  const checkInstalledPacks = async () => {
    try {
      const user = await getUser();
      if (!user?.id) {
        Alert.alert("Not signed in", "Log in to see saved packs.");
        return;
      }
      const rows = getInstalledPacks(String(user.id)) as Array<{
        slug: string;
        title: string | null;
       []game_type: string;
        downloaded_at: number;
      }>;
      const lines =
        rows.length === 0
          ? "No packs installed yet."
          : rows
              .map(
                (r) =>
                  `• ${r.title ?? r.slug} (${r.game_type}) — ${new Date(r.downloaded_at).toLocaleString()}`,
              )
              .join("\n");
      Alert.alert("Installed packs", lines);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not read local pack records.");
    }
  };

  const listPackFolders = async () => {
    try {
      const user = await getUser();
      const base = `${FileSystem.documentDirectory}content/packs/${
        user?.id ?? ""
      }/`;
      const dirInfo = await FileSystem.getInfoAsync(base);
      if (!dirInfo.exists) {
        Alert.alert(
          "Content folder",
          user?.id ? "No downloads yet." : "Sign in first.",
        );
        return;
      }
      const names = await FileSystem.readDirectoryAsync(base);
      Alert.alert(
        "Downloaded folders",
        names.length ? names.join(", ") : "Empty",
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not list folders.");
    }
  };

  const handleDownload = async (item: ContentPackListItem) => {
    try {
      await downloadPack(item);
      Alert.alert("Saved", `"${item.title}" is ready offline.`);
    } catch (error: unknown) {
      const msg =
        error instanceof ContentApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Download failed.";
      Alert.alert("Download problem", msg);
    }
  };

  const renderItem = ({ item }: { item: ContentPackListItem }) => {
    const itemStatus = getItemStatus(item);
    const gameLabel = item.gameType ?? item.game_type ?? item.type ?? "game";

    return (
      <View style={styles.card}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="package-variant"
              size={26}
              color="#5D5FEF"
            />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description ?? ""}</Text>
          <View style={styles.packInfo}>
            {item.sizeMb != null ? (
              <Text style={styles.size}>{item.sizeMb} MB</Text>
            ) : null}
            <Text style={styles.gameType}>{gameLabel}</Text>
          </View>
          {itemStatus.status === "downloading" && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "60%" }]} />
            </View>
          )}
        </View>
        {itemStatus.status === "downloaded" && (
          <MaterialCommunityIcons
            name="check-circle"
            size={26}
            color="#20BF6B"
          />
        )}
        {itemStatus.status === "available" && (
          <TouchableOpacity onPress={() => void handleDownload(item)}>
            <Ionicons name="cloud-download-outline" size={26} color="#5D5FEF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const formatGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1);

  if (loading) {
    return (
      <SafeAreaComponent style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaComponent>
    );
  }

  return (
    <SafeAreaComponent style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offline Content</Text>
        <Text style={styles.subtitle}>
          One pack per game — download to play without internet
        </Text>
      </View>

      <View style={styles.debugContainer}>
        <TouchableOpacity
          onPress={checkInstalledPacks}
          style={styles.debugButton}
        >
          <Text style={styles.debugButtonText}>Saved packs</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={listPackFolders} style={styles.debugButton}>
          <Text style={styles.debugButtonText}>Folders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.storage}>
        <Text style={styles.storageText}>
          Free: {formatGB(storage.free)} GB
        </Text>
        <Text style={styles.storageText}>
          Total: {formatGB(storage.total)} GB
        </Text>
      </View>

      {packs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={60}
            color="#3F3F5F"
          />
          <Text style={styles.emptyText}>No content packs from the server</Text>
          <Text style={styles.emptyHint}>
            Set EXPO_PUBLIC_API_URL so the app can reach GET /api/content/packs
            (JSON list). Override the path prefix with EXPO_PUBLIC_CONTENT_ROOT
            if your server differs.
          </Text>
          <TouchableOpacity onPress={loadData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<ContentPackListItem>
          data={packs}
          keyExtractor={(item) => item.slug}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaComponent>
  );
};

export default Content;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F39",
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
  subtitle: {
    color: "#aaa",
    marginTop: 4,
  },
  debugContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: "#3F3F5F",
    padding: 10,
    borderRadius: 8,
    flex: 0.45,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  storage: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  storageText: {
    color: "#ccc",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F2F42",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#3F3F5F",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  description: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  packInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  size: {
    color: "#5D5FEF",
    fontSize: 12,
    backgroundColor: "#3F3F5F",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gameType: {
    color: "#20BF6B",
    fontSize: 12,
    backgroundColor: "#1F3A2F",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "capitalize",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#3F3F5F",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5D5FEF",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyHint: {
    color: "#6E6E8D",
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#5D5FEF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
  },
});
