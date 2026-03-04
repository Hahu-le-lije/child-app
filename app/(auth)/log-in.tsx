import { View, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import { useAuthStore } from '@/store/authStore';
import { loginChild } from '@/services/authApi';
import { images } from '@/const';
import { useRouter } from 'expo-router';

const Login = () => {
  const { login } = useAuthStore();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const data = await loginChild(username, password);
      await login(data);

      
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaComponent style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <View style={styles.content}>
          <Image source={images.Logo} style={styles.image} resizeMode="contain" />

          <Text style={styles.title}>Child Login</Text>
          <Text style={styles.subtitle}>Enter credentials to continue</Text>

          <InputField
            label="User Name"
            placeholder="Enter child username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <CustomButton
            title="Log In"
            onPress={handleLogin}
            containerStyle={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaComponent>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D2D44',
  },
  keyboard: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    height: 180,
    width: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#CFCFE3',
    marginBottom: 20,
  },
  button: {
    marginTop: 15,
    width: '100%',
  },
});