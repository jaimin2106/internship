# FactoryOps - Mobile Operator Assistant

FactoryOps is an offline-first mobile application designed for factory floor operators to log downtime, manage maintenance tasks, and acknowledge alerts. Built with Expo, SQLite, and Zustand.

## 🚀 How to Run

### Development
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Expo Server**:
    ```bash
    npx expo start
    ```
3.  **Run on Device/Simulator**:
    -   Press `a` for Android Emulator.
    -   Press `i` for iOS Simulator.
    -   Press `w` for Web.
    -   Scan the QR code with Expo Go on your physical device.

### Production (Build)
To generate a production-ready APK/AAB:
1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```
2.  **Build**:
    ```bash
    eas build --platform android --profile production
    ```

---

## 📱 Offline & Sync Design

The app follows a **"Store & Forward"** architecture to ensure 100% uptime on the factory floor, regardless of connectivity.

-   **Local-First Database**: All data (Downtime Logs, Tasks, Alerts) is written synchronously to a local **SQLite** database (`expo-sqlite`). This ensures zero latency for the operator.
-   **Sync Status Tracking**: Every table includes a `synced` column (0 or 1). New records are inserted with `synced = 0`.
-   **Auto-Sync Engine (SyncService)**:
    -   Listens to network connectivity changes using `@react-native-community/netinfo`.
    -   **Trigger**: When connectivity is restored (or every 5 minutes in background), the engine fetches all records where `synced = 0` and pushes them to the backend.
    -   **Feedback**: Upon successful 200 OK response, the local records are updated to `synced = 1`.
-   **User Feedback**: Operators see a "Pending Sync" badge and count in the header, letting them know if data is waiting to be uploaded.

---

## 🧠 State Management

We chose **Zustand** for global state management for its simplicity, performance, and minimal boilerplate.

1.  **Auth Store (`authStore.js`)**:
    -   Manages User Session, Role, and TenantID.
    -   **Persistence**: Uses `persist` middleware with `AsyncStorage` to keep users logged in across app restarts.
2.  **Sync Store (`syncStore.js`)**:
    -   Tracks ephemeral UI state like `isOnline`, `isSyncing`, and `pendingCount`.
    -   Not persisted, ensuring the UI always reflects the current runtime network state.
3.  **Local State**:
    -   Screens use standard React `useState` for form inputs and fetching data from SQLite, keeping the global store clean of ephemeral view data.

---

## 🔮 What I'd Ship Next

1.  **Real-Time MQTT Integration**: Replace the mock polling with real-time MQTT subscription for instant machine alerts.
2.  **Background Sync Task**: Implement `expo-task-manager` to guarantee data upload even when the app is backgrounded or closed.
3.  **Image Compression**: Optimize photo uploads by compressing images before storing them in the SQLite blob/base64 or file system.
