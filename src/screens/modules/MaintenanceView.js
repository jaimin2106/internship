import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDB } from '../../db/db';
import { getMaintenanceTasks, updateTaskStatus } from '../../db/helpers';
import { COLORS, SPACING, FONTS, SHADOWS, RADIUS, COMPONENTS } from '../../utils/theme';

export default function MaintenanceView({ machineId }) {
  const [tasks, setTasks] = useState([]);
  const [note, setNote] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [machineId]);

  const loadTasks = async () => {
    const db = await getDB();
    const data = await getMaintenanceTasks(db, machineId);
    setTasks(data);
  };

  const handleMarkDone = async (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const confirmDone = async () => {
    try {
      const db = await getDB();
      const now = new Date().toISOString();
      await updateTaskStatus(db, {
        id: selectedTask.id,
        status: 'DONE',
        completedAt: now,
        notes: note
      });
      setModalVisible(false);
      setNote('');
      await loadTasks();
    } catch (e) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'DONE': {
        color: COLORS.success,
        bgColor: COLORS.successBg,
        icon: 'check-circle',
        label: 'Done',
      },
      'OVERDUE': {
        color: COLORS.danger,
        bgColor: COLORS.dangerBg,
        icon: 'alert-circle',
        label: 'Overdue',
      },
      'DUE': {
        color: COLORS.warning,
        bgColor: COLORS.warningBg,
        icon: 'clock-alert',
        label: 'Due',
      },
    };
    return configs[status] || configs['DUE'];
  };

  const renderItem = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: statusConfig.bgColor }]}>
              <MaterialCommunityIcons 
                name={statusConfig.icon} 
                size={24} 
                color={statusConfig.color} 
              />
            </View>
            <Text style={styles.taskTitle}>{item.description}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Due Date/Completed Info */}
        {item.status !== 'DONE' && item.due_date && (
          <View style={styles.metadataRow}>
            <MaterialCommunityIcons 
              name="calendar-clock" 
              size={16} 
              color={statusConfig.color} 
            />
            <Text style={[styles.metadataText, { color: statusConfig.color }]}>
              Due: {new Date(item.due_date).toLocaleDateString()}
            </Text>
          </View>
        )}

        {item.status === 'DONE' && (
          <View style={styles.completedSection}>
            <View style={styles.completedHeader}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={16} 
                color={COLORS.success} 
              />
              <Text style={styles.completedLabel}>Completed</Text>
            </View>
            <Text style={styles.completedTime}>
              {new Date(item.last_completed).toLocaleString()}
            </Text>
            
            {item.notes && (
              <View style={styles.noteContainer}>
                <View style={styles.noteHeader}>
                  <MaterialCommunityIcons 
                    name="note-text" 
                    size={14} 
                    color={COLORS.textMuted} 
                  />
                  <Text style={styles.noteLabel}>Notes</Text>
                </View>
                <Text style={styles.noteText}>"{item.notes}"</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        {item.status !== 'DONE' && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleMarkDone(item)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="checkbox-marked-circle" 
              size={20} 
              color={COLORS.card} 
            />
            <Text style={styles.actionButtonText}>Mark as Done</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList 
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="clipboard-check" 
              size={64} 
              color={COLORS.success} 
            />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>
              No maintenance tasks for this machine
            </Text>
          </View>
        }
      />

      {/* Completion Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons 
                name="clipboard-check" 
                size={32} 
                color={COLORS.success} 
              />
              <Text style={styles.modalTitle}>Complete Task</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>{selectedTask?.description}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="Add observations, issues found, or actions taken..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => { setModalVisible(false); setNote(''); }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={confirmDone}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={18} 
                  color={COLORS.card} 
                />
                <Text style={styles.confirmText}>Confirm Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: SPACING.xl,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.m,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskTitle: {
    ...FONTS.heading,
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },

  statusText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Metadata
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  metadataText: {
    ...FONTS.label,
    fontWeight: '600',
  },

  // Completed Section
  completedSection: {
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  completedLabel: {
    ...FONTS.label,
    fontWeight: '700',
    color: COLORS.success,
  },

  completedTime: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  noteContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },

  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginBottom: SPACING.xxs,
  },

  noteLabel: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },

  noteText: {
    ...FONTS.body,
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.text,
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: COMPONENTS.button.medium,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    marginTop: SPACING.m,
    gap: SPACING.xs,
    ...SHADOWS.small,
  },

  actionButtonText: {
    ...FONTS.button,
    color: COLORS.card,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.l,
  },

  emptyTitle: {
    ...FONTS.heading,
    fontSize: 20,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },

  emptyText: {
    ...FONTS.label,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.l,
  },

  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.l,
    ...SHADOWS.large,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.m,
  },

  modalTitle: {
    ...FONTS.title,
    fontSize: 22,
  },

  modalSubtitle: {
    ...FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.l,
  },

  inputGroup: {
    marginBottom: SPACING.l,
  },

  label: {
    ...FONTS.label,
    fontWeight: '700',
    marginBottom: SPACING.s,
  },

  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.m,
    height: 120,
    textAlignVertical: 'top',
    ...FONTS.body,
    backgroundColor: COLORS.background,
  },

  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  cancelButton: {
    flex: 1,
    height: COMPONENTS.button.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  cancelText: {
    ...FONTS.button,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: COMPONENTS.button.medium,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    ...SHADOWS.small,
  },

  confirmText: {
    ...FONTS.button,
    color: COLORS.card,
    fontWeight: '700',
  },
});
