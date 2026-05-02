import { db } from "@/database/db";
import { getMeta, setMeta } from "../db/gameSession.service";
import { GameSession } from "@/types/session.types";
import { fetchSessions } from "../api/session.api";

export const syncDown = async () => {
  const lastSync = getMeta("last_sync") || "1970-01-01T00:00:00Z";

  try {
    const sessions: GameSession[] = await fetchSessions(lastSync);

    sessions.forEach((s) => {
      db.runSync(
        `
        INSERT OR REPLACE INTO game_sessions(
          id, child_id, game_type, content_id,
          score, time_spent, metrics,
          synced, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          s.id,
          s.child_id,
          s.game_type,
          s.content_id,
          s.score,
          s.time_spent,
          JSON.stringify(s.metrics),
          1, 
          s.created_at,
          s.updated_at,
        ]
      );
    });

    setMeta("last_sync", new Date().toISOString());

  } catch (err) {
    console.log("Sync down Failed", err);
  }
};