import { Tabs } from 'expo-router'
import React from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFB347",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarStyle: {
          backgroundColor: "#2D2D44",
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins-Medium",
          fontSize: 11,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "ቤት",
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.tabLabel, { color }]}>Home</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="content"
        options={{
          title: "መማር",
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.tabLabel, { color }]}>content</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons 
                name={focused ? "book" : "book-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      
   
      <Tabs.Screen
        name="play"
        options={{
          title: "ጨዋታ",
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color: '#FFB347', marginTop: 30 }]}>Play</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerButton}>
              <View style={styles.centerButtonInner}>
                <Ionicons 
                  name="game-controller" 
                  size={32} 
                  color="#2D2D44" 
                />
              </View>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="progress"
        options={{
          title: "እድገት",
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.tabLabel, { color }]}>Progress</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons 
                name={focused ? "trophy" : "trophy-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "የእኔ",
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.tabLabel, { color }]}>Profile</Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}

export default TabLayout

const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    marginTop: 2,
  },
  centerButton: {
    position: 'absolute',
    top: -25,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#2D2D44',
  },
  centerButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
})