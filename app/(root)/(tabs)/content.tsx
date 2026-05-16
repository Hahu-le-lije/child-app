import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
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
  const {
    packs,
    progressSlug,
    installedBySlug,
    status,
    error,
    fromCache,
    loadContent,
    downloadPack,
    clearError,
  } = useContentStore();
  const [storage, setStorage] = useState({ free: 0, total: 0 });

  const loadData = useCallback(
    async (force?: boolean) => {
      clearError();
      await loadContent({ force });
      const deviceStorage = await getDeviceStorage();
      setStorage(deviceStorage);
    },
    [loadContent, clearError],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  type ItemStatus = "downloading" | "downloaded" | "update" | "available";

  const getItemStatus = (pack: ContentPackListItem): ItemStatus => {
    if (progressSlug === pack.slug) return "downloading";
    const installed = installedBySlug[pack.slug];
    if (!installed) return "available";
    if (installed.updateAvailable) return "update";
    return "downloaded";
  };

  const checkInstalledPacks = async () => {
    try {
      const user = await getUser();
      if (!user?.id) {
        Alert.alert("Not signed in", "Log in to see saved packs.");
        return;
      }
      const rows = getInstalledPacks(String(user.id));
      const lines =
        rows.length === 0
          ? "No packs installed yet."
          : rows
              .map(
                (r) =>
                  `• ${r.title ?? r.slug} (${r.game_type}) v${r.version ?? "?"} — ${new Date(r.downloaded_at).toLocaleString()}`,
              )
              .join("\n");
      Alert.alert("Installed packs", lines);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not list folders.");
    }
  };

  const handleDownload = async (
    item: ContentPackListItem,
    force = false,
  ) => {
    try {
      const result = await downloadPack(item, { force });
      if (result.status === "skipped") {
        Alert.alert("Up to date", `"${item.title}" is already on this device.`);
        return;
      }
      if (result.status === "updated") {
        Alert.alert("Updated", `"${item.title}" was updated offline.`);
        return;
      }
      Alert.alert("Saved", `"${item.title}" is ready offline.`);
    } catch (err: unknown) {
      const msg =
        err instanceof ContentApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Download failed.";
      Alert.alert("Download problem", msg);
    }
  };

  const renderItem = ({ item }: { item: ContentPackListItem }) => {
    const itemStatus = getItemStatus(item);
    const gameLabel = item.game_type ?? item.gameType ?? item.type ?? "game";
    const thumb = item.thumbnail_url ?? item.thumbnail;
    const sizeLabel = item.size_mb ?? item.sizeMb;
    const installed = installedBySlug[item.slug];

    return (
      <View style={styles.card}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumbnail} />
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
            {sizeLabel != null ? (
              <Text style={styles.size}>{sizeLabel} MB</Text>
            ) : null}
            <Text style={styles.gameType}>{gameLabel}</Text>
            {installed?.version ? (
              <Text style={styles.versionTag}>v{installed.version}</Text>
            ) : null}
          </View>
          {itemStatus === "downloading" && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "60%" }]} />
            </View>
          )}
        </View>
        {itemStatus === "downloaded" && (
          <MaterialCommunityIcons
            name="check-circle"
            size={26}
            color="#20BF6B"
          />
        )}
        {itemStatus === "update" && (
          <TouchableOpacity onPress={() => void handleDownload(item, true)}>
            <MaterialCommunityIcons
              name="update"
              size={26}
              color="#F7B731"
            />
          </TouchableOpacity>
        )}
        {itemStatus === "available" && (
          <TouchableOpacity onPress={() => void handleDownload(item)}>
            <Ionicons name="cloud-download-outline" size={26} color="#5D5FEF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const formatGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1);

  if (status === "loading" && packs.length === 0) {
    return (
      <SafeAreaComponent style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator color="#5D5FEF" />
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
          Download packs to play without internet
          {fromCache ? " (cached catalog)" : ""}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => void loadData(true)}>
            <Text style={styles.retryInline}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

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
          <TouchableOpacity
            onPress={() => void loadData(true)}
            style={styles.retryButton}
          >
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
          refreshing={status === "loading"}
          onRefresh={() => void loadData(true)}
        />
      )}
    </SafeAreaComponent>
  );
};

export default Content;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
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
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#4A2F2F",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: "#FFB4B4",
    flex: 1,
    fontSize: 13,
  },
  retryInline: {
    color: "#5D5FEF",
    fontFamily: "Poppins-SemiBold",
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
    flexWrap: "wrap",
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
  versionTag: {
    color: "#aaa",
    fontSize: 11,
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
    gap: 12,
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
