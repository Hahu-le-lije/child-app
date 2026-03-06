import { Platform } from "react-native";
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

    await setItem(TOKEN_KEY, accessToken);
    await setItem(REFRESH_KEY, refreshToken);
    await setItem(USER_KEY, JSON.stringify(user));
    await setItem(EXPIRY_KEY, expiryTime.toString());

  } catch (error) {
    console.error("error in saving auth data:", error);
  }
};
export const getAccessToken = async () :Promise<string | null>=> {
    try{
  return await getItem(TOKEN_KEY);
}catch{
    return null
}
};

export const getRefreshToken = async (): Promise<string | null> => {
    try{
  return await getItem(REFRESH_KEY);
}catch{
    return null
}
};

export const getUser = async (): Promise<any|null> => {
    try{
  const user = await getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}catch{
    return null
}
};
export const isTokenValid = async (): Promise<boolean> => {
  try {
    const expiry = await getItem(EXPIRY_KEY);
    if (!expiry) return false;

    return Date.now() < parseInt(expiry);
  } catch {
    return false;
  }
};
export const clearAuth = async () => {
  try {
    await deleteItem(TOKEN_KEY);
    await deleteItem(REFRESH_KEY);
    await deleteItem(USER_KEY);
    await deleteItem(EXPIRY_KEY);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    try {
      globalThis?.localStorage?.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis?.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    try {
      globalThis?.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}