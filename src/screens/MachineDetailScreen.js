import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import DowntimeView from './modules/DowntimeView';
import MaintenanceView from './modules/MaintenanceView';
import AlertsView from './modules/AlertsView';
import ReportsView from './modules/ReportsView';
import { COLORS, SPACING, FONTS, SHADOWS } from '../utils/theme';

export default function MachineDetailScreen({ route }) {
  const { machine } = route.params;
  const role = useAuthStore(state => state.role);
  const [activeTab, setActiveTab] = useState(role === 'OPERATOR' ? 'Downtime' : 'Alerts');

  const tabs = role === 'OPERATOR' 
    ? ['Downtime', 'Maintenance', 'Reports'] 
    : ['Alerts', 'Reports'];

  const getTabIcon = (tabName) => {
    switch (tabName) {
      case 'Downtime': return 'clock-alert-outline';
      case 'Maintenance': return 'tools';
      case 'Reports': return 'chart-box-outline';
      case 'Alerts': return 'bell-ring-outline';
      default: return 'circle-small';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Downtime': return <DowntimeView machineId={machine.id} />;
      case 'Maintenance': return <MaintenanceView machineId={machine.id} />;
      case 'Alerts': return <AlertsView />;
      case 'Reports': return <ReportsView machineId={machine.id} />;
      default: return null;
    }
  };

  const statusColor = machine.status === 'RUN' ? COLORS.success : machine.status === 'OFF' ? COLORS.secondary : COLORS.warning;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="factory" size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.title}>{machine.name}</Text>
            <Text style={styles.subtitle}>ID: #{machine.id}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
           <Text style={[styles.badgeText, { color: statusColor }]}>{machine.status}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={getTabIcon(tab)} 
              size={20} 
              color={activeTab === tab ? COLORS.primary : COLORS.subtext} 
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    padding: SPACING.l, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.small,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...FONTS.header, fontSize: 20 },
  subtitle: { ...FONTS.caption, marginTop: 2, color: COLORS.textMuted },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
  
  tabBar: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.card, 
    paddingHorizontal: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: SPACING.xl, 
    paddingVertical: SPACING.m,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { ...FONTS.body, fontWeight: '500', color: COLORS.subtext, fontSize: 15 },
  activeTabText: { color: COLORS.primary, fontWeight: '700' },
  content: { flex: 1 },
});
