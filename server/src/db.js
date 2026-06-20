import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultDbPath = path.resolve(serverRoot, "data", "attendance.sqlite");
const dbPath = path.resolve(process.env.DATABASE_PATH || defaultDbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);

export async function run(sql, params = []) {
  const result = db.prepare(sql).run(...params);
  return {
    id: Number(result.lastInsertRowid || 0),
    changes: result.changes
  };
}

export async function get(sql, params = []) {
  return db.prepare(sql).get(...params);
}

export async function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      time TEXT NOT NULL,
      date TEXT NOT NULL,
      deviceId TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await run("CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)");
  await run("CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(createdAt)");
  await run("CREATE INDEX IF NOT EXISTS idx_attendance_uid ON attendance(uid)");

  await run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT NOT NULL UNIQUE,
      name TEXT,
      ipAddress TEXT,
      firmware TEXT,
      status TEXT NOT NULL DEFAULT 'online',
      lastSeen TEXT NOT NULL DEFAULT (datetime('now')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await run("CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(deviceId)");
  await run("CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(lastSeen)");
}
