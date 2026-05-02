import { subscribeToNetwork, isOnline } from "@/utils/network";
import { syncUp } from "./syncUp.service";
import { syncDown } from "./syncDown.service";

let syncing = false;
let unsubscribe: (() => void) | null = null;


export const performSync = async () => {
  if (syncing) return; 

  syncing = true;

  try {
    const online = await isOnline();
    if (!online) return;

    console.log("Running sync...");

    await syncUp();
    await syncDown();

    console.log("Sync complete");

  } catch (err) {
    console.log(" Sync failed", err);
  } finally {
    syncing = false;
  }
};
export const startSyncListener = () => {
  if (unsubscribe) return; 

  unsubscribe = subscribeToNetwork((online) => {
    if (online) {
      console.log("Back online → syncing...");

      
      setTimeout(() => {
        performSync();
      }, 2000);
    }
  });
};
export const stopSyncListener = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};