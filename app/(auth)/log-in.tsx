import { View, Text ,StyleSheet, Alert} from 'react-native'
import React from 'react'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import SafeAreaComponent from '@/components/SafeAreaComponent'
import { useAuthStore } from '@/store/authStore'
import { loginChild } from '@/services/authApi'

const Login = () => {
  const {login}=useAuthStore();
  const [username,setUsername]=React.useState('');
  const [password,setPassword]=React.useState('');
    const handleLogin=async()=>{
        try{
          const data=await loginChild(username,password);
          await login(data);
        }catch(error:any){
          Alert.alert("Error",error.message);
        }
    }
  return (
    <SafeAreaComponent style={styles.container}>
      <View>
      
        <InputField
        label={'User Name'}
        placeholder='Enter child UserName'
        autoCapitalize='none'
        value={username}
        onChangeText={setUsername}
        />
        <InputField 
        label={'Password'}
        placeholder={'Enter the password'}
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        />
        <CustomButton
        title={'Log In'}
        onPress={handleLogin}
        />
      </View>
      
    </SafeAreaComponent>
  )
}

export default Login
const styles=StyleSheet.create({
    container:{
        display:"flex",
        flexDirection:"column",
        padding:5
    },
    header:{

    }
})