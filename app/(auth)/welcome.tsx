import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import { useRouter } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { images } from '@/const';

const Welcome = () => {
  const router = useRouter();

  return (
    <SafeAreaComponent style={styles.container}>
      <View style={styles.content}>
        <Image source={images.Logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>
          Hi there 👋
        </Text>

        <Text style={styles.subtitle}>
          Welcome! Let us start exploring learning and fun together.
        </Text>
      </View>

      <View style={styles.buttons}>
        <CustomButton
          title="Get Started"
          onPress={() => router.replace('/(auth)/log-in')}
          containerStyle={styles.primaryButton}
        />

      
      </View>
    </SafeAreaComponent>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2D2D44",
    height: "100%",
    width: "100%",
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Poppins-Bold",
  },
  subtitle: {
    fontSize: 15,
    color: "#CFCFE3",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Poppins-Regular",

  },
  buttons: {
    width: "80%",
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  primaryButton: {
    
    fontFamily: "Poppins-Bold",
  
  },

});