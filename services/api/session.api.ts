import { getAccessToken } from "@/services/db/authStorage";
import { GameSession } from "@/types/session.types";

const SESSION_PATH =
  process.env.EXPO_PUBLIC_SESSIONS_PATH?.trim() || "/api/sessions";

const parseJson = <T>(value: unknown, fallback: T): T => {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const pickMetricNumber = (metrics: any, ...keys: string[]) => {
  for (const key of keys) {
    const value = metrics?.[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
};

const toLearningSessionPayload = (session: GameSession) => {
  const metrics = parseJson<Record<string, unknown>>(session.metrics, {});
  const skillBreakdown = parseJson<Record<string, unknown> | null>(
    session.skill_breakdown,
    null
  ) ?? metrics.skill_breakdown ?? metrics.skills ?? {};

  return {
    id: session.id,
    childId: session.child_id,
    gameType: session.game_type,
    contentId: session.content_id,
    score: Number(session.score ?? 0),
    timeSpent: Number(session.time_spent ?? 0),
    metrics,
    totalQuestions: pickMetricNumber(metrics, "totalQuestions", "total_questions"),
    correctAnswers: pickMetricNumber(metrics, "correctAnswers", "correct_answers"),
    skillBreakdown,
    createdAt: session.created_at,
    lastUpdated: session.updated_at,
  };
};

export const sendSessions = async (sessions: GameSession[]): Promise<string[]> => {
  const base = process.env.EXPO_PUBLIC_SYNC_API;
  if (!base) {
    throw new Error("EXPO_PUBLIC_SYNC_API is not set");
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
    body: JSON.stringify({ sessions: sessions.map(toLearningSessionPayload) }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to send sessions (${res.status})${text ? `: ${text}` : ""}`);
  }

  const body = await res.json().catch(() => null);
  if (body && Array.isArray(body.event_ids)) {
    return body.event_ids.map(String);
  }

  return sessions.map((session) => session.id);
};
