import express from "express";
import {
  buildSummary,
  clampLimit,
  createAttendance,
  deleteAttendance,
  getLiveAttendance,
  listAttendance,
  updateAttendance,
  validateAttendancePayload
} from "./services/attendanceService.js";
import { getServerAddresses, listDevices, upsertDevice } from "./services/deviceService.js";
import { addDiagnosticEvent, listDiagnosticEvents } from "./services/diagnosticService.js";
import { emitDashboardUpdate } from "./services/realtimeService.js";

const router = express.Router();

export function createRoutes(io) {
  const port = Number.parseInt(process.env.PORT || "3001", 10);

  router.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "rfid-attendance-server",
      message: "Backend aktif. Buka dashboard di http://localhost:5173",
      endpoints: {
        health: "/health",
        attendance: "/api/attendance",
        heartbeat: "/api/device/heartbeat",
        network: "/api/network"
      }
    });
  });

  router.get("/health", (_req, res) => {
    res.json({ ok: true, service: "rfid-attendance-server", timestamp: new Date().toISOString() });
  });

  router.get("/api/time", (_req, res) => {
    const now = new Date();
    res.json({
      ok: true,
      epoch: Math.floor(now.getTime() / 1000),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    });
  });

  router.get("/api/network", (_req, res) => {
    res.json({
      ok: true,
      data: {
        port,
        addresses: getServerAddresses(port),
        localhost: {
          attendanceUrl: `http://localhost:${port}/api/attendance`,
          heartbeatUrl: `http://localhost:${port}/api/device/heartbeat`
        }
      }
    });
  });

  router.get("/api/diagnostics", (_req, res) => {
    res.json({ ok: true, data: listDiagnosticEvents() });
  });

  router.get("/api/devices", async (_req, res, next) => {
    try {
      res.json({ ok: true, data: await listDevices() });
    } catch (error) {
      next(error);
    }
  });

  router.post("/api/device/heartbeat", async (req, res, next) => {
    try {
      const ipAddress = req.ip?.replace("::ffff:", "");
      const device = await upsertDevice(req.body, ipAddress);
      const event = addDiagnosticEvent({
        type: "heartbeat",
        status: "success",
        sourceIp: ipAddress,
        deviceId: device.deviceId,
        message: "Heartbeat perangkat diterima"
      });
      io.emit("diagnostic:event", event);
      io.emit("device:heartbeat", device);
      res.json({ ok: true, data: device });
    } catch (error) {
      const event = addDiagnosticEvent({
        type: "heartbeat",
        status: "error",
        sourceIp: req.ip?.replace("::ffff:", ""),
        message: error.message
      });
      io.emit("diagnostic:event", event);
      next(error);
    }
  });

  router.post("/api/auth/login", (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ ok: false, error: "Username atau password salah" });
    }

    return res.json({
      ok: true,
      data: {
        token: Buffer.from(`${username}:${Date.now()}`).toString("base64"),
        user: { name: "Administrator", username }
      }
    });
  });

  router.post("/api/attendance", async (req, res, next) => {
    try {
      const payload = validateAttendancePayload(req.body);
      const record = await createAttendance(payload);
      const summary = await buildSummary();
      const event = addDiagnosticEvent({
        type: "attendance",
        status: "success",
        sourceIp: req.ip?.replace("::ffff:", ""),
        deviceId: record.deviceId,
        uid: record.uid,
        message: `Presensi diterima untuk ${record.name}`
      });

      io.emit("diagnostic:event", event);
      io.emit("attendance:new", record);
      io.emit("attendance:changed", { record, live: record, summary });
      io.emit("summary:update", summary);

      res.status(201).json({ ok: true, data: record });
    } catch (error) {
      const event = addDiagnosticEvent({
        type: "attendance",
        status: "error",
        sourceIp: req.ip?.replace("::ffff:", ""),
        deviceId: req.body?.deviceId,
        uid: req.body?.uid,
        message: error.message
      });
      io.emit("diagnostic:event", event);
      next(error);
    }
  });

  router.get("/api/attendance", async (req, res, next) => {
    try {
      const limit = clampLimit(req.query.limit);
      const sort = String(req.query.sort || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
      const search = String(req.query.search || "").trim();
      const status = String(req.query.status || "").trim().toLowerCase();
      const rows = await listAttendance({ limit, sort, search, status });
      res.json({ ok: true, data: rows });
    } catch (error) {
      next(error);
    }
  });

  router.get("/api/summary", async (_req, res, next) => {
    try {
      res.json({ ok: true, data: await buildSummary() });
    } catch (error) {
      next(error);
    }
  });

  router.get("/api/live", async (_req, res, next) => {
    try {
      const row = await getLiveAttendance();
      res.json({ ok: true, data: row || null });
    } catch (error) {
      next(error);
    }
  });

  router.put("/api/attendance/:id", async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ ok: false, error: "ID tidak valid" });
      }

      const payload = validateAttendancePayload(req.body);
      const record = await updateAttendance(id, payload);

      if (!record) {
        return res.status(404).json({ ok: false, error: "Data presensi tidak ditemukan" });
      }

      await emitDashboardUpdate(io, "attendance:updated", record);
      return res.json({ ok: true, data: record });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/api/attendance/:id", async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ ok: false, error: "ID tidak valid" });
      }

      const existing = await deleteAttendance(id);
      if (!existing) {
        return res.status(404).json({ ok: false, error: "Data presensi tidak ditemukan" });
      }

      await emitDashboardUpdate(io, "attendance:deleted", existing);
      return res.json({ ok: true, data: existing });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
