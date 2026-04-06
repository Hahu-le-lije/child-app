/**
 * Child auth API. Set EXPO_PUBLIC_API_URL in .env (e.g. https://api.example.com).
 * Optional: EXPO_PUBLIC_AUTH_LOGIN_PATH (default /auth/login), EXPO_PUBLIC_AUTH_REFRESH_PATH (default /auth/refresh).
 * If EXPO_PUBLIC_API_URL is unset, a small dev mock is used (__DEV__ only).
 */

export type AuthUser = {
  id: string;
  username: string;
  avatar?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type RefreshResponse = {
  accessToken: string;
  
  refreshToken?: string;
  expiresIn: number;
  user?: AuthUser;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly kind: "network" | "auth" | "unknown" = "unknown"
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

function getApiBase(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
  return raw.replace(/\/+$/, "");
}

function loginPath(): string {
  return process.env.EXPO_PUBLIC_AUTH_LOGIN_PATH?.trim() || "/auth/login";
}

function refreshPath(): string {
  return process.env.EXPO_PUBLIC_AUTH_REFRESH_PATH?.trim() || "/auth/refresh";
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function normalizeUser(raw: unknown): AuthUser | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const id = pickString(o, "id", "_id", "userId");
  const username = pickString(o, "username", "name", "email");
  if (!id || !username) return undefined;
  return { ...o, id, username } as AuthUser;
}

export function normalizeLoginPayload(data: Record<string, unknown>): LoginResponse {
  const accessToken = pickString(data, "accessToken", "access_token", "token");
  const refreshToken = pickString(data, "refreshToken", "refresh_token");
  if (!accessToken || !refreshToken) {
    throw new AuthApiError("Invalid login response: missing tokens", undefined, "unknown");
  }
  let expiresIn = pickNumber(data, "expiresIn", "expires_in", "expires");
  if (expiresIn == null || expiresIn <= 0) expiresIn = 3600;
  const user =
    normalizeUser(data.user) ??
    normalizeUser(data.profile) ??
    normalizeUser(data.child) ??
    normalizeUser(data.data);
  if (!user) {
    throw new AuthApiError("Invalid login response: missing user", undefined, "unknown");
  }
  return { accessToken, refreshToken, expiresIn, user };
}

export function normalizeRefreshPayload(data: Record<string, unknown>): RefreshResponse {
  const accessToken = pickString(data, "accessToken", "access_token", "token");
  const newRefresh = pickString(data, "refreshToken", "refresh_token");
  if (!accessToken) {
    throw new AuthApiError("Invalid refresh response: missing access token", undefined, "unknown");
  }
  let expiresIn = pickNumber(data, "expiresIn", "expires_in", "expires");
  if (expiresIn == null || expiresIn <= 0) expiresIn = 3600;
  const user =
    normalizeUser(data.user) ?? normalizeUser(data.profile) ?? normalizeUser(data.child);
  return {
    accessToken,
    ...(newRefresh ? { refreshToken: newRefresh } : {}),
    expiresIn,
    user,
  };
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Merge common `{ data: { ...tokens } }` envelopes into the root object. */
function flattenEnvelope(body: Record<string, unknown>): Record<string, unknown> {
  const inner = body.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return { ...body, ...(inner as Record<string, unknown>) };
  }
  return body;
}

async function devMockLogin(username: string, password: string): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 400));
  if (username.trim() === "izzat" && password === "123") {
    return {
      accessToken: "dev_access_token",
      refreshToken: "dev_refresh_token",
      expiresIn: 3600,
      user: { id: "1", username: "izzat", role: "child" },
    };
  }
  throw new AuthApiError("Invalid username or password", 401, "auth");
}

async function devMockRefresh(token: string): Promise<RefreshResponse> {
  await new Promise((r) => setTimeout(r, 300));
  if (token === "dev_refresh_token") {
    return {
      accessToken: "dev_access_token_refreshed",
      refreshToken: "dev_refresh_token",
      expiresIn: 3600,
    };
  }
  throw new AuthApiError("Failed to refresh token", 401, "auth");
}

export async function loginChild(username: string, password: string): Promise<LoginResponse> {
  const base = getApiBase();
  if (!base) {
    if (__DEV__) return devMockLogin(username, password);
    throw new AuthApiError(
      "Set EXPO_PUBLIC_API_URL in your environment (e.g. .env)",
      undefined,
      "unknown"
    );
  }

  let res: Response;
  try {
    res = await fetch(`${base}${loginPath()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
  } catch {
    throw new AuthApiError("Network error — check connection", undefined, "network");
  }

  const raw = await readJson(res);
  if (!res.ok) {
    const flat = flattenEnvelope(raw);
    const msg =
      pickString(flat, "message", "error", "detail") ?? `Login failed (${res.status})`;
    throw new AuthApiError(msg, res.status, res.status === 401 ? "auth" : "unknown");
  }

  return normalizeLoginPayload(flattenEnvelope(raw));
}


export async function refreshSessionToken(refreshTokenValue: string): Promise<RefreshResponse> {
  const base = getApiBase();
  if (!base) {
    if (__DEV__) return devMockRefresh(refreshTokenValue);
    throw new AuthApiError("EXPO_PUBLIC_API_URL is not set", undefined, "unknown");
  }

  let res: Response;
  try {
    res = await fetch(`${base}${refreshPath()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        refreshToken: refreshTokenValue,
        refresh_token: refreshTokenValue,
      }),
    });
  } catch {
    throw new AuthApiError("Network error — check connection", undefined, "network");
  }

  const raw = await readJson(res);
  if (!res.ok) {
    const flat = flattenEnvelope(raw);
    const msg =
      pickString(flat, "message", "error", "detail") ?? `Refresh failed (${res.status})`;
    throw new AuthApiError(msg, res.status, res.status === 401 ? "auth" : "unknown");
  }

  return normalizeRefreshPayload(flattenEnvelope(raw));
}
