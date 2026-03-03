import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import React from 'react';

const COLORS = {
  primary: "#007bff",
  secondary: "#6c757d",
  danger: "#dc3545",
  default: "#FFFFFF",
  outline: "transparent",
  success: "#28a745",
  outlineT:"black"
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: COLORS[bgVariant] }, style]}
      {...props}
    >
      <View style={styles.content}>
        {IconLeft && <IconLeft style={styles.icon} />}
        <Text style={[styles.text, { color: COLORS[textVariant] }]}>{title}</Text>
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
