import { jwtDecode } from "jwt-decode";

export type AuthUser = {
  id: string;
  parent_id?: string;
  first_name?: string;
  last_name?: string | null;
  username: string;
  avatar?: string | null;
  subscription_id?: string | null;
  age?: number | null;
  birthdate?: string | null;
  skill_level?: string | null;
  status?: string;
  last_login_at?: string | null;
  credentials_rotated_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
};

type JwtDebugClaims = {
  aud?: string | string[];
  scope?: string | string[];
  role?: string;
  sub?: string;
  exp?: number;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly kind: "network" | "auth" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

const PATH_CHILD_LOGIN = "api/children/login";
const PATH_CHILD_LOGOUT = "api/children/logout";
const PATH_CHILD_ME = "api/children/me";

export function getApiBaseUrl(): string | undefined {
  const raw = process.env.EXPO_PUBLIC_API_CHILD?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new AuthApiError("EXPO_PUBLIC_API_URL is not set", undefined, "unknown");
  }
  return `${base}/${path.replace(/^\/+/, "")}`;
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
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
  const id = pickString(o, "id", "_id", "userId", "child_id", "sub");
  const username = pickString(o, "username", "name", "email");
  if (!id || !username) return undefined;
  return { ...o, id, username } as AuthUser;
}

function maskToken(token: string | undefined): string | null {
  if (!token) return null;
  if (token.length <= 16) return `${token.slice(0, 4)}...`;
  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

function decodeClaims(token: string | undefined): JwtDebugClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<JwtDebugClaims>(token);
  } catch {
    return null;
  }
}

function debugLoginTokens(data: LoginResponse): void {
  if (!__DEV__) return;

  const childClaims = decodeClaims(data.accessToken);

  console.log("Login tokens:", {
    child_token: maskToken(data.accessToken),
    child_claims: childClaims
      ? {
          aud: childClaims.aud,
          role: childClaims.role,
          sub: childClaims.sub,
          exp: childClaims.exp,
        }
      : null,
  });
}

export function normalizeLoginPayload(data: Record<string, unknown>): LoginResponse {
  const accessToken = pickString(data, "accessToken", "access_token", "token");
  if (!accessToken) {
    throw new AuthApiError("Invalid login response: missing access token", undefined, "unknown");
  }

  let expiresIn = pickNumber(data, "expiresIn", "expires_in", "expires");
  if (expiresIn == null || expiresIn <= 0) expiresIn = 7200;

  const user =
    normalizeUser(data.child) ??
    normalizeUser(data.user) ??
    normalizeUser(data.profile) ??
    normalizeUser(data.data);

  if (!user) {
    throw new AuthApiError("Invalid login response: missing child", undefined, "unknown");
  }

  const login = {
    accessToken,
    expiresIn,
    user,
  };

  debugLoginTokens(login);

  return login;
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



export async function loginChild(username: string, password: string): Promise<LoginResponse> {

  let res: Response;
  try {
    res = await fetch(apiUrl(PATH_CHILD_LOGIN), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
  } catch {
    throw new AuthApiError("Network error - check connection", undefined, "network");
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

  try {
    const res = await fetch(apiUrl(PATH_CHILD_LOGOUT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok && (res.status === 401 || res.status === 403)) return;
    if (!res.ok) {
      const raw = await readJson(res);
      const flat = flattenEnvelope(raw);
      const msg =
        pickString(flat, "message", "error", "detail") ?? `Logout failed (${res.status})`;
      throw new AuthApiError(msg, res.status, authErrorStatus(res));
    }
  } catch (e) {
    if (e instanceof AuthApiError) throw e;
    throw new AuthApiError("Network error - check connection", undefined, "network");
  }
}

async function childAuthorizedJson(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${accessToken.trim()}`);

  let res: Response;
  try {
    res = await fetch(apiUrl(path), { ...init, headers });
  } catch {
    throw new AuthApiError("Network error - check connection", undefined, "network");
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

export async function fetchChildMe(accessToken: string): Promise<AuthUser> {
  const flat = await childAuthorizedJson(PATH_CHILD_ME, accessToken, { method: "GET" });
  const user =
    normalizeUser(flat) ??
    normalizeUser(flat.child) ??
    normalizeUser(flat.user) ??
    normalizeUser(flat.profile) ??
    normalizeUser(flat.data);

  if (!user) {
    throw new AuthApiError("Invalid /api/children/me response: missing child", undefined, "unknown");
  }
  return user;
}
