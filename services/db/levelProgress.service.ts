import { db } from "@/database/db";

export const getCompletedLevelIds = (gameTypes: string[]): Set<string> => {
  if (!gameTypes.length) return new Set();

  const placeholders = gameTypes.map(() => "?").join(",");
  const rows = db.getAllSync(
    `
    SELECT DISTINCT content_id
    FROM game_sessions
    WHERE game_type IN (${placeholders})
      AND content_id IS NOT NULL
      AND TRIM(content_id) <> ''
    `,
    gameTypes,
  ) as { content_id: string }[];

  return new Set(rows.map((row) => String(row.content_id)));
};
