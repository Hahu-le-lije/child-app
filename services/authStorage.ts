import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "child_access_token";
const REFRESH_KEY = "child_refresh_token";
const USER_KEY = "child_profile";
const EXPIRY_KEY = "child_token_expiry";

export const saveAuthData = async (
  accessToken: string,
  refreshToken: string,
  user: any,
  expiresIn: number
) => {
  try {
    const expiryTime = Date.now() + expiresIn * 1000;

    await SecureStore.setItemAsync("child_access_token", accessToken);
    await SecureStore.setItemAsync("child_refresh_token", refreshToken);
    await SecureStore.setItemAsync("child_profile", JSON.stringify(user));
    await SecureStore.setItemAsync("child_token_expiry", expiryTime.toString());

  } catch (error) {
    console.error("error in saving auth data:", error);
  }
};
export const getAccessToken = async () :Promise<string | null>=> {
    try{
  return await SecureStore.getItemAsync(TOKEN_KEY);
}catch{
    return null
}
};

export const getRefreshToken = async (): Promise<string | null> => {
    try{
  return await SecureStore.getItemAsync(REFRESH_KEY);
}catch{
    return null
}
};

export const getUser = async (): Promise<any|null> => {
    try{
  const user = await SecureStore.getItemAsync(USER_KEY);
  return user ? JSON.parse(user) : null;
}catch{
    return null
}
};
export const isTokenValid = async (): Promise<boolean> => {
  try {
    const expiry = await SecureStore.getItemAsync(EXPIRY_KEY);
    if (!expiry) return false;

    return Date.now() < parseInt(expiry);
  } catch {
    return false;
  }
};
export const clearAuth = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(EXPIRY_KEY);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};