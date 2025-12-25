export const getMachines = async (db) => {
  return await db.getAllAsync("SELECT * FROM machines");
};

export const getDowntimeLogs = async (db, machineId) => {
  if (machineId) {
    return await db.getAllAsync("SELECT * FROM downtime_logs WHERE machine_id = ? ORDER BY id DESC", [machineId]);
  }
  return await db.getAllAsync("SELECT * FROM downtime_logs ORDER BY id DESC");
};

// Check for active downtime to prevent overlaps
export const getActiveDowntime = async (db, machineId) => {
  return await db.getFirstAsync(
    "SELECT * FROM downtime_logs WHERE machine_id = ? AND end_time IS NULL ORDER BY id DESC LIMIT 1", 
    [machineId]
  );
};

export const logDowntime = async (db, { machineId, startTime, reasonCategory, reasonDetail, imageUri, tenantId }) => {
  // CRITICAL: Prevent overlapping downtime
  const active = await getActiveDowntime(db, machineId);
  if (active) {
    throw new Error("Machine is already down. End current downtime first.");
  }

  // Update machine status
  await db.runAsync("UPDATE machines SET status = 'OFF' WHERE id = ?", [machineId]);

  return await db.runAsync(
    "INSERT INTO downtime_logs (machine_id, start_time, reason_category, reason_detail, image_uri, synced, tenant_id) VALUES (?, ?, ?, ?, ?, 0, ?)",
    [machineId, startTime, reasonCategory, reasonDetail, imageUri || null, tenantId]
  );
};

export const endDowntime = async (db, { id, endTime }) => {
  // Update log
  await db.runAsync(
    "UPDATE downtime_logs SET end_time = ?, synced = 0 WHERE id = ?",
    [endTime, id]
  );

  // Get machine_id to restore status
  const log = await db.getFirstAsync("SELECT machine_id FROM downtime_logs WHERE id = ?", [id]);
  if (log) {
    await db.runAsync("UPDATE machines SET status = 'RUN' WHERE id = ?", [log.machine_id]);
  }
};

export const getMaintenanceTasks = async (db, machineId) => {
  if (machineId) {
    return await db.getAllAsync("SELECT * FROM maintenance_tasks WHERE machine_id = ? ORDER BY status = 'DUE' DESC", [machineId]);
  }
  return await db.getAllAsync("SELECT * FROM maintenance_tasks ORDER BY status = 'DUE' DESC");
};

export const updateTaskStatus = async (db, { id, status, notes, completedAt }) => {
  return await db.runAsync(
    "UPDATE maintenance_tasks SET status = ?, notes = ?, last_completed = ?, synced = 0 WHERE id = ?",
    [status, notes || "", completedAt || null, id]
  );
};

export const getAlerts = async (db) => {
  return await db.getAllAsync("SELECT * FROM alerts ORDER BY created_at DESC");
};

export const createAlert = async (db, { title, tenantId }) => {
  const now = new Date().toISOString();
  return await db.runAsync(
    "INSERT INTO alerts (title, status, created_at, synced, tenant_id) VALUES (?, 'CREATED', ?, 0, ?)",
    [title, now, tenantId]
  );
};

export const logAlert = async (db, { machineId, alertType, message }) => {
   // Helper for the simulated alert generator
   const now = new Date().toISOString();
   return await db.runAsync(
     "INSERT INTO alerts (title, status, created_at, synced, tenant_id) VALUES (?, 'CREATED', ?, 0, ?)",
     [`[${alertType}] ${message}`, now, 'demo-tenant']
   );
};

export const updateAlertStatus = async (db, { id, status, ackBy }) => {
  const now = new Date().toISOString();
  
  // Enforce lifecycle: CREATED -> ACKNOWLEDGED -> CLEARED
  const current = await db.getFirstAsync("SELECT status FROM alerts WHERE id = ?", [id]);
  if (!current) throw new Error("Alert not found");

  if (status === 'ACKNOWLEDGED') {
    if (current.status !== 'CREATED') throw new Error("Can only acknowledge CREATED alerts");
    return await db.runAsync(
      "UPDATE alerts SET status = ?, ack_by = ?, ack_at = ?, synced = 0 WHERE id = ?",
      [status, ackBy || 'Supervisor', now, id]
    );
  } else if (status === 'CLEARED') {
    if (current.status !== 'ACKNOWLEDGED') throw new Error("Can only clear ACKNOWLEDGED alerts");
    return await db.runAsync(
      "UPDATE alerts SET status = ?, cleared_at = ?, synced = 0 WHERE id = ?",
      [status, now, id]
    );
  }
};

export const getUnsyncedData = async (db) => {
  const downtime = await db.getAllAsync("SELECT * FROM downtime_logs WHERE synced = 0");
  const maintenance = await db.getAllAsync("SELECT * FROM maintenance_tasks WHERE synced = 0");
  const alerts = await db.getAllAsync("SELECT * FROM alerts WHERE synced = 0");
  return { downtime, maintenance, alerts };
};

export const markSynced = async (db, table, id) => {
  return await db.runAsync(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [id]);
};

// Report Aggregations
export const getMachineStats = async (db, machineId) => {
  // Aggregate directly in SQL
  const logs = await db.getAllAsync(
    "SELECT start_time, end_time, reason_category FROM downtime_logs WHERE machine_id = ? AND end_time IS NOT NULL",
    [machineId]
  );
  
  let totalDuration = 0;
  const reasons = {};
  
  logs.forEach(log => {
    const start = new Date(log.start_time).getTime();
    const end = new Date(log.end_time).getTime();
    totalDuration += (end - start) / 60000; // minutes
    reasons[log.reason_category] = (reasons[log.reason_category] || 0) + 1;
  });

  const topReason = Object.entries(reasons).sort((a,b) => b[1] - a[1])[0];

  return {
    totalDowntimeEvents: logs.length,
    totalDuration: Math.round(totalDuration),
    topReason: topReason ? topReason[0] : 'None'
  };
};
