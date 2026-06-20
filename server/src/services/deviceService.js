import os from "node:os";
import { all, get, run } from "../db.js";

export function getServerAddresses(port) {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push({
          name,
          address: entry.address,
          attendanceUrl: `http://${entry.address}:${port}/api/attendance`,
          heartbeatUrl: `http://${entry.address}:${port}/api/device/heartbeat`
        });
      }
    }
  }

  return addresses;
}

export async function listDevices() {
  return all("SELECT * FROM devices ORDER BY lastSeen DESC");
}

export async function upsertDevice(payload, ipAddress) {
  const deviceId = String(payload.deviceId || "").trim();
  if (!deviceId) {
    const error = new Error("deviceId wajib dikirim");
    error.status = 400;
    throw error;
  }

  const name = payload.name ? String(payload.name).trim() : deviceId;
  const firmware = payload.firmware ? String(payload.firmware).trim() : null;
  const ip = payload.ipAddress ? String(payload.ipAddress).trim() : ipAddress;

  await run(
    `INSERT INTO devices (deviceId, name, ipAddress, firmware, status, lastSeen)
     VALUES (?, ?, ?, ?, 'online', datetime('now'))
     ON CONFLICT(deviceId) DO UPDATE SET
      name = excluded.name,
      ipAddress = excluded.ipAddress,
      firmware = excluded.firmware,
      status = 'online',
      lastSeen = datetime('now')`,
    [deviceId, name, ip, firmware]
  );

  return get("SELECT * FROM devices WHERE deviceId = ?", [deviceId]);
}
