import { GameSession } from "@/types/session.types";
import { sendSessions } from "../api/session.api";
import { getUnsyncedSessions, markSessionsAsSynced } from "../db/gameSession.service";
export const syncUp = async() => {
    const sessions=getUnsyncedSessions();
    if(!sessions.length) return;
    try{
    await sendSessions(sessions);
    const ids = sessions.map((s) => s.id);
    markSessionsAsSynced(ids);
    }catch(err){
        console.log("Sync up Failed",err)
    }
}