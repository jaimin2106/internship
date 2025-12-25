import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDB } from '../../db/db';
import { getAlerts, updateAlertStatus, logAlert } from '../../db/helpers';
import { COLORS, SPACING, FONTS, SHADOWS, RADIUS, COMPONENTS } from '../../utils/theme';
import { useAuthStore } from '../../store/authStore';

export default function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    loadAlerts();
    
    // Simulate incoming alerts
    const interval = setInterval(async () => {
      const db = await getDB();
      // Randomly trigger alert
      if (Math.random() > 0.8) {
        await logAlert(db, {
          machineId: 1,
          alertType: 'Warning',
          message: 'Temperature exceeds threshold'
        });
        await loadAlerts();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    const db = await getDB();
    const data = await getAlerts(db);
    setAlerts(data);
  };

  const handleAction = async (id, status) => {
    const db = await getDB();
    await updateAlertStatus(db, { id, status, ackBy: user?.email });
    await loadAlerts();
  };

  const parseAlert = (item) => {
    const match = item.title.match(/^\[(.*?)\] (.*)/);
    if (match) {
      return { ...item, alert_type: match[1], message: match[2] };
    }
    return { ...item, alert_type: 'Info', message: item.title };
  };

  const getAlertConfig = (type) => {
    const configs = {
      'Critical': {
        color: COLORS.danger,
        bgColor: COLORS.dangerBg,
        icon: 'alert-circle',
        iconSize: 24,
      },
      'Warning': {
        color: COLORS.warning,
        bgColor: COLORS.warningBg,
        icon: 'alert',
        iconSize: 24,
      },
      'Info': {
        color: COLORS.info,
        bgColor: COLORS.infoBg,
        icon: 'information',
        iconSize: 24,
      },
    };
    return configs[type] || configs['Info'];
  };

  const getStatusConfig = (status) => {
    const configs = {
      'CREATED': {
        label: 'New Alert',
        color: COLORS.danger,
        bgColor: COLORS.dangerBg,
        icon: 'alert-circle-outline',
      },
      'ACKNOWLEDGED': {
        label: 'Acknowledged',
        color: COLORS.info,
        bgColor: COLORS.infoBg,
        icon: 'check-circle-outline',
      },
      'CLEARED': {
        label: 'Cleared',
        color: COLORS.success,
        bgColor: COLORS.successBg,
        icon: 'check-circle',
      },
    };
    return configs[status] || configs['CREATED'];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => {
    const alert = parseAlert(item);
    const alertConfig = getAlertConfig(alert.alert_type);
    const statusConfig = getStatusConfig(alert.status);

    return (
      <View style={styles.card}>
        {/* Alert Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: alertConfig.bgColor }]}>
              <MaterialCommunityIcons 
                name={alertConfig.icon} 
                size={alertConfig.iconSize} 
                color={alertConfig.color} 
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.alertType}>{alert.alert_type}</Text>
              <Text style={styles.timestamp}>{formatTime(alert.created_at)}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <MaterialCommunityIcons 
              name={statusConfig.icon} 
              size={14} 
              color={statusConfig.color} 
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Alert Message */}
        <Text style={styles.message}>{alert.message}</Text>

        {/* Alert Metadata */}
        {alert.ackBy && (
          <View style={styles.metadata}>
            <MaterialCommunityIcons 
              name="account-check" 
              size={14} 
              color={COLORS.textMuted} 
            />
            <Text style={styles.metadataText}>
              Acknowledged by {alert.ackBy} at {new Date(alert.ackAt).toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {alert.status === 'CREATED' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.acknowledgeButton]} 
              onPress={() => handleAction(alert.id, 'ACKNOWLEDGED')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="check-circle-outline" 
                size={18} 
                color={COLORS.card} 
              />
              <Text style={styles.actionButtonText}>Acknowledge</Text>
            </TouchableOpacity>
          )}
          
          {alert.status === 'ACKNOWLEDGED' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.clearButton]} 
              onPress={() => handleAction(alert.id, 'CLEARED')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name="check-circle" 
                size={18} 
                color={COLORS.card} 
              />
              <Text style={styles.actionButtonText}>Clear Alert</Text>
            </TouchableOpacity>
          )}
          
          {alert.status === 'CLEARED' && (
            <View style={styles.clearedInfo}>
              <MaterialCommunityIcons 
                name="check-all" 
                size={16} 
                color={COLORS.success} 
              />
              <Text style={styles.clearedText}>
                Alert resolved at {new Date(alert.clearedAt).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        {/* Left Border Indicator */}
        <View style={[styles.leftIndicator, { backgroundColor: alertConfig.color }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList 
        data={alerts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons 
                name="shield-check" 
                size={64} 
                color={COLORS.success} 
              />
            </View>
            <Text style={styles.emptyTitle}>All Systems Operational</Text>
            <Text style={styles.emptyText}>
              No active alerts. All machines are running smoothly.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  list: {
    padding: SPACING.m,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
    position: 'relative',
    overflow: 'hidden',
  },

  leftIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.m,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  headerInfo: {
    flex: 1,
  },

  alertType: {
    ...FONTS.heading,
    fontSize: 16,
    marginBottom: SPACING.xxs,
  },

  timestamp: {
    ...FONTS.caption,
    color: COLORS.textMuted,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: SPACING.xxs,
  },

  statusText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Message
  message: {
    ...FONTS.body,
    marginBottom: SPACING.m,
    lineHeight: 22,
  },

  // Metadata
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },

  metadataText: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    flex: 1,
  },

  // Actions
  actions: {
    marginTop: SPACING.xs,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: COMPONENTS.button.medium,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    ...SHADOWS.small,
  },

  actionButtonText: {
    ...FONTS.button,
    fontSize: 15,
    color: COLORS.card,
    fontWeight: '700',
  },

  acknowledgeButton: {
    backgroundColor: COLORS.info,
  },

  clearButton: {
    backgroundColor: COLORS.success,
  },

  clearedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },

  clearedText: {
    ...FONTS.caption,
    color: COLORS.success,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.l,
  },

  emptyIconContainer: {
    marginBottom: SPACING.l,
  },

  emptyTitle: {
    ...FONTS.heading,
    fontSize: 20,
    marginBottom: SPACING.s,
    color: COLORS.text,
  },

  emptyText: {
    ...FONTS.label,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
