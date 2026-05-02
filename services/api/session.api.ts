import { GameSession } from "@/types/session.types";

const BASE_URL = "https://your-api.com"; 

export const sendSessions = async (sessions: GameSession[]) => {
  try {
    const res = await fetch(`${BASE_URL}/sessions/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessions }),
    });

    if (!res.ok) {
      throw new Error("Failed to send sessions");
    }

  } catch (err) {
    console.log("Sync up Failed", err);
    throw err;
  }
};

export const fetchSessions = async (since: string) => {
  const res = await fetch(`${BASE_URL}/sessions?since=${since}`);

  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }

  return res.json(); 
};