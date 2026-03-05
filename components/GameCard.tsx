import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View ,StyleSheet} from "react-native";

const GameCard = ({ title, desc, icon, color }: any) => {
    return (
  <TouchableOpacity style={styles.gameCard}>
    <View style={[styles.gameIconBox, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <View style={styles.gameTextContent}>
      <Text style={styles.gameTitle}>{title}</Text>
      <Text style={styles.gameDesc}>{desc}</Text>
    </View>
    <View style={styles.arrowBox}>
      <Ionicons name="chevron-forward" size={18} color="#5F5F7E" />
    </View>
  </TouchableOpacity>
);
}
export default GameCard
const styles = StyleSheet.create({
  gameIconBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
   gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A40',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
   gameTextContent: {
    flex: 1,
    marginLeft: 15,
  },
  gameTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  gameDesc: {
    fontSize: 12,
    color: '#B0B0C0',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  arrowBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#3F3F5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});