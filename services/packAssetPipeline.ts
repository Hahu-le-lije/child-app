import * as FileSystem from "expo-file-system/legacy";
import { makeDirectoryAsync, downloadAsync, writeAsStringAsync } from "expo-file-system/legacy";

const CONTENT_DIR = FileSystem.documentDirectory + "content/";

export function isRemoteAssetUrl(s: string): boolean {
  return typeof s === "string" && /^https?:\/\//i.test(s.trim());
}

function walk(obj: unknown, urls: Set<string>): void {
  if (obj == null) return;
  if (typeof obj === "string") {
    if (isRemoteAssetUrl(obj)) urls.add(obj.trim());
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) walk(item, urls);
    return;
  }
  if (typeof obj === "object") {
    for (const v of Object.values(obj as Record<string, unknown>)) walk(v, urls);
  }
}

/** Collect unique http(s) URLs from any JSON-serializable tree. */
export function collectRemoteUrls(root: unknown): string[] {
  const set = new Set<string>();
  walk(root, set);
  return [...set];
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 10);
}

function fileNameForUrl(url: string, index: number): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "file";
    const safe = last.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `${index}_${simpleHash(url)}_${safe}`;
  } catch {
    return `${index}_${simpleHash(url)}_asset`;
  }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function replaceStrings(obj: unknown, urlMap: Record<string, string>): unknown {
  if (obj == null) return obj;
  if (typeof obj === "string") {
    const mapped = urlMap[obj] ?? urlMap[obj.trim()];
    return mapped !== undefined ? mapped : obj;
  }
  if (Array.isArray(obj)) return obj.map((x) => replaceStrings(x, urlMap));
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = replaceStrings(v, urlMap);
    }
    return out;
  }
  return obj;
}

export async function ensurePackAssetDir(packId: string): Promise<string> {
  const dir = `${CONTENT_DIR}${packId}/assets/`;
  await makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

export async function ensurePackRootDir(packId: string): Promise<string> {
  const dir = `${CONTENT_DIR}${packId}/`;
  await makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

/**
 * Downloads every remote URL found in the JSON tree into
 * `documentDirectory/content/{packId}/assets/`, then returns a deep clone
 * with those strings replaced by local `file://` URIs from expo-file-system.
 */
export async function downloadAndResolveRemoteAssets(
  root: unknown,
  packId: string,
  onProgress?: (progress01: number) => void
): Promise<{ resolved: unknown; downloaded: number; failed: number }> {
  const urls = collectRemoteUrls(root);
  if (urls.length === 0) {
    onProgress?.(1);
    return { resolved: deepClone(root), downloaded: 0, failed: 0 };
  }

  await ensurePackRootDir(packId);
  const assetDir = await ensurePackAssetDir(packId);
  const urlMap: Record<string, string> = {};
  let failed = 0;
  let i = 0;
  for (const url of urls) {
    const name = fileNameForUrl(url, i);
    const dest = assetDir + name;
    try {
      const result = await downloadAsync(url, dest);
      if (result?.uri) urlMap[url] = result.uri;
      else failed++;
    } catch (e) {
      console.warn("[packAssetPipeline] download failed:", url, e);
      failed++;
    }
    i++;
    onProgress?.(i / urls.length);
  }

  const resolved = replaceStrings(deepClone(root), urlMap) as unknown;
  return { resolved, downloaded: urls.length - failed, failed };
}

export async function writeResolvedManifestFile(
  packId: string,
  resolved: unknown
): Promise<string> {
  await ensurePackRootDir(packId);
  const path = `${CONTENT_DIR}${packId}/manifest.json`;
  await writeAsStringAsync(path, JSON.stringify(resolved, null, 0));
  return path;
}
