import {
  AuthApiError,
  logoutChild,
  refreshSessionToken,
  type AuthUser,
  type LoginResponse,
} from "@/services/api/auth.api";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getUser,
  isTokenValid,
  saveAuthData,
} from "@/services/db/authStorage";
import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;

  setUser: (user: AuthUser | null) => void;
  checkAuthOnStart: () => Promise<void>;
  login: (data: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

function isOnline(net: Awaited<ReturnType<typeof NetInfo.fetch>>): boolean {
  if (net.isConnected !== true) return false;
  if (net.isInternetReachable === false) return false;
  return true;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  checkAuthOnStart: async () => {
    try {
      const token = await getAccessToken();
      const storedUser = await getUser();
      const valid = await isTokenValid();

      if (!token || !storedUser) {
        if (storedUser && !token) {
          await clearAuth();
          set({ user: null });
        }
        return;
      }

      set({ user: storedUser });

      if (valid) return;

      const net = await NetInfo.fetch();
      if (isOnline(net)) {
        await get().refreshToken();
      }
    } catch (error) {
      console.log("auth start error: ", error);
    } finally {
      set({ loading: false });
    }
  },

  login: async (data: LoginResponse) => {
    await saveAuthData(
      data.accessToken,
      data.refreshToken,
      data.user,
      data.expiresIn,
    );
    set({ user: data.user });
  },

  logout: async () => {
    const token = await getAccessToken();
    try {
      await logoutChild(token);
    } catch {
      /* still clear locally; expired tokens often 401 anyway */
    }
    await clearAuth();
    set({ user: null });
  },

  refreshToken: async () => {
    const refreshTokenValue = await getRefreshToken();
    if (!refreshTokenValue) return;

    const storedUser = await getUser();
    try {
      const data = await refreshSessionToken(refreshTokenValue);
      const nextRefresh = data.refreshToken?.trim()
        ? data.refreshToken
        : refreshTokenValue;
      const nextUser = data.user ?? storedUser;
      if (!nextUser) {
        await clearAuth();
        set({ user: null });
        return;
      }
      await saveAuthData(
        data.accessToken,
        nextRefresh,
        nextUser,
        data.expiresIn,
      );
      set({ user: nextUser });
    } catch (e) {
      if (e instanceof AuthApiError) {
        if (e.kind === "network") {
          return;
        }
        if (e.status === 401 || e.status === 403 || e.kind === "auth") {
          await clearAuth();
          set({ user: null });
          return;
        }
        return;
      }
      await clearAuth();
      set({ user: null });
    }
  },
}));
