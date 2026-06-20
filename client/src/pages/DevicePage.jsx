import { useEffect, useMemo, useState } from "react";
import { Cable, Check, Cpu, Radio, RefreshCw, Send, WifiOff } from "lucide-react";
import { Button, EmptyState, Field, SectionShell } from "../components/ui";
import { inputClass } from "../constants/form";
import {
  API_URL,
  createAttendance,
  getDevices,
  getDiagnostics,
  getNetworkInfo,
  sendDeviceHeartbeat
} from "../lib/api";

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 8);
}

export function DevicePage({ lastDevice, refreshDashboard }) {
  const [network, setNetwork] = useState(null);
  const [devices, setDevices] = useState([]);
  const [testForm, setTestForm] = useState({
    uid: "TEST-CARD-001",
    name: "Tes Kartu RFID",
    status: "diterima",
    deviceId: "ESP32-RFID-01"
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState([]);

  const loadConnectionInfo = async () => {
    const [networkData, deviceData, diagnosticData] = await Promise.all([
      getNetworkInfo(),
      getDevices(),
      getDiagnostics()
    ]);
    setNetwork(networkData);
    setDevices(deviceData);
    setDiagnostics(diagnosticData);
  };

  useEffect(() => {
    loadConnectionInfo().catch((error) => setMessage(error.message));
    const timer = window.setInterval(() => {
      getDiagnostics().then(setDiagnostics).catch(() => {});
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!lastDevice) return;
    setDevices((current) => [lastDevice, ...current.filter((device) => device.deviceId !== lastDevice.deviceId)]);
  }, [lastDevice]);

  const primaryEndpoint = useMemo(() => {
    return network?.addresses?.[0]?.attendanceUrl || `${API_URL}/api/attendance`;
  }, [network]);

  const heartbeatEndpoint = useMemo(() => {
    return network?.addresses?.[0]?.heartbeatUrl || `${API_URL}/api/device/heartbeat`;
  }, [network]);

  const sendTestAttendance = async () => {
    setLoading(true);
    setMessage("");
    try {
      await createAttendance({
        ...testForm,
        date: nowDate(),
        time: nowTime()
      });
      await sendDeviceHeartbeat({
        deviceId: testForm.deviceId,
        name: "ESP32 RFID Reader",
        firmware: "web-test"
      });
      await loadConnectionInfo();
      refreshDashboard();
      setMessage("Tes absen berhasil. Data langsung masuk ke database dan dashboard.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendHeartbeat = async () => {
    setLoading(true);
    setMessage("");
    try {
      await sendDeviceHeartbeat({
        deviceId: testForm.deviceId,
        name: "ESP32 RFID Reader",
        firmware: "web-test"
      });
      await loadConnectionInfo();
      setMessage("Heartbeat berhasil. Perangkat muncul sebagai online.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const payload = `{
  "uid": "04AABBCCDD",
  "name": "Nama Pengguna",
  "status": "diterima",
  "time": "08:12:05",
  "date": "2026-05-19",
  "deviceId": "ESP32-RFID-01"
}`;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionShell title="Endpoint ESP32" icon={Cable}>
        <div className="space-y-4">
          <div className="rounded-2xl border-3 border-ink bg-limePop p-4">
            <p className="text-sm font-black uppercase">POST URL untuk ESP32</p>
            <p className="break-all font-mono text-lg font-black">{primaryEndpoint}</p>
          </div>
          <div className="rounded-2xl border-3 border-ink bg-yellowPop p-4">
            <p className="text-sm font-black uppercase">Heartbeat perangkat</p>
            <p className="break-all font-mono text-sm font-black">{heartbeatEndpoint}</p>
          </div>
          <Button onClick={loadConnectionInfo} className="bg-white">
            <RefreshCw size={18} strokeWidth={3} />
            Refresh IP Server
          </Button>
        </div>
      </SectionShell>

      <SectionShell title="Tes Koneksi Absen" icon={Send}>
        {message && <div className="mb-4 rounded-xl border-3 border-ink bg-skyPop px-3 py-2 font-black">{message}</div>}
        <div className="grid gap-3">
          <Field label="UID Kartu"><input className={inputClass()} value={testForm.uid} onChange={(event) => setTestForm({ ...testForm, uid: event.target.value })} /></Field>
          <Field label="Nama"><input className={inputClass()} value={testForm.name} onChange={(event) => setTestForm({ ...testForm, name: event.target.value })} /></Field>
          <Field label="Status">
            <select className={inputClass()} value={testForm.status} onChange={(event) => setTestForm({ ...testForm, status: event.target.value })}>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </Field>
          <Field label="Device ID"><input className={inputClass()} value={testForm.deviceId} onChange={(event) => setTestForm({ ...testForm, deviceId: event.target.value })} /></Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Button onClick={sendTestAttendance} disabled={loading}>
              <Check size={18} strokeWidth={3} />
              Tes Tap Kartu
            </Button>
            <Button onClick={sendHeartbeat} disabled={loading} className="bg-yellowPop">
              <Cpu size={18} strokeWidth={3} />
              Tes Device Online
            </Button>
          </div>
        </div>
      </SectionShell>

      <SectionShell title="Perangkat Terhubung" icon={Cpu}>
        {devices.length === 0 ? (
          <EmptyState text="Belum ada heartbeat dari ESP32. Klik Tes Device Online atau jalankan kode ESP32." />
        ) : (
          <div className="grid gap-3">
            {devices.map((device) => (
              <div key={device.deviceId} className="rounded-2xl border-3 border-ink bg-paper p-4 shadow-brutalSm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-black">{device.name || device.deviceId}</p>
                    <p className="font-mono text-sm font-bold">{device.deviceId}</p>
                  </div>
                  <span className="rounded-full border-2 border-ink bg-limePop px-3 py-1 text-xs font-black uppercase">{device.status}</span>
                </div>
                <p className="mt-3 text-sm font-extrabold">IP: {device.ipAddress || "-"}</p>
                <p className="text-sm font-extrabold">Firmware: {device.firmware || "-"}</p>
                <p className="text-sm font-extrabold">Last seen: {device.lastSeen}</p>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      <SectionShell title="Payload JSON" icon={Radio}>
        <pre className="overflow-x-auto rounded-2xl border-3 border-ink bg-ink p-4 text-sm font-bold text-white">{payload}</pre>
      </SectionShell>

      <SectionShell title="Log Request Masuk" icon={Radio} className="lg:col-span-2">
        {diagnostics.length === 0 ? (
          <EmptyState text="Belum ada request masuk. Tempel kartu atau tekan Tes Tap Kartu, lalu log akan muncul di sini." />
        ) : (
          <div className="grid gap-3">
            {diagnostics.slice(0, 12).map((event) => (
              <div key={event.id} className={`rounded-2xl border-3 border-ink p-4 shadow-brutalSm ${event.status === "success" ? "bg-limePop" : "bg-pinkPop"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-black uppercase">{event.type} - {event.status}</p>
                  <p className="font-mono text-xs font-black">{event.timestamp}</p>
                </div>
                <p className="mt-2 font-extrabold">{event.message}</p>
                <div className="mt-2 grid gap-2 text-sm font-bold md:grid-cols-3">
                  <span>IP: {event.sourceIp || "-"}</span>
                  <span>Device: {event.deviceId || "-"}</span>
                  <span>UID: {event.uid || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      <SectionShell title="Fallback IoT" icon={WifiOff} className="lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-3">
          {["Laptop dan ESP32 wajib satu WiFi", "Gunakan IP laptop, bukan localhost, di kode ESP32", "Saat HTTP 201, data sudah masuk dashboard realtime"].map((item) => (
            <div key={item} className="rounded-2xl border-3 border-ink bg-yellowPop p-4 font-black shadow-brutalSm">{item}</div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
