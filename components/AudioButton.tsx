import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { playAudio } from "@/services/audioService";

type Props = {
  uri?: string | null;
  label?: string;
  style?: ViewStyle;
};

export default function AudioButton({ uri, label = "Play", style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={() => playAudio(uri)}
      disabled={!uri}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="volume-high" size={18} color="#fff" />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#5D5FEF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    opacity: 1,
  },
  text: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },
});

