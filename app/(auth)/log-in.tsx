import { View, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React from 'react';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import { useAuthStore } from '@/store/authStore';
import { loginChild } from '@/services/authApi';
import { images } from '@/const';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const Login = () => {
  const { login } = useAuthStore();
  const [username, setUsername] = React.useState('izzat');
  const [password, setPassword] = React.useState('123');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const data = await loginChild(username, password);
      await login(data);
      router.replace('/(root)/(tabs)/home');
    } catch (error: any) {
      // Use a friendlier error title
      Alert.alert('Oops!', 'Check your name or secret code again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#2D2D44', '#1F1F39']} style={styles.container}>
      <SafeAreaComponent style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.imageWrapper}>
                <Image source={images.Logo} style={styles.image} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Secret Entry 🚀</Text>
              <Text style={styles.subtitle}>Tell us your name and secret code!</Text>
            </View>

            <View style={styles.formCard}>
              <InputField
                label="Your Name"
                placeholder="Type your name here..."
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
    
                containerStyle={styles.inputContainer}
              />

              <InputField
                label="Secret Code"
                placeholder="Enter code..."
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                containerStyle={styles.inputContainer}
              />

              <CustomButton
                title={loading ? "Opening Door..." : "LET'S PLAY! ✨"}
                onPress={handleLogin}
                containerStyle={styles.button}
                textStyle={styles.buttonText}
                disabled={loading}
                IconLeft={null}
                IconRight={null}
                style={{}}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaComponent>
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  image: {
    height: 140,
    width: 140,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold', 
  },
  subtitle: {
    fontSize: 16,
    color: '#BABBC9',
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#2F2F42',
    padding: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#3D5CFF',
   
    borderBottomWidth: 5,
    borderBottomColor: '#263FCF',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});