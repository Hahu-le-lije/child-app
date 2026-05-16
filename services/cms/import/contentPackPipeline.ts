import {
  ContentApiError,
  fetchPackDownload,
  fetchPackManifest,
  normalizePackManifest,
} from "@/services/api/content.api";
import { importPackPayload, normalizePackGameType } from "@/services/cms/packImportService";
import {
  getInstalledPack,
  isPackCurrent,
} from "@/services/cms/repositories/contentPackRepository";
import {
  extractPayloadVersion,
  validatePackPayload,
} from "@/services/cms/utils/payloadValidation";
import { checksumsMatch } from "@/services/cms/utils/checksum";
import type { ContentPack, PackInstallResult } from "@/types/content";

export class PackInstallError extends Error {
  constructor(
    message: string,
    public readonly code?:
      | "unsupported_game"
      | "already_current"
      | "validation"
      | "network",
  ) {
    super(message);
    this.name = "PackInstallError";
  }
}

export type InstallPackOptions = {
  /** Re-download even when version/checksum already match */
  force?: boolean;
};

export async function installContentPack(
  childId: string,
  pack: ContentPack,
  accessToken?: string | null,
  options?: InstallPackOptions,
): Promise<PackInstallResult> {
  const slug = pack.slug.trim();
  const game = normalizePackGameType(
    pack.game_type ?? pack.gameType ?? pack.type ?? null,
  );
  if (!game) {
    throw new PackInstallError(
      `Pack "${pack.title}" has no recognized game_type.`,
      "unsupported_game",
    );
  }

  let manifest;
  try {
    const rawManifest = await fetchPackManifest(slug, accessToken);
    manifest = normalizePackManifest(rawManifest, slug);
  } catch (error) {
    if (error instanceof ContentApiError) throw error;
    throw new PackInstallError("Failed to load pack manifest", "network");
  }

  const remoteVersion =
    manifest.version ||
    (pack.version ??
      (pack.latest_published_version != null
        ? String(pack.latest_published_version)
        : undefined));

  const remoteChecksum = manifest.checksum;
  const installed = getInstalledPack(childId, slug);
  const previousVersion = installed?.version ?? null;

  if (
    !options?.force &&
    isPackCurrent(installed, remoteVersion, remoteChecksum)
  ) {
    return { status: "skipped", reason: "already_current" };
  }

  let payload: unknown;
  try {
    payload = await fetchPackDownload(slug, accessToken);
  } catch (error) {
    if (error instanceof ContentApiError) throw error;
    throw new PackInstallError("Failed to download pack", "network");
  }

  validatePackPayload(game, payload);

  const payloadVersion = extractPayloadVersion(payload);
  if (
    remoteVersion &&
    payloadVersion &&
    payloadVersion !== remoteVersion
  ) {
    console.warn(
      `[cms] Pack ${slug}: payload version ${payloadVersion} differs from manifest ${remoteVersion}`,
    );
  }

  const downloadChecksum =
    payload &&
    typeof payload === "object" &&
    typeof (payload as Record<string, unknown>).checksum === "string"
      ? ((payload as Record<string, unknown>).checksum as string)
      : undefined;

  if (
    remoteChecksum &&
    downloadChecksum &&
    !checksumsMatch(remoteChecksum, downloadChecksum)
  ) {
    console.warn(
      `[cms] Pack ${slug}: download checksum does not match manifest (continuing import)`,
    );
  }

  const versionToRecord = payloadVersion ?? remoteVersion ?? null;
  const checksumToRecord = remoteChecksum ?? downloadChecksum ?? null;

  await importPackPayload(
    childId,
    slug,
    game,
    payload,
    pack.title,
    versionToRecord,
    checksumToRecord,
  );

  if (installed) {
    return { status: "updated", previousVersion };
  }
  return { status: "installed" };
}
