import * as FileSystem from "expo-file-system/legacy";

const REMOTE_URL_PATTERN = /^https?:\/\//i;

export function isRemoteAssetUrl(value: unknown): value is string {
  return typeof value === "string" && REMOTE_URL_PATTERN.test(value.trim());
}

export function packRootDir(childId: string, packSlug: string): string {
  const safeSlug = encodeURIComponent(packSlug.trim()).replace(/%/g, "_");
  return `${FileSystem.documentDirectory}content/packs/${childId}/${safeSlug}/`;
}

export function packAssetDir(
  childId: string,
  packSlug: string,
  category: string,
): string {
  return `${packRootDir(childId, packSlug)}${category.replace(/^\/+|\/+$/g, "")}/`;
}

export async function downloadPackAsset(
  url: string | undefined | null,
  childId: string,
  packSlug: string,
  category: string,
): Promise<string> {
  if (!isRemoteAssetUrl(url)) return "";
  const trimmed = url.trim();
  const filename =
    trimmed.split("/").pop()?.split("?")[0] ?? `asset_${Date.now()}`;
  const dir = packAssetDir(childId, packSlug, category);
  const localPath = `${dir}${filename}`;
  const fileInfo = await FileSystem.getInfoAsync(localPath);
  if (fileInfo.exists) return localPath;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  await FileSystem.downloadAsync(trimmed, localPath);
  return localPath;
}
