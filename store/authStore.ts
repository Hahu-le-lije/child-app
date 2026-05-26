import {
  AuthApiError,
  fetchChildMe,
  logoutChild,
  type AuthUser,
  type LoginResponse,
} from "@/services/api/auth.api";
import {
  clearAuth,
  getAccessToken,
  getUser,
  isTokenValid,
  saveAuthData,
  saveUser,
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
}

function isOnline(net: Awaited<ReturnType<typeof NetInfo.fetch>>): boolean {
  if (net.isConnected !== true) return false;
  if (net.isInternetReachable === false) return false;
  return true;
}

export const useAuthStore = create<AuthState>((set) => ({
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

      const net = await NetInfo.fetch();
      if (!isOnline(net)) return;

      if (!valid) {
        await clearAuth();
        set({ user: null });
        return;
      }

      try {
        const freshUser = await fetchChildMe(token);
        await saveUser(freshUser);
        set({ user: freshUser });
      } catch (e) {
        if (e instanceof AuthApiError && e.kind === "network") return;
        if (e instanceof AuthApiError && (e.status === 401 || e.status === 403)) {
          await clearAuth();
          set({ user: null });
        }
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
      data.user,
      data.expiresIn,
      data.cmsContentToken,
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
}));
