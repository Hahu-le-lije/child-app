/** Normalized manifest from GET /api/content/packs/{slug}/manifest */
export type ContentPackManifest = {
  slug: string;
  content_pack_id?: number;
  version: string;
  checksum?: string;
  size_bytes?: number;
  min_app_version?: string;
  published_at?: string;
  game_type?: string;
  title?: string;
};

/** Raw Laravel content_pack_versions row shape (when embedded in API responses) */
export type ContentPackVersionRow = {
  content_pack_id: number;
  version: string;
  checksum: string;
  size_bytes: number;
  payload: string;
  min_app_version: string;
  published_at: string;
};
