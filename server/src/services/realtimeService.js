import { buildSummary, getLiveAttendance } from "./attendanceService.js";

export async function emitDashboardUpdate(io, eventName, record = null) {
  const [summary, live] = await Promise.all([
    buildSummary(),
    getLiveAttendance()
  ]);

  io.emit(eventName, record);
  io.emit("attendance:changed", { record, live: live || null, summary });
  io.emit("summary:update", summary);
}
