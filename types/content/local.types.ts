import type { GameTypeKey } from "@/services/cms/gameContentService";

/** Row in SQLite content_packs */
export type LocalContentPack = {
  child_id: string;
  slug: string;
  game_type: GameTypeKey | string;
  title: string | null;
  version: string | null;
  checksum: string | null;
  downloaded_at: number;
  local_dir: string | null;
};

export type InstalledPackSummary = {
  slug: string;
  version: string | null;
  checksum: string | null;
  game_type: string;
  title: string | null;
  downloaded_at: number;
  updateAvailable: boolean;
};

export type PackInstallResult =
  | { status: "installed" }
  | { status: "updated"; previousVersion: string | null }
  | { status: "skipped"; reason: "already_current" };
