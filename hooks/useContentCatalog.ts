import { useContentStore } from "@/store/contentStore";

/** Thin hook over the content catalog zustand store */
export function useContentCatalog() {
  const packs = useContentStore((s) => s.packs);
  const installedBySlug = useContentStore((s) => s.installedBySlug);
  const status = useContentStore((s) => s.status);
  const error = useContentStore((s) => s.error);
  const fromCache = useContentStore((s) => s.fromCache);
  const progressSlug = useContentStore((s) => s.progressSlug);
  const loadContent = useContentStore((s) => s.loadContent);
  const downloadPack = useContentStore((s) => s.downloadPack);
  const clearError = useContentStore((s) => s.clearError);

  const isLoading = status === "loading";
  const hasError = status === "error" && !!error;

  return {
    packs,
    installedBySlug,
    status,
    error,
    fromCache,
    progressSlug,
    isLoading,
    hasError,
    loadContent,
    downloadPack,
    clearError,
  };
}
