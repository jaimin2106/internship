export const createTables = async (db) => {
  try {
    const queries = [
      `CREATE TABLE IF NOT EXISTS machines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'OFF',
        tenant_id TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS downtime_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id INTEGER NOT NULL,
        start_time TEXT,
        end_time TEXT,
        reason_category TEXT,
        reason_detail TEXT,
        image_uri TEXT,
        synced INTEGER DEFAULT 0,
        tenant_id TEXT NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines (id)
      );`,
      `CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'DUE',
        notes TEXT,
        due_date TEXT,
        synced INTEGER DEFAULT 0,
        tenant_id TEXT NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines (id)
      );`,
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'CREATED',
        created_at TEXT NOT NULL,
        ack_by TEXT,
        ack_at TEXT,
        cleared_at TEXT,
        synced INTEGER DEFAULT 0,
        tenant_id TEXT NOT NULL
      );`
    ];

    for (const query of queries) {
      await db.execAsync(query);
    }
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};
