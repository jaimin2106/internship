import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, SHADOWS, RADIUS } from '../utils/theme';

export default function MachineCard({ machine, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'RUN': return COLORS.success;
      case 'IDLE': return COLORS.warning;
      case 'OFF': return COLORS.danger;
      default: return COLORS.textMuted;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'RUN': return COLORS.successBg;
      case 'IDLE': return COLORS.warningBg;
      case 'OFF': return COLORS.dangerBg;
      default: return COLORS.background;
    }
  };

  const statusColor = getStatusColor(machine.status);
  const statusBg = getStatusBg(machine.status);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Machine Info */}
        <View style={styles.info}>
          <View style={styles.nameContainer}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name="factory" 
                size={20} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.machineName}>{machine.name}</Text>
          </View>
          <Text style={styles.machineId}>ID: #{machine.id}</Text>
        </View>
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {machine.status}
          </Text>
        </View>
      </View>
      
      {/* Bottom Indicator */}
      <View style={[styles.indicator, { backgroundColor: statusColor }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.l,
  },
  
  info: {
    flex: 1,
  },

  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xxs,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  machineName: {
    ...FONTS.heading,
    flex: 1,
  },
  
  machineId: {
    ...FONTS.caption,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  statusText: {
    ...FONTS.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  indicator: {
    height: 4,
  },
});
