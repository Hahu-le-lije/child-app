import React, { useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useClickSound } from "@/hooks/useSound";

const { width } = Dimensions.get("window");

const GameCard = ({ title, desc, image, onPress }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const playClickSound = useClickSound();

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    await playClickSound();
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
       
        <View style={styles.imageBox}>
          <Image source={image} style={styles.image} resizeMode="contain" />
        </View>

      
        <View style={styles.textArea}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>

      
        <View style={styles.playButton}>
          <Ionicons name="play" size={18} color="#fff" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GameCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: width * 0.9,
    backgroundColor: "#2F2F42",
    borderRadius: 18,
    padding: 12,
    marginVertical: 8,
    alignItems: "center",
  },

  imageBox: {
    width: 90,
    height: 75,
    borderRadius: 14,
    backgroundColor: "#3F3F5F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  image: {
    width: 70,
    height: 70,
  },

  textArea: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },

  desc: {
    fontSize: 13,
    color: "#ccc",
    fontFamily: "Poppins-Regular",
    marginTop: 4,
  },

  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0286FF",
    justifyContent: "center",
    alignItems: "center",
  },
});