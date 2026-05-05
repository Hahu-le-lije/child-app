import { db } from "@/database/db";

export type SummaryStats = {
  totalSessions: number;
  avgScore: number;
  bestScore: number;
  totalMinutes: number;
  uniqueGames: number;
};

export type GameProgress = {
  gameType: string;
  sessionCount: number;
  avgScore: number;
  bestScore: number;
  totalTime: number;
  lastPlayed: string | null;
};

export type ProfileStats = {
  points: number;
  dayStreak: number;
  badges: number;
};

type SessionColumns = {
  hasTimeSpent: boolean;
  hasUpdatedAt: boolean;
};

function childScope(childId?: string | number | null) {
  const id = childId != null ? String(childId) : null;
  return {
    whereClause: id ? "WHERE child_id = ?" : "",
    params: id ? [id] : [],
  };
}

function calculateStreak(dateRows: Array<{ day: string }>): number {
  if (!dateRows.length) return 0;

  const uniqueDays = dateRows
    .map((row) => String(row.day))
    .filter(Boolean)
    .sort((a, b) => (a > b ? -1 : 1));

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);

    if (d.getTime() === cursor.getTime()) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d.getTime() === cursor.getTime() - 24 * 60 * 60 * 1000 && streak === 0) {
      // Start from yesterday if there is no session yet today.
      streak = 1;
      cursor = d;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d.getTime() < cursor.getTime()) {
      break;
    }
  }

  return streak;
}

function getSessionColumns(): SessionColumns {
  try {
    const rows = db.getAllSync(`PRAGMA table_info(game_sessions)`) as Array<{ name: string }>;
    const names = new Set(rows.map((r) => String(r.name)));
    return {
      hasTimeSpent: names.has("time_spent"),
      hasUpdatedAt: names.has("updated_at"),
    };
  } catch {
    return { hasTimeSpent: false, hasUpdatedAt: false };
  }
}

export function getProgressStats(childId?: string | number | null): {
  summary: SummaryStats;
  gameStats: GameProgress[];
} {
  const { whereClause, params } = childScope(childId);
  const columns = getSessionColumns();
  const timeExpr = columns.hasTimeSpent ? "time_spent" : "0";
  const updatedExpr = columns.hasUpdatedAt ? "updated_at" : "created_at";

  const totals = db.getFirstSync(
    `
      SELECT
        COUNT(*) as totalSessions,
        COALESCE(AVG(score), 0) as avgScore,
        COALESCE(MAX(score), 0) as bestScore,
        COALESCE(SUM(${timeExpr}), 0) as totalTime,
        COUNT(DISTINCT game_type) as uniqueGames
      FROM game_sessions
      ${whereClause}
    `,
    params
  ) as any;

  const grouped = db.getAllSync(
    `
      SELECT
        game_type as gameType,
        COUNT(*) as sessionCount,
        COALESCE(AVG(score), 0) as avgScore,
        COALESCE(MAX(score), 0) as bestScore,
        COALESCE(SUM(${timeExpr}), 0) as totalTime,
        MAX(${updatedExpr}) as lastPlayed
      FROM game_sessions
      ${whereClause}
      GROUP BY game_type
      ORDER BY sessionCount DESC
    `,
    params
  ) as any[];

  return {
    summary: {
      totalSessions: Number(totals?.totalSessions ?? 0),
      avgScore: Math.round(Number(totals?.avgScore ?? 0)),
      bestScore: Math.round(Number(totals?.bestScore ?? 0)),
      totalMinutes: Math.round(Number(totals?.totalTime ?? 0) / 60),
      uniqueGames: Number(totals?.uniqueGames ?? 0),
    },
    gameStats: grouped.map((row) => ({
      gameType: String(row.gameType ?? ""),
      sessionCount: Number(row.sessionCount ?? 0),
      avgScore: Math.round(Number(row.avgScore ?? 0)),
      bestScore: Math.round(Number(row.bestScore ?? 0)),
      totalTime: Number(row.totalTime ?? 0),
      lastPlayed: row.lastPlayed ? String(row.lastPlayed) : null,
    })),
  };
}

export function getProfileStats(childId?: string | number | null): ProfileStats {
  const { whereClause, params } = childScope(childId);
  const columns = getSessionColumns();
  const updatedExpr = columns.hasUpdatedAt ? "updated_at" : "created_at";

  const totals = db.getFirstSync(
    `
      SELECT
        COALESCE(SUM(score), 0) AS points,
        COALESCE(AVG(score), 0) AS avgScore,
        COUNT(DISTINCT game_type) AS uniqueGames,
        COUNT(*) AS totalSessions
      FROM game_sessions
      ${whereClause}
    `,
    params
  ) as any;

  const dayRows = db.getAllSync(
    `
      SELECT DISTINCT DATE(${updatedExpr}) AS day
      FROM game_sessions
      ${whereClause}
      ORDER BY day DESC
    `,
    params
  ) as any[];

  const points = Math.round(Number(totals?.points ?? 0));
  const avgScore = Math.round(Number(totals?.avgScore ?? 0));
  const uniqueGames = Number(totals?.uniqueGames ?? 0);
  const totalSessions = Number(totals?.totalSessions ?? 0);
  const dayStreak = calculateStreak(dayRows);

  const badges =
    (totalSessions >= 1 ? 1 : 0) +
    (totalSessions >= 10 ? 1 : 0) +
    (avgScore >= 70 ? 1 : 0) +
    (avgScore >= 90 ? 1 : 0) +
    (dayStreak >= 3 ? 1 : 0) +
    (dayStreak >= 7 ? 1 : 0) +
    (uniqueGames >= 3 ? 1 : 0) +
    (uniqueGames >= 6 ? 1 : 0);

  return { points, dayStreak, badges };
}
