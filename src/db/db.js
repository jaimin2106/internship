import * as SQLite from "expo-sqlite";

let db = null;

export const getDB = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("factory.db");
  return db;
};

export const initDB = async () => {
  const database = await getDB();
  
  // Enable foreign keys
  await database.execAsync("PRAGMA foreign_keys = ON;");

  // Migration: Add last_completed to maintenance_tasks if missing
  try {
    const tableInfo = await database.getAllAsync("PRAGMA table_info(maintenance_tasks)");
    const hasLastCompleted = tableInfo.some(col => col.name === 'last_completed');
    if (!hasLastCompleted) {
      await database.execAsync("ALTER TABLE maintenance_tasks ADD COLUMN last_completed TEXT");
      console.log("Migrated: Added last_completed to maintenance_tasks");
    }
  } catch (e) {
    console.log("Migration check failed (safe to ignore if table doesn't exist yet)", e);
  }
  
  return database;
};
