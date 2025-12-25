/**
 * Factory Operations - Enterprise Design System
 * Modern | Minimal | Industrial | Professional
 */

// ========================================
// COLOR PALETTE
// ========================================

export const COLORS = {
  // Primary Brand
  primary: '#2563EB',      // Professional Blue
  primaryDark: '#1E40AF',  // Darker blue for contrast
  primaryLight: '#DBEAFE', // Light blue tint
  
  // Neutrals (High Contrast)
  dark: '#0F172A',         // Near black - primary text
  text: '#1E293B',         // Dark slate - body text
  textMuted: '#64748B',    // Muted text - labels
  textLight: '#94A3B8',    // Light text - metadata
  
  // Backgrounds
  background: '#F8FAFC',   // App background
  backgroundAlt: '#F1F5F9', // Alternate background
  card: '#FFFFFF',         // Card background
  surface: '#FFFFFF',      // Surface background
  
  //borders
  border: '#E2E8F0',       // Default border
  borderLight: '#F1F5F9',  // Light border
  borderDark: '#CBD5E1',   // Darker border
  
  // Status Colors (High Contrast - Factory Ready)
  success: '#059669',      // Emerald 600 - Machine RUN
  successBg: '#D1FAE5',    // Emerald 100 - Success background
  
  warning: '#D97706',      // Amber 600 - Machine IDLE
  warningBg: '#FEF3C7',    // Amber 100 - Warning background
  
  danger: '#DC2626',       // Red 600 - Machine OFF / Critical
  dangerBg: '#FEE2E2',     // Red 100 - Danger background
  
  info: '#0284C7',         // Sky 600 - Info
  infoBg: '#E0F2FE',       // Sky 100 - Info background
  
  // Functional States
  offline: '#FEF3C7',      // Calm yellow - offline indicator
  syncing: '#DBEAFE',      // Light blue - syncing state
  pending: '#FFEDD5',      // Orange tint - pending state
  
  // Semantic Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(15, 23, 42, 0.4)',
};

// ========================================
// SPACING SYSTEM (8pt Grid)
// ========================================

export const SPACING = {
  xxs: 2,   // Micro spacing
  xs: 4,    // Tight spacing
  s: 8,     // Default gap
  sm: 12,   // Comfortable internal
  m: 16,    // Standard padding
  ml: 20,   // Section spacing
  l: 24,    // Card padding
  xl: 32,   // Major spacing
  xxl: 40,  // Section breaks
  xxxl: 48, // Screen spacing
};

// ========================================
// TYPOGRAPHY SYSTEM
// ========================================

export const FONTS = {
  // Display (Screen Titles)
  display: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5,
    color: COLORS.dark,
  },
  
  // Title (Section Headers)
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.3,
    color: COLORS.dark,
  },
  
  // Heading (Card Titles)
  heading: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    color: COLORS.text,
  },
  
  // Body (Standard Text)
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
    color: COLORS.text,
  },
  
  // Label (Form Labels, Metadata)
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0,
    color: COLORS.textMuted,
  },
  
  // Caption (Helper Text)
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
    color: COLORS.textLight,
  },
  
  // Numeric (Tabular Numbers)
  numeric: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
    color: COLORS.text,
  },
  
  // Button Text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.3,
    textTransform: 'none',
  },
};

// ========================================
// SHADOWS & ELEVATION
// ========================================

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ========================================
// BORDER RADIUS
// ========================================

export const RADIUS = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

// ========================================
// ANIMATION TOKENS
// ========================================

export const ANIMATION = {
  // Durations (ms)
  quick: 150,
  standard: 200,
  slow: 300,
  
  // Easing curves
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
  
  // Spring configs (for Animated API)
  spring: {
    tension: 300,
    friction: 20,
  },
};

// ========================================
// COMPONENT TOKENS
// ========================================

export const COMPONENTS = {
  // Touch Targets
  touchTarget: {
    min: 44,
    preferred: 48,
  },
  
  // Button Heights
  button: {
    small: 36,
    medium: 48,
    large: 56,
  },
  
  // Input Heights
  input: {
    default: 48,
  },
  
  // Icon Sizes
  icon: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  },
  
  // Badge
  badge: {
    height: 24,
    padding: 8,
  },
};
