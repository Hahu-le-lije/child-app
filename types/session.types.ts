export type GameSession = {
  id: string;
  child_id: string;
  game_type: string;
  content_id: string;
  score: number;
  time_spent: number;
  metrics: any;
  synced: number;
  created_at: string;
  updated_at: string;
};