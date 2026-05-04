import React, { useEffect, useMemo, useRef } from "react";
import { Dimensions, View, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: W, height: H } = Dimensions.get("window");

type SpaceBackgroundProps = {
  children?: React.ReactNode;
  starCount?: number;
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  children,
  starCount = 60,
}) => {
  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * (H - 80) + 40,
      size: Math.random() * 2 + 1,
      twinkle: Math.random() * 1000,
      opacity: 0.5 + Math.random() * 0.6,
    }));
  }, [starCount]);

  const sparkles = useMemo(() => {
    return Array.from({ length: 18 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 1 + Math.random() * 1.5,
      rotation: `${Math.random() * 180}deg`,
      delay: Math.random() * 2000,
    }));
  }, []);

  const twinkles = useRef(
    stars.map(() => new Animated.Value(Math.random())),
  ).current;

  useEffect(() => {
    // twinkle animations loop
    const loops = twinkles.map((t, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(t, {
            toValue: 0.2,
            duration: 900 + (i % 4) * 300,
            useNativeDriver: true,
          }),
          Animated.timing(t, {
            toValue: 1,
            duration: 900 + ((i + 2) % 4) * 300,
            useNativeDriver: true,
          }),
        ]),
      ).start(),
    );

    return () => {
      loops.forEach(() => {});
    };
  }, [twinkles]);

  return (
    <View style={styles.wrapper}>
      {/* subtle deep-space gradient */}
      <LinearGradient
        colors={["#031827", "#061a2c", "#071827"]}
        style={StyleSheet.absoluteFill}
      />

      {/* nebula clouds */}
      <LinearGradient
        colors={[
          "rgba(110,80,255,0.22)",
          "rgba(110,80,255,0.05)",
          "transparent",
        ]}
        style={[styles.nebula, styles.nebulaA]}
      />
      <LinearGradient
        colors={[
          "rgba(48,190,255,0.18)",
          "rgba(48,190,255,0.05)",
          "transparent",
        ]}
        style={[styles.nebula, styles.nebulaB]}
      />
      <LinearGradient
        colors={[
          "rgba(255,120,200,0.12)",
          "rgba(255,120,200,0.04)",
          "transparent",
        ]}
        style={[styles.nebula, styles.nebulaC]}
      />

      {/* stars */}
      {stars.map((s, i) => (
        <Animated.View
          key={`star-${i}`}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: 2,
            backgroundColor: "#fff",
            opacity: Animated.multiply(twinkles[i], s.opacity),
            transform: [{ scale: twinkles[i] }],
            shadowColor: "#fff",
            shadowOpacity: 0.8,
            shadowRadius: 2,
          }}
        />
      ))}

      {/* sparkles */}
      {sparkles.map((sparkle, i) => (
        <Animated.View
          key={`sparkle-${i}`}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            borderRadius: 999,
            backgroundColor: "rgba(220, 248, 255, 0.95)",
            shadowColor: "#C6F4FF",
            shadowOpacity: 1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            transform: [{ rotate: sparkle.rotation }, { scale: 1 }],
            opacity: 0.75,
          }}
        />
      ))}

      {/* shooting stars removed */}

      {/* children on top */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default SpaceBackground;

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  nebula: {
    position: "absolute",
    width: W * 0.72,
    height: H * 0.38,
    borderRadius: 999,
    opacity: 0.9,
    transform: [{ rotate: "-12deg" }],
  },
  nebulaA: {
    left: -W * 0.08,
    top: H * 0.03,
  },
  nebulaB: {
    right: -W * 0.06,
    top: H * 0.14,
    transform: [{ rotate: "18deg" }],
  },
  nebulaC: {
    left: W * 0.14,
    top: H * 0.32,
    width: W * 0.52,
    height: H * 0.24,
    transform: [{ rotate: "-4deg" }],
  },
  content: {
    flex: 1,
  },
  // shootingCore removed
});
