# Factory Operations Mobile App

> **Offline-first field operations app** for capturing downtime, maintenance, and alerts on the factory floor.

Built with React Native (Expo) | SQLite | Zustand

---

## 🎯 Features

### For Operators
- **Downtime Tracking**: Start/End downtime with 2-level reason selection and photo attachment
- **Maintenance Checklists**: Due/Overdue/Done tasks with notes
- **Offline First**: Works without internet, auto-syncs when connected

### For Supervisors
- **Alert Management**: Acknowledge and clear system alerts
- **Reports**: View machine performance summaries

### Core Capabilities
- ✅ 100% offline-capable
- ✅ Auto-sync on reconnection
- ✅ Photo compression (≤ 200 KB)
- ✅ Pending sync badge
- ✅ Role-based access (Operator/Supervisor)

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Scan QR code with Expo Go app (iOS/Android)
# Or press 'a' for Android emulator, 'i' for iOS simulator
```

### Production Build

#### Option 1: EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build -p android --profile production

# Download APK from Expo dashboard
```

#### Option 2: Classic Expo Build
```bash
# Build APK
npx expo build:android

# Follow prompts and download APK
```

---

## 📦 Offline & Sync Design

### Architecture
- **Single Source of Truth**: SQLite database stores all data locally
- **Immediate Persistence**: Every user action writes to DB instantly
- **Queue Management**: Unsynced items flagged with `synced = 0`
- **Auto-Sync**: NetInfo triggers sync on network reconnection
- **Concurrency Control**: useRef lock prevents simultaneous sync operations

### Data Flow
```
User Action → SQLite (synced=0) → Show in UI
                ↓
         Network Available? 
                ↓
         Sync to Server → Mark synced=1
```

### Sync Strategy
1. **Queueing**: All write operations set `synced = 0` flag
2. **Detection**: `@react-native-community/netinfo` monitors connectivity
3. **Auto-Trigger**: Sync fires automatically on reconnection
4. **Idempotency**: Records have unique IDs + timestamps for server deduplication
5. **Conflict Resolution**: Last-write-wins (timestamp-based)

### Offline Testing
```bash
# 1. Start app (ensure connected)
# 2. Enable airplane mode on device
# 3. Log ≥2 downtime events + 1 maintenance update
# 4. Kill and restart app (data persists)
# 5. Disable airplane mode
# 6. Watch auto-sync (pending badge clears)
```

---

## 🏗️ State Management

### Choice: **Zustand with AsyncStorage**

**Why Zustand?**
- ✅ **Minimal boilerplate** - No actions/reducers ceremony
- ✅ **Built-in persistence** - AsyncStorage middleware included
- ✅ **Small bundle** - ~1KB vs Redux's ~8KB
- ✅ **Simple API** - `create()` + `persist()` = done
- ✅ **Perfect scale** - Ideal for apps with 2-5 stores

### Stores
```javascript
// authStore.js - Login state
{ email, role, token, tenantId }

// syncStore.js - Sync state  
{ isOnline, pendingCount, isSyncing }
```

### Why Not Redux?
- Too much boilerplate for this scope
- Unnecessary complexity for 2 stores
- Larger bundle size

### Why Not Context API?
- No persistence out of the box
- Performance issues with frequent updates
- More code for the same result

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native (Expo) | Cross-platform mobile |
| **Navigation** | React Navigation | Stack-based routing |
| **Database** | expo-sqlite | Local SQLite storage |
| **State** | Zustand + AsyncStorage | Global state + persistence |
| **Sync** | @react-native-community/netinfo | Network detection |
| **Icons** | @expo/vector-icons | Professional UI icons |
| **Images** | expo-image-picker + manipulator | Photo capture & compression |

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── MachineCard.js   # Machine list item
│   └── SyncBadge.js     # Pending sync indicator
├── screens/             # Main app screens
│   ├── LoginScreen.js   # Mock auth + role selection
│   ├── HomeScreen.js    # Machine list
│   ├── MachineDetailScreen.js  # Tabbed module view
│   └── modules/         # Feature modules
│       ├── DowntimeView.js     # Operator: Start/End downtime
│       ├── MaintenanceView.js  # Operator: Checklists
│       ├── AlertsView.js       # Supervisor: Ack/Clear alerts
│       └── ReportsView.js      # Machine summaries
├── db/
│   ├── db.js            # SQLite initialization
│   └── helpers.js       # CRUD operations
├── services/
│   └── SyncService.js   # Auto-sync logic
├── store/
│   ├── authStore.js     # Login state (Zustand)
│   └── syncStore.js     # Sync state (Zustand)
├── utils/
│   ├── theme.js         # Design tokens (colors, fonts, spacing)
│   └── constants.js     # Reason tree, seeds
└── navigation/
    └── AppNavigator.js  # Stack navigator
```

---

## 🎨 Design System

### Typography
- **Display** (28px, 800): Screen titles
- **Title** (22px, 700): Section headers
- **Heading** (18px, 600): Card titles
- **Body** (16px, 400): Standard text
- **Label** (14px, 500): Form labels
- **Caption** (12px, 400): Helper text

### Colors
```javascript
Primary: #2563EB   (Professional Blue)
Success: #059669   (Emerald - RUN state)
Warning: #D97706   (Amber - IDLE state)
Danger:  #DC2626   (Red - OFF state / Critical)
```

### Spacing (8pt Grid)
```javascript
xs: 4    sm: 12   m: 16   l: 24   xl: 32   xxl: 40
```

### Touch Targets
- Minimum: 44px (iOS standard)
- Preferred: 48px (most buttons)
- Critical actions: 56px (Start/End Downtime)

---

## 🚀 What to Ship Next

### Priority 1: Backend Integration
- Real sync API endpoints (`POST /sync/downtime`, etc.)
- JWT refresh token flow
- Server-side conflict resolution
- WebSocket for real-time alerts

### Priority 2: Enhanced Reporting
- Date range selector
- OEE calculation (Availability × Performance × Quality)
- Export to CSV/PDF
- Trend charts (bar/line)

### Priority 3: UX Polish
- Push notifications for critical alerts
- Photo watermark (machine_id + timestamp on image)
- Dark mode toggle
- Multi-language support (i18n)
- Barcode scanning for quick machine selection

---

## 📊 Database Schema

### Tables

**machines**
```sql
id, name, type, status (RUN/IDLE/OFF), tenant_id
```

**downtime_logs**
```sql
id, machine_id, start_time, end_time, reason_category, 
reason_detail, image_uri, synced (0/1), tenant_id
```

**maintenance_tasks**
```sql
id, machine_id, description, due_date, status (DUE/OVERDUE/DONE),
notes, last_completed, synced (0/1), tenant_id
```

**alerts**
```sql
id, machine_id, title, status (CREATED/ACKNOWLEDGED/CLEARED),
created_at, ackBy, ackAt, clearedAt, synced (0/1), tenant_id
```

---

## 🔒 Security

- **tenant_id**: Carried through all data operations (currently 'demo-tenant')
- **Mock JWT**: Fake token stored in AsyncStorage
- **Ready for**: Multi-tenant expansion, real auth integration

---

## 🧪 Testing Offline Flow

1. **Setup**: Start app, login as Operator
2. **Offline Mode**: Enable airplane mode
3. **Actions**:
   - Navigate to Machine → Downtime
   - Start downtime (select Power → Grid)
   - End downtime
   - Start another downtime (Mechanical → Bearing)
   - Navigate to Maintenance
   - Mark a task as Done with notes
4. **Verify**: Check sync badge shows "3 pending"
5. **Kill App**: Force close the app completely
6. **Restart**: Reopen app (still offline)
7. **Verify**: Data persists, badge still shows pending
8. **Reconnect**: Disable airplane mode
9. **Auto-Sync**: Watch badge clear automatically
10. **Success**: All data synced, badge disappears

---

## 📱 Build Output

### APK Details
- **Target**: Android 6.0+ (API 23)
- **Size**: ~25-30 MB
- **Format**: Universal APK (works on all Android devices)

### EAS Build
```bash
# Build APK
eas build -p android --profile production

# Get shareable link from Expo dashboard
# Download APK to install on devices
```

---

## 👨‍💻 Development

### Code Style
- Functional components with hooks
- ESLint + Prettier (standard config)
- Clear naming conventions
- Comprehensive comments

### Git Workflow
```bash
git clone <repo-url>
cd internship
npm install
npm start
```

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built for the Limelight Factory Operations Challenge

**Developed by Jaimin** | December 2025
