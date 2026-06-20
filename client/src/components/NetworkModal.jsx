import { ArrowRight, Cpu, Laptop, Router, Smartphone, Wifi, WifiOff, X } from "lucide-react";
import { API_URL } from "../lib/api";

function DeviceNode({ icon: Icon, title, subtitle, accentColor }) {
  return (
    <div className={`glass-panel rounded-2xl p-5 text-center transition-transform hover:-translate-y-1 hover:border-white/20 ${accentColor}`}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
        <Icon size={32} strokeWidth={2.5} />
      </div>
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-xs font-semibold text-slate-400">{subtitle}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden place-items-center lg:grid text-slate-500">
      <ArrowRight size={32} strokeWidth={2} />
    </div>
  );
}

export function NetworkModal({ connected, onClose, onOpenDevicePage }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 py-6 backdrop-blur-md">
      <section className="glass-panel max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl p-6 md:p-8 animate-slideUp">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-neonCyan/30 bg-neonCyan/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-neonCyan">
              Network Pairing
            </p>
            <h2 className="text-3xl font-black text-white md:text-5xl">Koneksi WiFi Perangkat</h2>
          </div>
          <button onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-all hover:bg-neonPink/20 hover:text-neonPink hover:shadow-glowPink" aria-label="Tutup panel koneksi">
            <X size={26} strokeWidth={2.5} />
          </button>
        </div>

        <div className={`mb-8 flex items-center gap-4 rounded-2xl border p-5 font-bold backdrop-blur-md ${connected ? "border-neonGreen/50 bg-neonGreen/10 text-neonGreen shadow-glowGreen" : "border-neonPink/50 bg-neonPink/10 text-neonPink shadow-glowPink"}`}>
          {connected ? <Wifi size={28} strokeWidth={2.5} /> : <WifiOff size={28} strokeWidth={2.5} />}
          <span className="text-lg">{connected ? "Dashboard tersambung ke backend realtime" : "Dashboard belum tersambung ke backend"}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <DeviceNode icon={Smartphone} title="HP / Router WiFi" subtitle="Satu jaringan untuk laptop dan ESP32" accentColor="text-neonYellow" />
          <FlowArrow />
          <DeviceNode icon={Laptop} title="Laptop Dashboard" subtitle="Menjalankan web dan backend SQLite" accentColor="text-neonCyan" />
          <FlowArrow />
          <DeviceNode icon={Cpu} title="Alat IoT ESP32" subtitle="RFID/RTC mengirim absen via HTTP" accentColor="text-neonPurple" />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="glass-panel rounded-2xl p-6">
            <div className="mb-5 flex items-center gap-3 text-neonCyan">
              <Router size={24} strokeWidth={2.5} />
              <h3 className="text-xl font-bold text-white">Alur Kerja</h3>
            </div>
            <div className="grid gap-3 text-sm font-semibold text-slate-300">
              <p className="rounded-xl bg-white/5 px-4 py-3 border border-white/5 hover:border-white/10 transition-colors">1. HP/router membuat WiFi yang sama.</p>
              <p className="rounded-xl bg-white/5 px-4 py-3 border border-white/5 hover:border-white/10 transition-colors">2. Laptop membuka dashboard dan backend.</p>
              <p className="rounded-xl bg-white/5 px-4 py-3 border border-white/5 hover:border-white/10 transition-colors">3. ESP32 connect ke WiFi yang sama.</p>
              <p className="rounded-xl bg-white/5 px-4 py-3 border border-white/5 hover:border-white/10 transition-colors">4. Saat kartu ditempel, ESP32 POST data presensi ke backend.</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-neonGreen/30 bg-neonGreen/5 p-6">
            <h3 className="mb-4 text-xl font-bold text-white">Endpoint Backend</h3>
            <p className="break-all rounded-xl border border-neonGreen/20 bg-black/40 px-4 py-4 font-mono text-sm font-bold text-neonGreen">
              {API_URL}/api/attendance
            </p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300">
              Untuk ESP32, nanti <code className="rounded bg-white/10 px-1 py-0.5 text-neonCyan">localhost</code> harus diganti IP laptop yang satu WiFi dengan alat IoT.
            </p>
            <button onClick={onOpenDevicePage} className="mt-6 w-full rounded-xl bg-gradient-to-r from-neonCyan to-neonPurple px-5 py-3.5 font-bold text-white shadow-glowCyan transition-all hover:scale-[1.02] hover:shadow-glowPurple">
              Buka Halaman ESP32
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
