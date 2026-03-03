import { View, Text ,StyleSheet} from 'react-native'
import React from 'react'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'

const Login = () => {
  return (
    <View style={styles.container}>
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
        />
      </View>
      
    </View>
  )
}

export default Login
const styles=StyleSheet.create({
    container:{
        backgroundColor:"rgb(7, 8, 37)",
        height:"100%",
        width:"100%",
        display:"flex",
        flexDirection:"column",
        padding:5
    },
    header:{

    }
})