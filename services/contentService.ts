import {
  makeDirectoryAsync,
  getFreeDiskStorageAsync,
  getTotalDiskCapacityAsync,
  downloadAsync,
} from "expo-file-system/legacy";
import * as FileSystem from "expo-file-system/legacy";

const CONTENT_DIR = FileSystem.documentDirectory + "content/";

export const ensureContentFolder = async () => {
  await makeDirectoryAsync(CONTENT_DIR, { intermediates: true });
};

type DownloadProgressCb = (p: number) => void;

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

/**
 * Downloads a content pack JSON from a remote URL to a local `.pack` file.
 * `downloadUrl` must be `http` or `https` (e.g. S3 signed URL).
 */
export const downloadContentPack = async (
  url: string | undefined,
  id: string,
  onProgress?: DownloadProgressCb
) => {
  if (!url || !isHttpUrl(url)) {
    throw new Error(
      "Invalid or missing download URL. Content packs must use an https downloadUrl from your catalog."
    );
  }

  try {
    await ensureContentFolder();
    const path = CONTENT_DIR + id + ".pack";
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
