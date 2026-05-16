import { db } from "@/database/db";
import type { LocalContentPack } from "@/types/content";
import { checksumsMatch } from "@/services/cms/utils/checksum";
import { isRemoteVersionNewer } from "@/services/cms/utils/versionCompare";

export function getInstalledPack(
  childId: string,
  slug: string,
): LocalContentPack | null {
  const row = db.getFirstSync<LocalContentPack>(
    `SELECT child_id, slug, game_type, title, version, checksum, downloaded_at, local_dir
     FROM content_packs WHERE child_id = ? AND slug = ?`,
    [childId, slug.trim()],
  );
  return row ?? null;
}

export function getInstalledPacks(childId: string): LocalContentPack[] {
  return db.getAllSync<LocalContentPack>(
    `SELECT child_id, slug, game_type, title, version, checksum, downloaded_at, local_dir
     FROM content_packs WHERE child_id = ? ORDER BY downloaded_at DESC`,
    [childId],
  );
}

export function saveContentPackRecord(
  child_id: string,
  slug: string,
  game_type: string,
  title: string,
  version: string | null,
  checksum: string | null,
  local_dir: string,
): void {
  db.runSync(
    `INSERT OR REPLACE INTO content_packs(
      child_id, slug, game_type, title, version, checksum, downloaded_at, local_dir
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      child_id,
      slug,
      game_type,
      title,
      version,
      checksum,
      Date.now(),
      local_dir,
    ],
  );
}

export function isPackCurrent(
  installed: LocalContentPack | null,
  remoteVersion: string | null | undefined,
  remoteChecksum: string | null | undefined,
): boolean {
  if (!installed) return false;
  const versionMatch =
    !!remoteVersion?.trim() &&
    !!installed.version?.trim() &&
    installed.version.trim() === remoteVersion.trim();

  if (versionMatch) {
    if (remoteChecksum && installed.checksum) {
      return checksumsMatch(installed.checksum, remoteChecksum);
    }
    return true;
  }

  if (
    remoteChecksum &&
    installed.checksum &&
    checksumsMatch(installed.checksum, remoteChecksum)
  ) {
    return true;
  }

  return false;
}

export function catalogUpdateAvailable(
  installed: LocalContentPack | null,
  catalogVersion: string | null | undefined,
): boolean {
  if (!installed) return false;
  return isRemoteVersionNewer(catalogVersion, installed.version);
}
