import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import SafeAreaComponent from '@/components/SafeAreaComponent'

const Home = () => {
  return (
    <SafeAreaComponent style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>
        This is the child home screen
      </Text>
    </SafeAreaComponent>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 8,
    color:"#fff"
  },
})