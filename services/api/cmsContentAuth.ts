import { getCmsContentToken } from "@/services/db/authStorage";

const CMS_BASE_URL =
  process.env.EXPO_PUBLIC_CONTENT_API?.trim().replace(/\/+$/, "") ?? "";

const CONTENT_ROOT = (
  process.env.EXPO_PUBLIC_CONTENT_ROOT?.trim() || "/api/content"
).replace(/\/+$/, "");

const ENV_CMS_CONTENT_TOKEN =
  process.env.EXPO_PUBLIC_CMS_CONTENT_TOKEN?.trim() ||
  process.env.EXPO_PUBLIC_CONTENT_TOKEN?.trim() ||
  "";

export type ContentRequestContext = {
  url: string;
  headers: HeadersInit;
  delivery: "token";
  method: "GET";
};

export function clearCmsServiceTokenCache(): void {
  // Kept so callers can clear future CMS token caches without changing imports.
}

export async function buildContentRequest(
  restPath: string,
): Promise<ContentRequestContext> {
  if (!CMS_BASE_URL) {
    throw new Error("EXPO_PUBLIC_CONTENT_API is not set.");
  }

  const token = (await getCmsContentToken())?.trim() || ENV_CMS_CONTENT_TOKEN;

  if (!token) {
    throw new Error(
      "CMS content bearer token is missing. Provide a CMS token with aud=cms and scope=content:read.",
    );
  }

  const path = restPath.startsWith("/") ? restPath : `/${restPath}`;

  return {
    url: `${CMS_BASE_URL}${CONTENT_ROOT}${path}`,
    delivery: "token",
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
}
