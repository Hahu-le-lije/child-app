import * as FileSystem from "expo-file-system/legacy";

export const downloadAndCacheFile = async (url: string, folder: string) => {
  const filename = url.split("/").pop()?.split("?")[0] ?? `file_${Date.now()}`;
  const baseDir = FileSystem.documentDirectory + folder;
  const localPath = baseDir + filename;

  const fileInfo = await FileSystem.getInfoAsync(localPath);

  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(baseDir, {
      intermediates: true,
    });

    await FileSystem.downloadAsync(url, localPath);
  }

  return localPath;
};

export function packRootDir(childId: string, packSlug: string) {
  const safeSlug = encodeURIComponent(packSlug.trim()).replace(/%/g, "_");
  return `${FileSystem.documentDirectory}content/packs/${childId}/${safeSlug}/`;
}

/** Scoped folder for a child's pack so assets never collide across users or packs. */
export function packAssetDir(childId: string, packSlug: string, category: string) {
  return `${packRootDir(childId, packSlug)}${category.replace(/^\/+|\/+$/g, "")}/`;
}

export async function downloadPackAsset(
  url: string | undefined | null,
  childId: string,
  packSlug: string,
  category: string
): Promise<string> {
  if (!url || typeof url !== "string" || url.trim().length === 0) return "";
  const filename = url.split("/").pop()?.split("?")[0] ?? `asset_${Date.now()}`;
  const dir = packAssetDir(childId, packSlug, category);
  const localPath = `${dir}${filename}`;
  const fileInfo = await FileSystem.getInfoAsync(localPath);
  if (fileInfo.exists) return localPath;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  await FileSystem.downloadAsync(url.trim(), localPath);
  return localPath;
}
