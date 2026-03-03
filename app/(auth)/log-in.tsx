import { View, Text ,StyleSheet} from 'react-native'
import React from 'react'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import SafeAreaComponent from '@/components/SafeAreaComponent'

const Login = () => {
    const handleLogin=async()=>{
        
    }
  return (
    <SafeAreaComponent style={styles.container}>
      <View>
        <InputField
        label={'User Name'}
        placeholder='Enter child UserName'
        autoCapitalize='none'
        />
        <InputField 
        label={'Password'}
        placeholder={'Enter the password'}
        secureTextEntry={true}
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