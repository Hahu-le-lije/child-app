import { getApiBaseUrl } from "@/services/api/auth.api";
import { getAccessToken } from "@/services/db/authStorage";
import { GameSession } from "@/types/session.types";

const SESSION_PATH =
  process.env.EXPO_PUBLIC_SESSIONS_PATH?.trim() || "/sessions/batch";

export const sendSessions = async (sessions: GameSession[]) => {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }

  const token = await getAccessToken();
  const path = SESSION_PATH.startsWith("/") ? SESSION_PATH : `/${SESSION_PATH}`;

  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sessions }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send sessions (${res.status})`);
  }
};

export const fetchSessions = async (since: string) => {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }

  const token = await getAccessToken();
  const res = await fetch(
    `${base}/sessions?since=${encodeURIComponent(since)}`,
    {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch sessions (${res.status})`);
  }

  return res.json();
};
