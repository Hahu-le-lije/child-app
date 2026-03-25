import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import { useRouter } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { images } from '@/const';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Welcome = () => {
  const router = useRouter();

  return (
   
    <LinearGradient colors={['#4E4E70', '#2D2D44']} style={styles.container}>
      <SafeAreaComponent style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        
        <View style={styles.content}>
      
          <View style={styles.logoWrapper}>
            <Image source={images.Logo} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>
            Hi there! 👋
          </Text>

          <Text style={styles.subtitle}>
            Ready to play and learn? {'\n'}Let's jump in! 🚀
          </Text>
        </View>

        <View style={styles.buttons}>
          <CustomButton
            title="START PLAYING! ✨" 
            onPress={() => router.replace('/(auth)/log-in')}
        
            containerStyle={styles.primaryButton}
            textStyle={styles.buttonText}
            IconLeft={null}
            style={{}}
            IconRight={null}
          />
        </View>

      </SafeAreaComponent>
    </LinearGradient>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoWrapper: {
  
    shadowColor: "#3D5CFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Poppins-Bold",
  },
  subtitle: {
    fontSize: 18, // Bigger for kids
    color: "#BABBC9",
    textAlign: "center",
    lineHeight: 26,
    fontFamily: "Poppins-Medium",
  },
  buttons: {
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  primaryButton: {
    backgroundColor: '#3D5CFF',
    height: 70, // Chunky button
    borderRadius: 35, // Fully rounded
    borderBottomWidth: 6, // "3D" Game look
    borderBottomColor: '#0286FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    color: 'white',
    fontFamily: "Poppins-Bold",
    letterSpacing: 1,
  }
});