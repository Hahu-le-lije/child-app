import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type FunBackgroundProps = {

  opacity?: number;
};

export default function FunBackground({ opacity = 1 }: FunBackgroundProps) {
  return (
    <View pointerEvents="none" style={[styles.wrap, { opacity }]}>
      <LinearGradient
        colors={["#07172C", "#0D2342", "#123661"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bgOrbA} />
      <View style={styles.bgOrbB} />
      <View style={styles.bgOrbC} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  bgOrbA: {
    position: "absolute",
    top: 70,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(90, 160, 255, 0.18)",
  },
  bgOrbB: {
    position: "absolute",
    top: 190,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255, 192, 120, 0.12)",
  },
  bgOrbC: {
    position: "absolute",
    bottom: 120,
    left: 20,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(130, 255, 208, 0.12)",
  },
});

