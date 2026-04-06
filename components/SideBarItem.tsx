import { COLORS, FONTS, RADIUS, SPACING } from "@/const";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet,View, Text } from "react-native";

const SidebarItem = ({ icon, label, onPress, variant = 'primary' }: any) => {
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View
        style={[
          styles.iconBg,
          {
            backgroundColor: isSecondary
              ? COLORS.card
              : COLORS.secondary,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={isSecondary ? 18 : 24}
          color={isSecondary ? COLORS.textSecondary : '#fff'}
        />
      </View>

      <Text
        style={[
          styles.itemLabel,
          isSecondary && styles.labelSecondary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
export default SidebarItem
const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  iconBg: {
    width: 45,
    height: 45,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemLabel: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.semi,
    marginLeft: SPACING.md,
  },

  labelSecondary: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});