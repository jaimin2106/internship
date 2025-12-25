import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { initDB, seedDatabase } from './src/db/db'; // Wait, standard exports? seed is in seed.js
import { initDB as initializeDB } from './src/db/db';
import { seedDatabase as seed } from './src/db/seed';

import { useAuthStore } from './src/store/authStore';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MachineDetailScreen from './src/screens/MachineDetailScreen';

const Stack = createNativeStackNavigator();

import { SyncManager } from './src/services/SyncService';

// ... other imports

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const setup = async () => {
      try {
        const db = await initializeDB();
        const { createTables } = require('./src/db/schema');
        await createTables(db);
        await seed(db);
        setDbReady(true);
      } catch (e) {
        console.error("DB Setup Failed:", e);
      }
    };
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <SyncManager />
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Factory Ops' }}
            />
            <Stack.Screen 
              name="MachineDetail" 
              component={MachineDetailScreen} 
              options={{ title: 'Machine Details' }}
            />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
