import { sendSessions } from "../api/session.api";
import { getUnsyncedSessions, markSessionsAsSynced } from "../db/gameSession.service";
export const syncUp = async() => {
    const sessions=getUnsyncedSessions();
    if(!sessions.length) return;
    try{
    const ids = await sendSessions(sessions);
    markSessionsAsSynced(ids);
    }catch(err){
        console.log("Sync up Failed",err)
    }
}
