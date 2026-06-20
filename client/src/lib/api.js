export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  const payload = await response.json();

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload.data;
}

async function send(path, method, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload.data;
}

export function login(username, password) {
  return send("/api/auth/login", "POST", { username, password });
}

export function getAttendance(limit = 30) {
  return request(`/api/attendance?limit=${limit}&sort=desc`);
}

export function searchAttendance({ limit = 100, search = "", status = "" } = {}) {
  const params = new URLSearchParams({ limit: String(limit), sort: "desc" });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return request(`/api/attendance?${params.toString()}`);
}

export function createAttendance(payload) {
  return send("/api/attendance", "POST", payload);
}

export function sendDeviceHeartbeat(payload) {
  return send("/api/device/heartbeat", "POST", payload);
}

export function getNetworkInfo() {
  return request("/api/network");
}

export function getDevices() {
  return request("/api/devices");
}

export function getDiagnostics() {
  return request("/api/diagnostics");
}

export function updateAttendance(id, payload) {
  return send(`/api/attendance/${id}`, "PUT", payload);
}

export function deleteAttendance(id) {
  return send(`/api/attendance/${id}`, "DELETE", {});
}

export function getSummary() {
  return request("/api/summary");
}

export function getLive() {
  return request("/api/live");
}
