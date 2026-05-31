import * as FileSystem from "expo-file-system/legacy";

const REMOTE_URL_PATTERN = /^https?:\/\//i;

/** Placeholder hosts from CMS samples — skip so import still succeeds offline. */
const SKIPPED_ASSET_HOSTS = new Set([
  "cdn.example.com",
  "example.com",
  "www.example.com",
]);

export function isRemoteAssetUrl(value: unknown): value is string {
  return typeof value === "string" && REMOTE_URL_PATTERN.test(value.trim());
}

export function shouldSkipPackAssetDownload(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    if (SKIPPED_ASSET_HOSTS.has(host)) return true;
    return host.endsWith(".example.com");
  } catch {
    return false;
  }
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
  if (shouldSkipPackAssetDownload(trimmed)) {
    console.warn(`[cms] Skipping placeholder asset URL: ${trimmed}`);
    return "";
  }
  const filename =
    trimmed.split("/").pop()?.split("?")[0] ?? `asset_${Date.now()}`;
  const dir = packAssetDir(childId, packSlug, category);
  const localPath = `${dir}${filename}`;
  const fileInfo = await FileSystem.getInfoAsync(localPath);
  if (fileInfo.exists) return localPath;
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    await FileSystem.downloadAsync(trimmed, localPath);
    return localPath;
  } catch (error) {
    console.warn(`[cms] Asset download failed (${trimmed}):`, error);
    return "";
  }
}
