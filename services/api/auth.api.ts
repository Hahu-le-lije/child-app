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


export type ChildProfile = Record<string, unknown>;

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

const PATH_CHILD_LOGIN = "/children/login";
const PATH_CHILD_LOGOUT = "/children/logout";
const PATH_CHILD_ME = "/children/me";
const PATH_CHILD_PROFILE = "/child/profile";

function refreshPath(): string {
  return process.env.EXPO_PUBLIC_AUTH_REFRESH_PATH?.trim() || "/auth/refresh";
}

export function getApiBaseUrl(): string | undefined {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
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

function flattenEnvelope(body: Record<string, unknown>): Record<string, unknown> {
  const inner = body.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return { ...body, ...(inner as Record<string, unknown>) };
  }
  return body;
}

function authErrorStatus(res: Response): "auth" | "unknown" {
  return res.status === 401 || res.status === 403 ? "auth" : "unknown";
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
  const base = getApiBaseUrl();
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
    res = await fetch(`${base}${PATH_CHILD_LOGIN}`, {
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
    throw new AuthApiError(msg, res.status, authErrorStatus(res));
  }

  return normalizeLoginPayload(flattenEnvelope(raw));
}


export async function logoutChild(accessToken: string | null | undefined): Promise<void> {
  const token = accessToken?.trim();
  if (!token) return;

  const base = getApiBaseUrl();
  if (!base) {
    if (__DEV__) return;
    throw new AuthApiError("EXPO_PUBLIC_API_URL is not set", undefined, "unknown");
  }

  try {
    const res = await fetch(`${base}${PATH_CHILD_LOGOUT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok && (res.status === 401 || res.status === 403)) {
      return;
    }
    if (!res.ok) {
      const raw = await readJson(res);
      const flat = flattenEnvelope(raw);
      const msg =
        pickString(flat, "message", "error", "detail") ?? `Logout failed (${res.status})`;
      throw new AuthApiError(msg, res.status, authErrorStatus(res));
    }
  } catch (e) {
    if (e instanceof AuthApiError) throw e;
    throw new AuthApiError("Network error — check connection", undefined, "network");
  }
}

export async function refreshSessionToken(refreshTokenValue: string): Promise<RefreshResponse> {
  const base = getApiBaseUrl();
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
    throw new AuthApiError(msg, res.status, authErrorStatus(res));
  }

  return normalizeRefreshPayload(flattenEnvelope(raw));
}

async function childAuthorizedJson(
  path: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<Record<string, unknown>> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new AuthApiError("EXPO_PUBLIC_API_URL is not set", undefined, "unknown");
  }

  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${accessToken.trim()}`);

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...init, headers });
  } catch {
    throw new AuthApiError("Network error — check connection", undefined, "network");
  }

  const raw = await readJson(res);
  if (!res.ok) {
    const flat = flattenEnvelope(raw);
    const msg =
      pickString(flat, "message", "error", "detail") ?? `Request failed (${res.status})`;
    throw new AuthApiError(msg, res.status, authErrorStatus(res));
  }
  return flattenEnvelope(raw);
}

function profileFromPayload(flat: Record<string, unknown>): ChildProfile {
  const inner = flat.profile ?? flat.child ?? flat.user;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as ChildProfile;
  }
  return flat as ChildProfile;
}

/**
 * GET `/children/me` — current child summary (`auth:child`).
 */
export async function fetchChildMe(accessToken: string): Promise<AuthUser> {
  const flat = await childAuthorizedJson(PATH_CHILD_ME, accessToken, { method: "GET" });
  const user =
    normalizeUser(flat) ??
    normalizeUser(flat.user) ??
    normalizeUser(flat.child) ??
    normalizeUser(flat.profile) ??
    normalizeUser(flat.data);
  if (!user) {
    throw new AuthApiError("Invalid /children/me response: missing user", undefined, "unknown");
  }
  return user;
}

/**
 * GET `/child/profile` — full own profile (`auth:child`).
 */
export async function fetchChildProfile(accessToken: string): Promise<ChildProfile> {
  const flat = await childAuthorizedJson(PATH_CHILD_PROFILE, accessToken, { method: "GET" });
  return profileFromPayload(flat);
}

/**
 * PATCH `/child/profile` — partial update (`auth:child`).
 */
export async function patchChildProfile(
  accessToken: string,
  patch: Record<string, unknown>
): Promise<ChildProfile> {
  const flat = await childAuthorizedJson(PATH_CHILD_PROFILE, accessToken, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return profileFromPayload(flat);
}
