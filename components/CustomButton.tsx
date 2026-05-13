import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import React from 'react';
import { useClickSound } from '@/hooks/useSound';

const COLORS = {
  primary: "#007bff",
  secondary: "#6c757d",
  danger: "#dc3545",
  default: "#FFFFFF",
  outline: "transparent",
  success: "#28a745",
  outlineT:"black"
};

type ColorVariant = keyof typeof COLORS;

type CustomButtonProps = TouchableOpacityProps & {
  title?: string;
  bgVariant?: ColorVariant;
  textVariant?: ColorVariant;
  IconLeft?: React.ComponentType<{ style?: StyleProp<TextStyle> }> | null;
  IconRight?: React.ComponentType<{ style?: StyleProp<TextStyle> }> | null;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  style,
  containerStyle,
  textStyle,
  ...props
}: CustomButtonProps) => {
  const playClickSound = useClickSound();

  const handlePress: TouchableOpacityProps["onPress"] = async (e) => {
    await playClickSound();
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, { backgroundColor: COLORS[bgVariant] }, containerStyle, style]}
      {...props}
    >
      <View style={styles.content}>
        {IconLeft && <IconLeft style={styles.icon} />}
        <Text style={[styles.text, { color: COLORS[textVariant] }, textStyle]}>{title}</Text>
        {IconRight && <IconRight style={styles.icon} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    shadowColor: "#a3a3a3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginHorizontal: 8,
    fontFamily: "Poppins-Bold",
  },
  icon: {
    marginHorizontal: 4,
  },
});

export default CustomButton;
