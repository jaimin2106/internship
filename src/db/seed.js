const INITIAL_MACHINES = [
  { name: "Cutter 1", status: "RUN", tenant_id: "demo-tenant" },
  { name: "Roller A", status: "IDLE", tenant_id: "demo-tenant" },
  { name: "Packing West", status: "OFF", tenant_id: "demo-tenant" }
];

const INITIAL_TASKS = [
  { description: "Check hydraulic fluid", status: "OVERDUE", due_date: new Date().toISOString() },
  { description: "Inspect safety guards", status: "DUE", due_date: new Date().toISOString() }
];

export const seedDatabase = async (db) => {
  try {
    // Check if machines already exist
    const result = await db.getAllAsync("SELECT COUNT(*) as count FROM machines");
    const count = result[0].count;

    if (count === 0) {
      console.log("Seeding database...");
      
      // Seed Machines
      for (const machine of INITIAL_MACHINES) {
        const res = await db.runAsync(
          "INSERT INTO machines (name, status, tenant_id) VALUES (?, ?, ?)",
          [machine.name, machine.status, machine.tenant_id]
        );
        
        // Seed some tasks for each machine
        for (const task of INITIAL_TASKS) {
          await db.runAsync(
            "INSERT INTO maintenance_tasks (machine_id, description, status, due_date, tenant_id) VALUES (?, ?, ?, ?, ?)",
            [res.lastInsertRowId, task.description, task.status, task.due_date, "demo-tenant"]
          );
        }
      }
      console.log("Database seeded successfully");
    } else {
      console.log("Database already seeded");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
