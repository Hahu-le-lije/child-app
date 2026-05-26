import {db} from "@/database/db";
import { GameSession } from "@/types/session.types";

const stringifyJson = (value: unknown): string | null => {
  if (value == null) return null;
  return typeof value === "string" ? value : JSON.stringify(value);
};

const extractSkillBreakdown = (session: GameSession) => {
  if (session.skill_breakdown != null) return session.skill_breakdown;
  if (typeof session.metrics === "string") return null;
  return session.metrics?.skill_breakdown ?? session.metrics?.skills ?? null;
};

const mapSessionRow = (row: any): GameSession => ({
  id: String(row.event_id ?? row.id ?? ""),
  child_id: String(row.child_id ?? ""),
  game_type: String(row.game_type ?? ""),
  content_id: String(row.content_id ?? ""),
  score: Number(row.score ?? 0),
  time_spent: Number(row.time_spent ?? 0),
  metrics: String(row.metrics ?? "{}"),
  skill_breakdown: row.skill_breakdown == null ? null : String(row.skill_breakdown),
  synced: Number(row.synced ?? 0),
  created_at: String(row.event_created_at ?? row.created_at ?? ""),
  updated_at: String(row.last_updated ?? row.updated_at ?? ""),
});

export const upsertGameSession=(gameSession:GameSession)=>{
    const now = new Date().toISOString();
    const createdAt = gameSession.created_at || now;
    const updatedAt = gameSession.updated_at || now;
    const skillBreakdown = extractSkillBreakdown(gameSession);

    db.runSync(`
        INSERT INTO game_sessions (
        event_id,child_id,game_type,content_id,score,
        time_spent,metrics,skill_breakdown,synced,event_created_at,last_updated
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(event_id) DO UPDATE SET
        score=excluded.score,
        time_spent=excluded.time_spent,
        metrics=excluded.metrics,
        skill_breakdown=excluded.skill_breakdown,
        last_updated=excluded.last_updated,
        synced=0
    `,[
        gameSession.id,
        gameSession.child_id,
        gameSession.game_type,
        gameSession.content_id,
        gameSession.score,
        gameSession.time_spent,
        stringifyJson(gameSession.metrics) ?? "{}",
        stringifyJson(skillBreakdown),
        0,
        createdAt,
        updatedAt,
    ])
}
export const getUnsyncedSessions = (): GameSession[] => {
  const rows = db.getAllSync(`
    SELECT * FROM game_sessions
    WHERE synced = 0
    ORDER BY datetime(COALESCE(last_updated, event_created_at)) ASC
  `) as any[];
  return rows.map(mapSessionRow);
};
export const markSessionsAsSynced = (ids: string[]) => {
  if (!ids.length) return;
  const placeholders = ids.map(() => "?").join(",");
  db.runSync(
    `UPDATE game_sessions SET synced = 1 WHERE event_id IN (${placeholders})`,
    ids
  );
};
export const setMeta=(key:string,value:string)=>{
    db.runSync(`
        INSERT INTO sync_meta(key,value)
        VALUES(?,?)
        ON CONFLICT(key) DO UPDATE SET
        value=excluded.value
    `,[key,value]);
}
export const getMeta = (key: string)=>{
  const res = db.getFirstSync(
    `SELECT value FROM sync_meta WHERE key = ?`,
    [key]
  ) as { value: string } | null;
  return res?.value ?? null;
};
