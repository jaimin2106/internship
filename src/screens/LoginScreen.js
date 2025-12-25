import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { COLORS, SPACING, FONTS, SHADOWS, RADIUS, COMPONENTS } from '../utils/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OPERATOR');
  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your email address');
      return;
    }
    login(email.trim(), role);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <MaterialCommunityIcons 
                  name="factory" 
                  size={28} 
                  color={COLORS.primary} 
                />
              </View>
              <Text style={styles.brandTitle}>Factory Operations</Text>
            </View>
            <Text style={styles.brandSubtitle}>Secure Offline Operations</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="operator@factory.com"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Role Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Your Role</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'OPERATOR' && styles.roleButtonActive
                  ]}
                  onPress={() => setRole('OPERATOR')}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleContent}>
                    <MaterialCommunityIcons 
                      name="account-hard-hat" 
                      size={32} 
                      color={role === 'OPERATOR' ? COLORS.primary : COLORS.textMuted} 
                    />
                    <Text 
                      style={[
                        styles.roleLabel,
                        role === 'OPERATOR' && styles.roleLabelActive
                      ]}
                    >
                      Operator
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'SUPERVISOR' && styles.roleButtonActive
                  ]}
                  onPress={() => setRole('SUPERVISOR')}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleContent}>
                    <MaterialCommunityIcons 
                      name="account-tie" 
                      size={32} 
                      color={role === 'SUPERVISOR' ? COLORS.primary : COLORS.textMuted} 
                    />
                    <Text 
                      style={[
                        styles.roleLabel,
                        role === 'SUPERVISOR' && styles.roleLabelActive
                      ]}
                    >
                      Supervisor
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Offline-first operations for factory floor
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  container: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.l,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  
  brandTitle: {
    ...FONTS.display,
    fontSize: 26,
  },
  
  brandSubtitle: {
    ...FONTS.label,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  
  // Form Card
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.l,
    ...SHADOWS.medium,
  },
  
  // Input Group
  inputGroup: {
    marginBottom: SPACING.ml,
  },
  
  label: {
    ...FONTS.label,
    fontWeight: '600',
    marginBottom: SPACING.s,
    color: COLORS.text,
  },
  
  input: {
    height: COMPONENTS.input.default,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.m,
    ...FONTS.body,
  },
  
  // Role Selector
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  
  roleButton: {
    flex: 1,
    minHeight: COMPONENTS.touchTarget.preferred + 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  
  roleContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.m,
    gap: SPACING.xs,
  },
  
  roleLabel: {
    ...FONTS.label,
    fontWeight: '600',
    fontSize: 15,
    color: COLORS.textMuted,
  },
  
  roleLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  
  // Login Button
  loginButton: {
    height: COMPONENTS.button.large,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.small,
  },
  
  loginButtonText: {
    ...FONTS.button,
    color: COLORS.card,
    fontWeight: '700',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  
  footerText: {
    ...FONTS.caption,
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
