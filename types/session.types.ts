export type GameSession = {
  id: string;
  child_id: string;
  game_type: string;
  content_id: string;
  score: number;
  time_spent: number;
  metrics: any;
  skill_breakdown?: string | Record<string, number> | null;
  synced: number;
  created_at: string;
  updated_at: string;
};
