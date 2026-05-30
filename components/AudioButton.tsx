import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { playAudio } from "@/services/audioService";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";

type Props = {
  uri?: string | null;
  label?: string;
  style?: ViewStyle;
  onPlay?: () => void;
};

export default function AudioButton({ uri, label, style, onPlay }: Props) {
  const language = useLanguageStore((state) => state.language);

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={() => {
        onPlay?.();
        void playAudio(uri);
      }}
      disabled={!uri}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="volume-high" size={18} color="#fff" />
      <Text style={styles.text}>{label ?? t(language, "gameUi.play")}</Text>
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

