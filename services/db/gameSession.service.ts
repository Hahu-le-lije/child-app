import {db} from "@/database/db";
import { GameSession } from "@/types/session.types";
export const upsertGameSession=(gameSession:GameSession)=>{
    db.runSync(`
        INSERT INTO game_sessions (
        id,child_id,game_type,content_id,score,
        time_spent,metrics,synced,created_at,updated_at
        )
        VALUES(?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET
        score=excluded.score,
        time_spent=excluded.time_spent,
        metrics=excluded.metrics,
        updated_at=excluded.updated_at
        synced=0
    `,[
        gameSession.id,
        gameSession.child_id,
        gameSession.game_type,
        gameSession.content_id,
        gameSession.score,
        gameSession.time_spent,
        JSON.stringify(gameSession.metrics),
        0,
        gameSession.created_at,
        gameSession.updated_at,
    ])
}
export const getUnsyncedSessions = () => {
  return db.getAllSync(`
    SELECT * FROM game_sessions
    WHERE synced = 0
  `);
};
export const markSessionsAsSynced = (ids: string[]) => {
  const placeholders = ids.map(() => "?").join(",");
  db.runSync(
    `UPDATE game_sessions SET synced = 1 WHERE id IN (${placeholders})`,
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
  );
  return res?.value || null;
};
