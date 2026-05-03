import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Progress = () => {
  const skills = [
    { name: 'Tracing (Fidel)', progress: 0.8, color: '#FF6B6B', icon: 'draw' },
    { name: 'Listening', progress: 0.45, color: '#4ECDC4', icon: 'ear-hearing' },
    { name: 'Speaking', progress: 0.3, color: '#20BF6B', icon: 'microphone' },
    { name: 'Vocabulary', progress: 0.6, color: '#6C5CE7', icon: 'cards-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Growth 🚀</Text>
          <Text style={styles.subtitle}>See how much you have learned!</Text>
        </View>

        {/* Skill Progress Cards */}
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <View style={[styles.iconBg, { backgroundColor: skill.color + '20' }]}>
                <MaterialCommunityIcons name={skill.icon as any} size={24} color={skill.color} />
              </View>
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillPercent}>{Math.round(skill.progress * 100)}%</Text>
            </View>
            
            <View style={styles.barContainer}>
              <View style={[styles.barBg, { backgroundColor: '#3F3F5F' }]}>
                <LinearGradient
                  colors={[skill.color, skill.color + '88']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: `${skill.progress * 100}%` }]}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Weekly Activity Chart Placeholder */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Activity</Text>
          <View style={styles.chartRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <View key={i} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height: [40, 70, 30, 90, 50, 20, 10][i], backgroundColor: i === 3 ? '#5D5FEF' : '#3F3F5F' }]} />
                <Text style={styles.chartDay}>{day}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1F1F39' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginVertical: 25 },
  title: { fontSize: 28, fontFamily: 'Poppins-Bold', color: '#FFF' },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#B0B0C0' },
  skillCard: { backgroundColor: '#2A2A40', padding: 20, borderRadius: 25, marginBottom: 15 },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBg: { padding: 10, borderRadius: 12, marginRight: 12 },
  skillName: { flex: 1, color: '#FFF', fontFamily: 'Poppins-SemiBold', fontSize: 16 },
  skillPercent: { color: '#B0B0C0', fontFamily: 'Poppins-Bold' },
  barContainer: { height: 12, width: '100%' },
  barBg: { height: '100%', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  chartCard: { backgroundColor: '#2A2A40', padding: 20, borderRadius: 25, marginTop: 10 },
  chartTitle: { color: '#FFF', fontFamily: 'Poppins-Bold', fontSize: 18, marginBottom: 20 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  chartColumn: { alignItems: 'center' },
  chartBar: { width: 12, borderRadius: 6 },
  chartDay: { color: '#8585A6', fontSize: 10, marginTop: 8, fontFamily: 'Poppins-Medium' },
});