import NetInfo from "@react-native-community/netinfo";

export const subscribeToNetwork = (callback: (online: boolean) => void) => {
  return NetInfo.addEventListener((state) => {
    const online = !!(state.isConnected && state.isInternetReachable);
    callback(online);
  });
};
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !!(state.isConnected && state.isInternetReachable);
};