import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDB } from '../db/db';
import { getMachines } from '../db/helpers';
import MachineCard from '../components/MachineCard';
import { useAuthStore } from '../store/authStore';
import SyncBadge from '../components/SyncBadge';
import { COLORS, SPACING, FONTS, SHADOWS, RADIUS } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const [machines, setMachines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore(state => state.user);
  const role = useAuthStore(state => state.role);
  const logout = useAuthStore(state => state.logout);

  const fetchMachines = async () => {
    const db = await getDB();
    const data = await getMachines(db);
    setMachines(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMachines();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMachines();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              Hi, {user?.email?.split('@')[0] || 'User'}
            </Text>
            <View style={styles.roleContainer}>
              <View style={[
                styles.roleBadge,
                role === 'SUPERVISOR' && styles.roleBadgeSupervisor
              ]}>
                <MaterialCommunityIcons 
                  name={role === 'SUPERVISOR' ? 'account-tie' : 'account-hard-hat'} 
                  size={14} 
                  color={COLORS.info}
                  style={styles.roleIcon}
                />
                <Text style={styles.roleText}>
                  {role === 'SUPERVISOR' ? 'Supervisor' : 'Operator'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <SyncBadge />
            <TouchableOpacity 
              onPress={logout} 
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.subtitle}>
          {machines.length} {machines.length === 1 ? 'Machine' : 'Machines'} Available
        </Text>
      </View>
      
      {/* Machine List */}
      <FlatList
        data={machines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MachineCard 
            machine={item} 
            onPress={() => navigation.navigate('MachineDetail', { machine: item })} 
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="factory" 
              size={64} 
              color={COLORS.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Machines Found</Text>
            <Text style={styles.emptyText}>
              Pull down to refresh and load machines
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>
              Developed by Jaimin for Limelight
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
  
  // Header
  header: {
    backgroundColor: COLORS.card,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  
  userInfo: {
    flex: 1,
  },
  
  greeting: {
    ...FONTS.title,
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.info + '20',
    gap: SPACING.xxs,
  },
  
  roleBadgeSupervisor: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary + '20',
  },
  
  roleIcon: {
    marginRight: SPACING.xxs,
  },
  
  roleText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.info,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  
  logoutButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '20',
  },
  
  logoutText: {
    ...FONTS.label,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  
  subtitle: {
    ...FONTS.label,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  
  // List
  listContent: {
    padding: SPACING.m,
    paddingBottom: SPACING.xl,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.l,
  },
  
  emptyIcon: {
    marginBottom: SPACING.m,
  },
  
  emptyTitle: {
    ...FONTS.heading,
    marginBottom: SPACING.s,
    color: COLORS.text,
  },
  
  emptyText: {
    ...FONTS.label,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.m,
    marginTop: SPACING.l,
  },
  
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.m,
  },
  
  footerText: {
    ...FONTS.caption,
    color: COLORS.textLight,
  },
});
