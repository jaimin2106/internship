import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSyncStore } from '../store/syncStore';
import { COLORS, SPACING, FONTS, RADIUS } from '../utils/theme';

export default function SyncBadge() {
  const pendingCount = useSyncStore(state => state.pendingCount);
  const isOnline = useSyncStore(state => state.isOnline);
  const isSyncing = useSyncStore(state => state.isSyncing);

  // Only show if there's actually pending work
  if (!pendingCount || pendingCount === 0) return null;

  let iconName;
  let text;
  let badgeStyle;
  let iconColor;

  if (isSyncing) {
    iconName = 'cloud-sync';
    text = 'Syncing...';
    badgeStyle = styles.syncing;
    iconColor = COLORS.info;
  } else if (isOnline) {
    iconName = 'cloud-upload';
    text = `${pendingCount} Pending`;
    badgeStyle = styles.pendingOnline;
    iconColor = COLORS.warning;
  } else {
    iconName = 'cloud-off-outline';
    text = `${pendingCount} Offline`;
    badgeStyle = styles.offline;
    iconColor = COLORS.warning;
  }

  return (
    <View style={[styles.badge, badgeStyle]}>
      <MaterialCommunityIcons 
        name={iconName} 
        size={14} 
        color={iconColor} 
      />
      <Text style={[styles.text, { color: iconColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  
  offline: { 
    backgroundColor: COLORS.warningBg,
    borderColor: COLORS.warning + '20',
  },
  
  syncing: { 
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info + '20',
  },
  
  pendingOnline: { 
    backgroundColor: COLORS.warningBg,
    borderColor: COLORS.warning + '20',
  },
  
  text: { 
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  }
});
