import { db } from "./db";

export type ContentPackRow = {
  id: string;
  title: string | null;
  size: number | null;
  status: string | null;
  local_path: string | null;
  created_at: string | null;
};

export const getContentPacks = async (): Promise<ContentPackRow[]> => {
  return (await db.getAllAsync("SELECT * FROM content_packs")) as ContentPackRow[];
};

export const saveContentPack = async (
  id: string,
  title: string,
  size: number,
  localPath: string,
) => {
  await db.runAsync(
    `
    INSERT OR REPLACE INTO content_packs
    (id,title,size,status,local_path,created_at)
    VALUES (?,?,?,?,?,datetime('now'))
    `,
    [id, title, size, "downloaded", localPath],
  );
};

export const updateContentStatus = async (id: string, status: string) => {
  await db.runAsync(`UPDATE content_packs SET status=? WHERE id=?`, [
    status,
    id,
  ]);
};

export const savePackManifest = async (
  packId: string,
  manifestJson: string,
  sourcePackPath: string
) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO pack_manifests (pack_id, manifest_json, source_pack_path, created_at)
     VALUES (?,?,?,datetime('now'))`,
    [packId, manifestJson, sourcePackPath]
  );
};

export const getPackManifestJson = async (
  packId: string
): Promise<string | null> => {
  const row = (await db.getFirstAsync(
    `SELECT manifest_json FROM pack_manifests WHERE pack_id = ?`,
    [packId]
  )) as { manifest_json: string } | null;
  return row?.manifest_json ?? null;
};

export const getPackManifest = async (packId: string): Promise<unknown | null> => {
  const raw = await getPackManifestJson(packId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};
