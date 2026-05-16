import { create } from "zustand";
import { ContentApiError } from "@/services/api/content.api";
import {
  catalogErrorMessage,
  loadContentCatalog,
} from "@/services/cms/catalog/contentCatalogService";
import {
  installContentPack,
  PackInstallError,
} from "@/services/cms/import/contentPackPipeline";
import {
  catalogUpdateAvailable,
  getInstalledPacks,
} from "@/services/cms/repositories/contentPackRepository";
import { getAccessToken, getUser } from "@/services/db/authStorage";
import type {
  ContentPack,
  InstalledPackSummary,
  PackInstallResult,
} from "@/types/content";

export type ContentCatalogStatus = "idle" | "loading" | "success" | "error";

interface ContentState {
  packs: ContentPack[];
  installedBySlug: Record<string, InstalledPackSummary>;
  status: ContentCatalogStatus;
  error: string | null;
  fromCache: boolean;
  progressSlug: string | null;
  loadContent: (options?: { force?: boolean }) => Promise<void>;
  downloadPack: (
    pack: ContentPack,
    options?: { force?: boolean },
  ) => Promise<PackInstallResult>;
  clearError: () => void;
}

function buildInstalledMap(
  childId: string | null,
  catalog: ContentPack[],
): Record<string, InstalledPackSummary> {
  if (!childId) return {};
  const installed = getInstalledPacks(childId);
  const map: Record<string, InstalledPackSummary> = {};
  for (const row of installed) {
    const catalogRow = catalog.find((p) => p.slug === row.slug);
    const catalogVersion =
      catalogRow?.version ??
      (catalogRow?.latest_published_version != null
        ? String(catalogRow.latest_published_version)
        : undefined);
    map[row.slug] = {
      slug: row.slug,
      version: row.version,
      checksum: row.checksum,
      game_type: String(row.game_type),
      title: row.title,
      downloaded_at: row.downloaded_at,
      updateAvailable: catalogUpdateAvailable(row, catalogVersion),
    };
  }
  return map;
}

export const useContentStore = create<ContentState>((set, get) => ({
  packs: [],
  installedBySlug: {},
  status: "idle",
  error: null,
  fromCache: false,
  progressSlug: null,

  clearError: () => set({ error: null }),

  loadContent: async (options) => {
    set({ status: "loading", error: null });
    try {
      const token = await getAccessToken();
      const user = await getUser();
      const childId = user?.id != null ? String(user.id) : null;

      const { packs, fromCache } = await loadContentCatalog(token, {
        forceRefresh: options?.force === true,
      });

      set({
        packs,
        installedBySlug: buildInstalledMap(childId, packs),
        status: "success",
        fromCache,
        error: null,
      });
    } catch (error) {
      console.error("Failed to load content catalog:", error);
      set({
        status: "error",
        error: catalogErrorMessage(error),
      });
    }
  },

  downloadPack: async (pack, options) => {
    const user = await getUser();
    if (!user?.id) {
      throw new Error("Log in first to save packs for your profile.");
    }
    const childId = String(user.id);
    const token = await getAccessToken();

    set({ progressSlug: pack.slug, error: null });

    try {
      const result = await installContentPack(
        childId,
        pack,
        token,
        { force: options?.force },
      );

      if (result.status !== "skipped") {
        const catalog = get().packs;
        set({
          installedBySlug: buildInstalledMap(childId, catalog),
        });
      }

      set({ progressSlug: null });
      return result;
    } catch (error) {
      set({ progressSlug: null });
      const message =
        error instanceof PackInstallError ||
        error instanceof ContentApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Download failed.";
      set({ error: message });
      throw error;
    }
  },
}));
