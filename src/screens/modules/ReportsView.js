import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDB } from '../../db/db';
import { getMachineStats } from '../../db/helpers';
import { COLORS, SPACING, FONTS, SHADOWS, RADIUS } from '../../utils/theme';

const { width } = Dimensions.get('window');

export default function ReportsView({ machineId }) {
  const [stats, setStats] = useState({
    totalDowntimeEvents: 0,
    totalDuration: 0,
    topReason: 'N/A'
  });

  useEffect(() => {
    calculateStats();
  }, [machineId]);

  const calculateStats = async () => {
    try {
      const db = await getDB();
      const data = await getMachineStats(db, machineId);
      setStats(data);
    } catch (e) {
      console.log('Error calculating stats', e);
    }
  };

  const getSeverity = (duration) => {
    if (duration > 240) return { color: COLORS.danger, bg: COLORS.dangerBg, label: 'CRITICAL' };
    if (duration > 60) return { color: COLORS.warning, bg: COLORS.warningBg, label: 'ATTENTION' };
    return { color: COLORS.success, bg: COLORS.successBg, label: 'GOOD' };
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const severity = getSeverity(stats.totalDuration);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance</Text>
        <Text style={styles.headerSubtitle}>Machine Analytics & Insights</Text>
      </View>

      {/* Hero Metric Card - Dark Theme for Impact */}
      <View style={[styles.heroCard, { borderBottomColor: severity.color }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconCircle}>
             <MaterialCommunityIcons name="timer-sand" size={24} color={COLORS.card} />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: severity.color }]}>
            <Text style={styles.statusText}>{severity.label}</Text>
          </View>
        </View>
        
        <View style={styles.heroContent}>
          <Text style={styles.heroValue}>
            {formatDuration(stats.totalDuration)}
          </Text>
          <Text style={styles.heroLabel}>Total Downtime Duration</Text>
        </View>
      </View>

      {/* Bento Grid Layout */}
      <View style={styles.bentoGrid}>
        {/* Count Card */}
        <View style={[styles.card, styles.col1]}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.infoBg }]}>
            <MaterialCommunityIcons name="counter" size={24} color={COLORS.info} />
          </View>
          <Text style={styles.metricValue}>{stats.totalDowntimeEvents}</Text>
          <Text style={styles.metricLabel}>Events</Text>
          <Text style={styles.metricSub}>Recorded Stops</Text>
        </View>

        {/* Top Reason Card - Emphasis */}
        <View style={[styles.card, styles.col1]}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.dangerBg }]}>
            <MaterialCommunityIcons name="alert-decagram" size={24} color={COLORS.danger} />
          </View>
          <Text style={[styles.metricValue, { fontSize: 24, lineHeight: 32 }]} numberOfLines={1}>
            {stats.topReason}
          </Text>
          <Text style={styles.metricLabel}>Top Cause</Text>
          <Text style={styles.metricSub}>Primary Bottleneck</Text>
        </View>
      </View>

      {/* Insight Card */}
      <View style={styles.insightCard}>
        <View style={styles.insightContent}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
             <Text style={styles.insightTitle}>Optimization Insight</Text>
             <Text style={styles.insightText}>
               {stats.totalDuration === 0 
                 ? "Machine is running perfectly. No downtime recorded."
                 : `Reducing "${stats.topReason}" could save approx ${Math.round(stats.totalDuration * 0.4)}m of production time based on current trends.`}
             </Text>
          </View>
        </View>
      </View>

      <Text style={styles.footerNote}>
        Data computed from local logs. Sync to cloud for detailed historical analysis.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.m,
    paddingBottom: SPACING.xxl,
  },
  
  // Header
  header: {
    marginBottom: SPACING.l,
    marginTop: SPACING.s,
  },
  headerTitle: {
    ...FONTS.display,
    fontSize: 32,
    color: COLORS.dark,
    letterSpacing: -1,
  },
  headerSubtitle: {
    ...FONTS.body,
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 4,
  },

  // Hero Card
  heroCard: {
    backgroundColor: COLORS.dark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    ...SHADOWS.large,
    borderBottomWidth: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroIconCircle: {
    width: 48, 
    height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
  },
  statusText: {
    color: COLORS.card,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.card,
    letterSpacing: -2,
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
  },
  heroLabel: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '500',
    marginTop: SPACING.xs,
    opacity: 0.8,
  },

  // Grid
  bentoGrid: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  col1: {
    flex: 1,
  },
  
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.m,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 4,
    letterSpacing: -1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Insight
  insightCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.m,
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.m,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.s,
  },
});
