import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import SafeAreaComponent from "@/components/SafeAreaComponent";
import { useContentStore } from "@/store/contentStore";
import { getDeviceStorage } from "@/services/contentService";
import { getContentPacks } from "@/database/contentRepository";
import * as FileSystem from 'expo-file-system/legacy'; 

const Content = () => {
  const { packs, progress, loadContent, downloadPack } = useContentStore();
  const [storage, setStorage] = React.useState({ free: 0, total: 0 });

  useEffect(() => {
    loadContent();
    loadStorage();
  }, []);

  const loadStorage = async () => {
    const deviceStorage = await getDeviceStorage();
    setStorage(deviceStorage);
  };

  const getItemStatus = (pack: any) => {
    if (progress[pack.id] !== undefined) {
      return { status: "downloading", progress: progress[pack.id] };
    }
   
    return { status: "available", progress: undefined };
  };

  const checkSavedFiles = async () => {
    try {
    
      const savedPacks = await getContentPacks();
      
      const fileInfos = await Promise.all(
        savedPacks.map(async (pack) => {
          const fileUri = FileSystem.documentDirectory + "content/" + pack.id + ".pack";
          try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            return {
              id: pack.id,
              title: pack.title,
              dbPath: pack.local_path,
              fileExists: fileInfo.exists,
              fileSize: fileInfo.exists ? fileInfo.size : 0,
              filePath: fileUri
            };
          } catch (error) {
            return {
              id: pack.id,
              title: pack.title,
              error: error.message
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
            size: info.size,
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

  const renderItem = ({ item }: { item: any }) => {
    const itemStatus = getItemStatus(item);
    
    return (
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="package-variant"
            size={26}
            color="#5D5FEF"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.size}>{item.size} MB</Text>
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
      
      <FlatList
        data={packs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />
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
    marginRight: 14,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  size: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#3F3F5F",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5D5FEF",
  },
});

export default Content;