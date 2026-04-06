import React, { useEffect } from "react";
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
import SafeAreaComponent from "@/components/SafeAreaComponent";
import { useContentStore } from "@/store/contentStore";
import type { ContentPackCatalogItem } from "@/services/contentApi";
import { getDeviceStorage } from "@/services/contentService";
import { getContentPacks } from "@/database/contentRepository";
import * as FileSystem from 'expo-file-system/legacy'; 

const Content = () => {
  const { packs, progress, downloadedPacks, loadContent, downloadPack } = useContentStore();
  const [storage, setStorage] = React.useState({ free: 0, total: 0 });
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    await loadContent();
    await loadStorage();
    setLoading(false);
  }, [loadContent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadStorage = async () => {
    const deviceStorage = await getDeviceStorage();
    setStorage(deviceStorage);
  };

  const getItemStatus = (pack: ContentPackCatalogItem) => {
    if (progress[pack.id] !== undefined) {
      return { status: "downloading", progress: progress[pack.id] };
    }
    if (downloadedPacks?.[pack.id]) {
      return { status: "downloaded", progress: undefined };
    }
    return { status: "available", progress: undefined };
  };

  const checkSavedFiles = async () => {
    try {
      const savedPacks = (await getContentPacks()) as any[];
      
      const fileInfos = await Promise.all(
        savedPacks.map(async (pack: any) => {
          const fileUri = FileSystem.documentDirectory + "content/" + pack.id + ".pack";
          try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            return {
              id: pack.id,
              title: pack.title,
              dbPath: pack.local_path,
              fileExists: fileInfo.exists,
              fileSize: fileInfo.exists && "size" in fileInfo ? (fileInfo as any).size : 0,
              filePath: fileUri
            };
          } catch (error) {
            return {
              id: pack.id,
              title: pack.title,
              error: (error as any)?.message
            };
          }
        })
      );
      
      const fileResults = fileInfos.map(f => 
        `${f.title}: ${f.fileExists ? '✅ File exists' : '❌ Missing'} (${f.fileSize} bytes)`
      ).join('\n');
      
      Alert.alert(
        "Saved Files Check",
        `Database records: ${savedPacks.length}\n\n${fileResults}`
      );
      
    } catch (error) {
      console.error("Check failed:", error);
      Alert.alert("Error", "Failed to check saved files");
    }
  };

  const readFileContent = async (packId: string) => {
    try {
      const fileUri = FileSystem.documentDirectory + "content/" + packId + ".pack";
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        console.log(`📄 Content of ${packId}:`, content);
        Alert.alert("File Content", `File contains: ${content}`);
      } else {
        Alert.alert("Error", "File not found");
      }
    } catch (error) {
      console.error("Read failed:", error);
      Alert.alert("Error", "Failed to read file");
    }
  };

  const listAllFiles = async () => {
    try {
      const contentDir = FileSystem.documentDirectory + "content/";
      const dirInfo = await FileSystem.getInfoAsync(contentDir);
      
      if (!dirInfo.exists) {
        Alert.alert("Info", "No files downloaded yet");
        return;
      }
      
      const files = await FileSystem.readDirectoryAsync(contentDir);
      
      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          const fileUri = contentDir + filename;
          const info = await FileSystem.getInfoAsync(fileUri);
          return {
            name: filename,
            size: "size" in info ? (info as any).size : 0,
          };
        })
      );
      
      const fileList = fileDetails.map(f => 
        `📄 ${f.name} (${(f.size / 1024).toFixed(2)} KB)`
      ).join('\n');
      
      Alert.alert(
        "Downloaded Files",
        `Found ${files.length} files:\n\n${fileList}`
      );
      
    } catch (error) {
      console.error("List failed:", error);
      Alert.alert("Error", "Failed to list files");
    }
  };

  const renderItem = ({ item }: { item: ContentPackCatalogItem }) => {
    const itemStatus = getItemStatus(item);
    
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
            <Text style={styles.size}>{item.size} MB</Text>
            <Text style={styles.gameType}>{item.gameType}</Text>
          </View>
          {itemStatus.status === "downloading" && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(itemStatus.progress || 0) * 100}%` },
                ]}
              />
            </View>
          )}
        </View>
        {itemStatus.status === "downloaded" && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => readFileContent(item.id)}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={26}
                color="#5D5FEF"
              />
            </TouchableOpacity>
            <MaterialCommunityIcons
              name="check-circle"
              size={26}
              color="#20BF6B"
            />
          </View>
        )}
        {itemStatus.status === "available" && (
          <TouchableOpacity onPress={() => downloadPack(item)}>
            <Ionicons
              name="cloud-download-outline"
              size={26}
              color="#5D5FEF"
            />
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
          Download games to play offline
        </Text>
      </View>
      
      <View style={styles.debugContainer}>
        <TouchableOpacity onPress={checkSavedFiles} style={styles.debugButton}>
          <Text style={styles.debugButtonText}>🔍 Check DB</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={listAllFiles} style={styles.debugButton}>
          <Text style={styles.debugButtonText}>📂 List Files</Text>
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
          <MaterialCommunityIcons name="package-variant" size={60} color="#3F3F5F" />
          <Text style={styles.emptyText}>No content packs available</Text>
          <Text style={styles.emptyHint}>
            Configure EXPO_PUBLIC_CONTENT_CATALOG_URL to load packs from your API.
          </Text>
          <TouchableOpacity onPress={loadData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<ContentPackCatalogItem>
          data={packs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaComponent>
  );
};

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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: '#3F3F5F',
    padding: 10,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  size: {
    color: "#5D5FEF",
    fontSize: 12,
    backgroundColor: '#3F3F5F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gameType: {
    color: "#20BF6B",
    fontSize: 12,
    backgroundColor: '#1F3A2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  progressBar: {
    height: 6,
    backgroundColor: "#3F3F5F",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
    width: '100%',
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5D5FEF",
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    color: '#6E6E8D',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: '#5D5FEF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default Content;