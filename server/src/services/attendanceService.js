import { all, get, run } from "../db.js";
import { lastSevenDates, todayIsoDate } from "../utils/date.js";

export function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (["accepted", "accept", "valid", "hadir", "masuk", "diterima"].includes(status)) return "diterima";
  if (["rejected", "reject", "invalid", "gagal", "ditolak"].includes(status)) return "ditolak";
  return status || "diterima";
}

export function validateAttendancePayload(body) {
  const required = ["uid", "name", "status", "time", "date"];
  const missing = required.filter((field) => !String(body[field] || "").trim());
  if (missing.length > 0) {
    const error = new Error(`Missing required field(s): ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }

  return {
    uid: String(body.uid).trim(),
    name: String(body.name).trim(),
    status: normalizeStatus(body.status),
    time: String(body.time).trim(),
    date: String(body.date).trim(),
    deviceId: body.deviceId ? String(body.deviceId).trim() : null
  };
}

export function clampLimit(limit) {
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed)) return 50;
  return Math.min(Math.max(parsed, 1), 500);
}

export async function createAttendance(payload) {
  const result = await run(
    "INSERT INTO attendance (uid, name, status, time, date, deviceId) VALUES (?, ?, ?, ?, ?, ?)",
    [payload.uid, payload.name, payload.status, payload.time, payload.date, payload.deviceId]
  );
  return get("SELECT * FROM attendance WHERE id = ?", [result.id]);
}

export async function listAttendance({ limit, sort, search, status }) {
  const filters = [];
  const params = [];

  if (search) {
    filters.push("(name LIKE ? OR uid LIKE ? OR deviceId LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (["diterima", "ditolak"].includes(status)) {
    filters.push("lower(status) = ?");
    params.push(status);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  return all(
    `SELECT * FROM attendance ${where} ORDER BY date ${sort}, time ${sort}, id ${sort} LIMIT ?`,
    [...params, limit]
  );
}

export async function updateAttendance(id, payload) {
  const result = await run(
    `UPDATE attendance
     SET uid = ?, name = ?, status = ?, time = ?, date = ?, deviceId = ?
     WHERE id = ?`,
    [payload.uid, payload.name, payload.status, payload.time, payload.date, payload.deviceId, id]
  );

  if (result.changes === 0) return null;
  return get("SELECT * FROM attendance WHERE id = ?", [id]);
}

export async function deleteAttendance(id) {
  const existing = await get("SELECT * FROM attendance WHERE id = ?", [id]);
  if (!existing) return null;
  await run("DELETE FROM attendance WHERE id = ?", [id]);
  return existing;
}

export async function getLiveAttendance() {
  return get("SELECT * FROM attendance ORDER BY date DESC, time DESC, id DESC LIMIT 1");
}

export async function buildSummary() {
  const today = todayIsoDate();
  const [todayRow, latestDateRow, userRow] = await Promise.all([
    get("SELECT COUNT(*) AS total FROM attendance WHERE date = ?", [today]),
    get("SELECT date FROM attendance ORDER BY date DESC, time DESC, id DESC LIMIT 1"),
    get("SELECT COUNT(DISTINCT uid) AS total FROM attendance", [])
  ]);

  const activeDate = todayRow.total > 0 ? today : latestDateRow?.date || today;
  const activeDateAnchor = new Date(`${activeDate}T00:00:00`);

  const [activeTotalRow, acceptedRow, rejectedRow, chartRows] = await Promise.all([
    get("SELECT COUNT(*) AS total FROM attendance WHERE date = ?", [activeDate]),
    get("SELECT COUNT(*) AS total FROM attendance WHERE date = ? AND lower(status) = 'diterima'", [activeDate]),
    get("SELECT COUNT(*) AS total FROM attendance WHERE date = ? AND lower(status) = 'ditolak'", [activeDate]),
    all(
      `SELECT date,
        COUNT(*) AS total,
        SUM(CASE WHEN lower(status) = 'diterima' THEN 1 ELSE 0 END) AS accepted,
        SUM(CASE WHEN lower(status) = 'ditolak' THEN 1 ELSE 0 END) AS rejected
       FROM attendance
       WHERE date >= date(?, '-6 day') AND date <= date(?)
       GROUP BY date
       ORDER BY date ASC`,
      [activeDate, activeDate]
    )
  ]);

  const byDate = new Map(chartRows.map((row) => [row.date, row]));
  const daily = lastSevenDates(activeDateAnchor).map((date) => {
    const row = byDate.get(date);
    return {
      date,
      label: date.slice(5),
      total: row?.total || 0,
      accepted: row?.accepted || 0,
      rejected: row?.rejected || 0
    };
  });

  return {
    serverDate: today,
    activeDate,
    isUsingLatestDate: activeDate !== today,
    totalToday: activeTotalRow.total || 0,
    acceptedToday: acceptedRow.total || 0,
    rejectedToday: rejectedRow.total || 0,
    uniqueUsers: userRow.total || 0,
    daily
  };
}
