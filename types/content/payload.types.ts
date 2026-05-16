import type { GameTypeKey } from "@/services/cms/gameContentService";

/** Top-level download JSON envelope (before/after parsing inner payload) */
export type PackDownloadEnvelope = {
  version?: string;
  checksum?: string;
  contents?: Record<string, unknown>;
  [key: string]: unknown;
};

export type PackImportContext = {
  childId: string;
  slug: string;
  game: GameTypeKey;
  title: string;
  manifestVersion?: string;
  manifestChecksum?: string;
  catalogVersion?: string;
};
