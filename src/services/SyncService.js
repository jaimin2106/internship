import React, { useEffect, useRef } from 'react';
import { Alert, ToastAndroid, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getDB } from '../db/db';
import { getUnsyncedData, markSynced } from '../db/helpers';
import { useSyncStore } from '../store/syncStore';

export const SyncManager = () => {
  const setOnline = useSyncStore(state => state.setOnline);
  const setPendingCount = useSyncStore(state => state.setPendingCount);
  const setSyncing = useSyncStore(state => state.setSyncing);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    updatePendingCount();

    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setOnline(online);
      
      if (online) {
        performSync();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const updatePendingCount = async () => {
    try {
      const db = await getDB();
      const { downtime, maintenance, alerts } = await getUnsyncedData(db);
      const total = downtime.length + maintenance.length + alerts.length;
      setPendingCount(total);
    } catch (e) {
      console.error("Failed to update pending count", e);
    }
  };

  const performSync = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncing(true);

    try {
      const db = await getDB();
      const { downtime, maintenance, alerts } = await getUnsyncedData(db);
      
      if (downtime.length === 0 && maintenance.length === 0 && alerts.length === 0) {
        return;
      }

      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      for (const item of downtime) await markSynced(db, 'downtime_logs', item.id);
      for (const item of maintenance) await markSynced(db, 'maintenance_tasks', item.id);
      for (const item of alerts) await markSynced(db, 'alerts', item.id);

      await updatePendingCount();
       
      if (Platform.OS === 'android') {
        ToastAndroid.show('Synced successfully', ToastAndroid.SHORT);
      } else {
        // Debounce alert or just log on iOS to avoid interruption
        console.log('Synced successfully'); 
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      isSyncingRef.current = false;
      setSyncing(false);
    }
  };

  return null;
};
