import {create} from "zustand"
import NetInfo from "@react-native-community/netinfo";
import { getAccessToken,getUser,isTokenValid,clearAuth,saveAuthData,getRefreshToken } from "@/services/authStorage";
import { refreshToken } from "@/services/authApi";

interface AuthState {
  user: any;
  loading: boolean;
  setUser: (user: any) => void;
  checkAuthOnStart: () => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore=create<AuthState>((set)=>({
    user:null,
    loading:true,
    setUser:(user)=>set({user}),
    checkAuthOnStart:async()=> {
        try{
            const token=await getAccessToken();
            const storedUser=await getUser();
            const valid=await isTokenValid();
         if(token && storedUser){
            set({user:storedUser})
            if(!valid){
                const net=await NetInfo.fetch();
                if(net.isConnected){
                    await useAuthStore.getState().refreshToken();
                }
            }
         }
        }catch(error){
            console.log("auth start error: ", error)
        }finally{
            set({loading:false})
        }
    },
    login: async (data) => {
        await saveAuthData(
            data.accessToken,
            data.refreshToken,
            data.child,
            data.expiresIn
        );
        set({user:data.child})
    },
    logout: async () => {
        await clearAuth();
        set({user:null})
    },
    refreshToken: async () => {
        try{
            const refreshTokenValue=await getRefreshToken()
            if(!refreshTokenValue) return;
            
            const data=await refreshToken(refreshTokenValue);
            await saveAuthData(
                data.accessToken,
                data.refreshToken,
                data.child,
                data.expiresIn
            );
            set({user:data.child})
        }
        catch{
            await clearAuth();
            set({user:null})
        }
    },
}))