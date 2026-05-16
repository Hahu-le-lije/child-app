/** Remote catalog row from GET /api/content/packs */
export type ContentPack = {
  id?: number;
  slug: string;
  title: string;
  description?: string;
  game_type?: string;
  thumbnail_url?: string;
  size_mb?: number;
  is_active?: boolean;
  latest_published_version?: string | number | null;
  /** Normalized from latest_published_version for UI comparisons */
  version?: string;
  /** API aliases normalized at fetch time */
  gameType?: string;
  type?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  sizeMb?: number;
};

/** Alias kept for screens that imported the old name */
export type ContentPackListItem = ContentPack;
