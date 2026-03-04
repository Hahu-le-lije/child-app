import {Stack,useRouter} from 'expo-router'
import { useEffect } from 'react'
import {useFonts} from 'expo-font'
import { useAuthStore } from '@/store/authStore'
import * as SplashScreen from 'expo-splash-screen';

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
   const [loaded]=useFonts({
  "Poppins-Regular":require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
  "Poppins-Medium":require("../assets/fonts/Poppins/Poppins-Medium.ttf"), 
  "Poppins-SemiBold":require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
  "Poppins-Bold":require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
  "Abyssinica_SIL":require("../assets/fonts/Abyssinica_SIL/AbyssinicaSIL-Regular.ttf")
})
useEffect(()=>{
  if(loaded) SplashScreen.hideAsync();
},[loaded])
if(!loaded){
  return null;
}
  if(loading) return null
 


  return <Stack screenOptions={{ headerShown: false }}/>

  
  
}

export default RootLayout