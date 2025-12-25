import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { getDB } from '../../db/db';
import { logDowntime, getDowntimeLogs, endDowntime, getActiveDowntime } from '../../db/helpers';
import { DOWNTIME_REASONS } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, FONTS, SHADOWS, RADIUS, COMPONENTS } from '../../utils/theme';

export default function DowntimeView({ machineId }) {
  const [activeDowntime, setActiveDowntime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const tenantId = useAuthStore(state => state.tenantId);

  // Icon mapping for downtime reasons
  const getReasonIcon = (reason) => {
    const iconMap = {
      'Power': 'lightning-bolt',
      'No Order': 'clipboard-remove-outline',
      'Changeover': 'autorenew',
      'Breakdown': 'cog-off',
    };
    return iconMap[reason] || 'alert-circle';
  };

  // Child icon mapping
  const getChildIcon = (reason) => {
    const map = {
      // Power
      'Grid Failure': 'transmission-tower',
      'Fuse Blown': 'flash-off',
      'Voltage Dip': 'sine-wave',
      
      // No Order
      'Planned': 'calendar-check',
      'Schedule Gap': 'calendar-remove',
      'No Material': 'package-variant-closed',
      
      // Changeover
      'Tooling': 'tools',
      'Cleaning': 'spray-bottle',
      'Setup': 'tune',
      
      // Breakdown
      'Mechanical': 'cog',
      'Electrical': 'power-plug',
      'Sensor': 'eye-settings',
    };
    return map[reason] || 'circle-small';
  };

  useEffect(() => {
    loadLogs();
  }, [machineId]);

  const loadLogs = async () => {
    const db = await getDB();
    const data = await getDowntimeLogs(db, machineId);
    setLogs(data);
    
    const active = await getActiveDowntime(db, machineId);
    setActiveDowntime(active);
  };

  const handleStart = async () => {
    if (!selectedParent || !selectedChild) {
      Alert.alert('Required', 'Please select a reason first.');
      return;
    }

    try {
      const db = await getDB();
      const active = await getActiveDowntime(db, machineId);
      if (active) {
        Alert.alert('Error', 'Machine is already down.');
        await loadLogs(); 
        return;
      }

      const now = new Date().toISOString();
      await logDowntime(db, {
        machineId,
        startTime: now,
        reasonCategory: selectedParent,
        reasonDetail: selectedChild,
        imageUri,
        tenantId
      });
      setImageUri(null);
      setSelectedParent(null);
      setSelectedChild(null);
      await loadLogs();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to start downtime');
    }
  };

  const handleEnd = async () => {
    if (!activeDowntime) return;
    try {
      const db = await getDB();
      const now = new Date().toISOString();
      await endDowntime(db, { id: activeDowntime.id, endTime: now });
      setActiveDowntime(null);
      await loadLogs();
    } catch (e) {
      Alert.alert('Error', 'Failed to end downtime');
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(manipResult.uri);
    }
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = endDate - startDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Active Downtime Alert */}
      {activeDowntime ? (
        <View style={styles.activeContainer}>
          <View style={styles.activeHeader}>
            <MaterialCommunityIcons 
              name="alert-circle" 
              size={32} 
              color={COLORS.danger} 
            />
            <Text style={styles.activeLabel}>MACHINE DOWN</Text>
          </View>
          
          <View style={styles.activeInfo}>
            <Text style={styles.activeReason}>
              {activeDowntime.reason_category}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color={COLORS.textMuted} 
            />
            <Text style={styles.activeDetail}>
              {activeDowntime.reason_detail}
            </Text>
          </View>

          <View style={styles.activeMetadata}>
            <View style={styles.metadataItem}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={16} 
                color={COLORS.textMuted} 
              />
              <Text style={styles.metadataText}>
                Started: {new Date(activeDowntime.start_time).toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <MaterialCommunityIcons 
                name="timer-sand" 
                size={16} 
                color={COLORS.textMuted} 
              />
              <Text style={styles.metadataText}>
                Duration: {calculateDuration(activeDowntime.start_time)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.endButton} 
            onPress={handleEnd}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="stop-circle" 
              size={20} 
              color={COLORS.card} 
            />
            <Text style={styles.endButtonText}>End Downtime</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Log Downtime</Text>
          
          {/* Reason Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Reason Category</Text>
            <View style={styles.chipGrid}>
              {Object.keys(DOWNTIME_REASONS).map(parent => (
                <TouchableOpacity 
                  key={parent} 
                  style={[
                    styles.chip, 
                    selectedParent === parent && styles.chipActive
                  ]}
                  onPress={() => { setSelectedParent(parent); setSelectedChild(null); }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name={getReasonIcon(parent)} 
                    size={18} 
                    color={selectedParent === parent ? COLORS.card : COLORS.text} 
                  />
                  <Text style={[
                    styles.chipText, 
                    selectedParent === parent && styles.chipTextActive
                  ]}>
                    {parent}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reason Detail */}
          {selectedParent && (
            <View style={styles.section}>
              <Text style={styles.label}>Specific Issue</Text>
              <View style={styles.chipGrid}>
                {DOWNTIME_REASONS[selectedParent].map(child => (
                  <TouchableOpacity 
                    key={child} 
                    style={[
                      styles.chipDetail, 
                      selectedChild === child && styles.chipActive
                    ]}
                    onPress={() => setSelectedChild(child)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name={getChildIcon(child)} 
                      size={16} 
                      color={selectedChild === child ? COLORS.card : COLORS.textMuted} 
                    />
                    <Text style={[
                      styles.chipText, 
                      selectedChild === child && styles.chipTextActive
                    ]}>
                      {child}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Photo Attachment */}
          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={takePhoto}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={imageUri ? "check-circle" : "camera"} 
              size={20} 
              color={imageUri ? COLORS.success : COLORS.textMuted} 
            />
            <Text style={[
              styles.photoButtonText,
              imageUri && styles.photoButtonTextActive
            ]}>
              {imageUri ? 'Photo Attached' : 'Take Photo (Optional)'}
            </Text>
          </TouchableOpacity>
          
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          )}

          {/* Start Button */}
          <TouchableOpacity 
            style={[
              styles.startButton, 
              (!selectedParent || !selectedChild) && styles.startButtonDisabled
            ]} 
            onPress={handleStart}
            disabled={!selectedParent || !selectedChild}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="play-circle" 
              size={20} 
              color={COLORS.card} 
            />
            <Text style={styles.startButtonText}>Start Downtime</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Logs */}
      {logs.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Downtime</Text>
          {logs.slice(0, 5).map(log => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={styles.logReasonContainer}>
                  <Text style={styles.logReason}>
                    {log.reason_category}
                  </Text>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={12} 
                    color={COLORS.textLight} 
                  />
                  <Text style={styles.logDetail}>
                    {log.reason_detail}
                  </Text>
                </View>
                
                <View style={[
                  styles.syncBadge,
                  { backgroundColor: log.synced ? COLORS.successBg : COLORS.warningBg }
                ]}>
                  <MaterialCommunityIcons 
                    name={log.synced ? "cloud-check" : "cloud-sync"} 
                    size={12} 
                    color={log.synced ? COLORS.success : COLORS.warning} 
                  />
                  <Text style={[
                    styles.syncText,
                    { color: log.synced ? COLORS.success : COLORS.warning }
                  ]}>
                    {log.synced ? 'Synced' : 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.logMetadata}>
                <View style={styles.logTime}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={14} 
                    color={COLORS.textMuted} 
                  />
                  <Text style={styles.logTimeText}>
                    {new Date(log.start_time).toLocaleTimeString()}
                    {' - '}
                    {log.end_time ? new Date(log.end_time).toLocaleTimeString() : 'Active'}
                  </Text>
                </View>
                
                <View style={styles.logDuration}>
                  <MaterialCommunityIcons 
                    name="timer-outline" 
                    size={14} 
                    color={COLORS.textMuted} 
                  />
                  <Text style={styles.logDurationText}>
                    {calculateDuration(log.start_time, log.end_time)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
    paddingBottom: SPACING.xl,
  },

  // Active Downtime
  activeContainer: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.xl,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    borderWidth: 2,
    borderColor: COLORS.danger,
    ...SHADOWS.medium,
  },

  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.l,
  },

  activeLabel: {
    ...FONTS.title,
    fontSize: 20,
    color: COLORS.danger,
    fontWeight: '800',
    letterSpacing: 1,
  },

  activeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.l,
    gap: SPACING.xs,
  },

  activeReason: {
    ...FONTS.heading,
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '700',
  },

  activeDetail: {
    ...FONTS.body,
    color: COLORS.textMuted,
  },

  activeMetadata: {
    gap: SPACING.s,
    marginBottom: SPACING.l,
  },

  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'center',
  },

  metadataText: {
    ...FONTS.label,
    color: COLORS.textMuted,
  },

  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: COMPONENTS.button.large,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    ...SHADOWS.small,
  },

  endButtonText: {
    ...FONTS.button,
    fontSize: 18,
    color: COLORS.card,
    fontWeight: '700',
  },

  // Form
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    ...SHADOWS.small,
  },

  formTitle: {
    ...FONTS.title,
    fontSize: 20,
    marginBottom: SPACING.l,
  },

  section: {
    marginBottom: SPACING.l,
  },

  label: {
    ...FONTS.label,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: COMPONENTS.touchTarget.min,
    justifyContent: 'center',
  },

  chipDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: COMPONENTS.touchTarget.min,
    justifyContent: 'center',
  },

  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    ...FONTS.label,
    fontWeight: '600',
    color: COLORS.text,
  },

  chipTextActive: {
    color: COLORS.card,
    fontWeight: '700',
  },

  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderStyle: 'dashed',
    backgroundColor: COLORS.background,
    marginBottom: SPACING.m,
    gap: SPACING.xs,
    minHeight: COMPONENTS.touchTarget.preferred,
  },

  photoButtonText: {
    ...FONTS.label,
    color: COLORS.textMuted,
  },

  photoButtonTextActive: {
    color: COLORS.success,
    fontWeight: '600',
  },

  preview: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.m,
  },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: COMPONENTS.button.large,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    ...SHADOWS.small,
  },

  startButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.textMuted,
  },

  startButtonText: {
    ...FONTS.button,
    fontSize: 18,
    color: COLORS.card,
    fontWeight: '700',
  },

  // History
  historySection: {
    marginTop: SPACING.s,
  },

  historyTitle: {
    ...FONTS.heading,
    fontSize: 18,
    marginBottom: SPACING.m,
  },

  logCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.m,
    marginBottom: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },

  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },

  logReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.xs,
  },

  logReason: {
    ...FONTS.label,
    fontWeight: '700',
    color: COLORS.text,
  },

  logDetail: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    flex: 1,
  },

  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
    gap: SPACING.xxs,
  },

  syncText: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  logMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    flex: 1,
  },

  logTimeText: {
    ...FONTS.caption,
    color: COLORS.textMuted,
  },

  logDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },

  logDurationText: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
