import {Stack,useRouter} from 'expo-router'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

const RootLayout = () => {
  const {user,loading,checkAuthOnStart}=useAuthStore();
  const router=useRouter();
  useEffect(()=>{
    checkAuthOnStart();
  },[])
  useEffect(()=>{
    if(!loading){
      if(user){
        router.replace("/(root)/(tabs)/home");
      }else{
        router.replace('/(auth)/welcome')
      }
    }
  },[user,loading])
  if(loading) return null
  return <Stack screenOptions={{ headerShown: false }}/>

  
  
}

export default RootLayout