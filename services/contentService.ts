{/*
    import * as FileSystem from "expo-file-system";

const CONTENT_DIR = FileSystem.documentDirectory + "content/";

export const ensureContentFolder = async () => {
  const dir = await FileSystem.getInfoAsync(CONTENT_DIR);

  if (!dir.exists) {
    await FileSystem.makeDirectoryAsync(CONTENT_DIR, { intermediates: true });
  }
};

export const downloadContentPack = async (
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
) => {
  await ensureContentFolder();

  const fileUri = CONTENT_DIR + filename;

  const download = FileSystem.createDownloadResumable(
    url,
    fileUri,
    {},
    (progressEvent) => {
      const progress =
        progressEvent.totalBytesWritten /
        progressEvent.totalBytesExpectedToWrite;

      onProgress?.(progress);
    }
  );

  const result = await download.downloadAsync();

  return result?.uri;
}; */}
import {
  makeDirectoryAsync,
  writeAsStringAsync,
  getFreeDiskStorageAsync,
  getTotalDiskCapacityAsync,
} from "expo-file-system/legacy";
import * as FileSystem from 'expo-file-system/legacy';

const CONTENT_DIR = FileSystem.documentDirectory + "content/";

export const simulateDownload = async (
  id: string,
  onProgress: (p: number) => void
) => {
  try {
    const path = CONTENT_DIR + id + ".pack";
    
    // Ensure directory exists
    await makeDirectoryAsync(CONTENT_DIR, {
      intermediates: true,
    });
    
    let progress = 0;
    
    return new Promise<string>((resolve, reject) => {
      const interval = setInterval(async () => {
        progress += 0.1;
        onProgress(progress);
        
        if (progress >= 1) {
          clearInterval(interval);
          try {
            await writeAsStringAsync(path, "fake content file for " + id);
            resolve(path);
          } catch (writeError) {
            reject(writeError);
          }
        }
      }, 300);
      
      // Cleanup if promise is rejected
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Download timeout"));
      }, 10000); // 10 second timeout
    });
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};

export const getDeviceStorage = async () => {
  try {
    const free = await getFreeDiskStorageAsync();
    const total = await getTotalDiskCapacityAsync();
    return { free, total };
  } catch (error) {
    console.error("Failed to get storage info:", error);
    return { free: 0, total: 0 };
  }
};