import { db } from "./db";

export const getContentPacks = async () => {
  return await db.getAllAsync("SELECT * FROM content_packs");
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
