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
  downloadAsync,
} from "expo-file-system/legacy";
import * as FileSystem from "expo-file-system/legacy";
import { getMockContentPackPayload } from "@/services/contentApi";

const CONTENT_DIR = FileSystem.documentDirectory + "content/";

export const ensureContentFolder = async () => {
  await makeDirectoryAsync(CONTENT_DIR, { intermediates: true });
};

type DownloadProgressCb = (p: number) => void;

/**
 * Downloads a content pack to the device.
 * - `mock://...` URLs are simulated (useful during development)
 * - `http(s)://...` URLs are downloaded to a local file
 */
export const downloadContentPack = async (
  url: string | undefined,
  id: string,
  onProgress?: DownloadProgressCb
) => {
  try {
    await ensureContentFolder();
    const path = CONTENT_DIR + id + ".pack";

    if (!url || url.startsWith("mock://")) {
      let progress = 0;
      return await new Promise<string>((resolve, reject) => {
        const interval = setInterval(async () => {
          progress = Math.min(1, progress + 0.1);
          onProgress?.(progress);

          if (progress >= 1) {
            clearInterval(interval);
            try {
              const packId = url?.startsWith("mock://") ? url.replace("mock://", "") : id;
              const payload = await getMockContentPackPayload(packId);
              if (!payload) throw new Error(`Unknown mock pack: ${packId}`);
              await writeAsStringAsync(path, JSON.stringify(payload));
              resolve(path);
            } catch (writeError) {
              reject(writeError);
            }
          }
        }, 250);

        setTimeout(() => {
          clearInterval(interval);
          reject(new Error("Download timeout"));
        }, 20000);
      });
    }

    // Real download (no progress callback with legacy downloadAsync)
    onProgress?.(0);
    const result = await downloadAsync(url, path);
    onProgress?.(1);
    return result.uri;
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

// Backwards-compatible export (older callers used this name)
export const simulateDownload = async (id: string, onProgress: DownloadProgressCb) =>
  downloadContentPack(`mock://${id}`, id, onProgress);