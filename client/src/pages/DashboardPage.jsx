import { Activity, BadgeCheck, Clock3, Radio, ShieldAlert, UserRoundCheck, Wifi } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, SectionShell, StatCard } from "../components/ui";

function AttendanceChart({ data }) {
  return (
    <SectionShell title="Performa Presensi Harian" icon={Activity} className="min-h-[380px] lg:col-span-2">
      <div className="h-[300px] w-full rounded-2xl bg-white/5 p-4 border border-white/10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: "rgba(24,24,27,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(8px)", color: "#fff" }} />
            <Bar dataKey="accepted" name="Diterima" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="rejected" name="Ditolak" fill="#ec4899" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionShell>
  );
}

function ActivityRows({ rows, pulseId }) {
  if (rows.length === 0) return <EmptyState text="Belum ada presensi. Sambungkan ESP32 atau tambah data manual dari menu Data." />;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr] gap-3 border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
        <span>Nama</span>
        <span>UID</span>
        <span>Status</span>
        <span>Jam</span>
        <span>Device</span>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {rows.map((row) => (
          <div key={row.id} className={`grid gap-2 border-b border-white/5 px-5 py-3.5 transition-colors last:border-b-0 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr] md:items-center ${pulseId === row.id ? "bg-white/10 shadow-[inset_4px_0_0_#06b6d4]" : "hover:bg-white/5"}`}>
            <div>
              <p className="font-semibold text-white">{row.name}</p>
              <p className="text-xs text-slate-400 md:hidden">{row.date}</p>
            </div>
            <p className="font-mono text-sm text-slate-300">{row.uid}</p>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${row.status === "diterima" ? "bg-neonGreen/10 text-neonGreen border border-neonGreen/20" : "bg-neonPink/10 text-neonPink border border-neonPink/20"}`}>{row.status}</span>
            <p className="text-sm font-medium text-slate-300">{row.time}</p>
            <p className="text-sm font-medium text-slate-300">{row.deviceId || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveCard({ item, pulseId }) {
  return (
    <SectionShell title="RFID Terakhir" icon={Radio}>
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 ${pulseId ? "animate-pulseGlow" : ""}`}>
        {pulseId && <div className="absolute inset-0 bg-neonCyan/5 animate-pulse" />}
        <div className="relative z-10">
          {item ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <p className="text-2xl font-bold text-white md:text-3xl">{item.name}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase shadow-sm ${item.status === "diterima" ? "bg-neonGreen/20 text-neonGreen border border-neonGreen/50 shadow-glowGreen" : "bg-neonPink/20 text-neonPink border border-neonPink/50 shadow-glowPink"}`}>{item.status}</span>
              </div>
              <div className="space-y-3 text-sm font-medium text-slate-300">
                <p className="flex justify-between rounded-xl bg-black/20 px-4 py-2.5"><span>UID:</span> <span className="font-mono text-white">{item.uid}</span></p>
                <p className="flex justify-between rounded-xl bg-black/20 px-4 py-2.5"><span>Tanggal:</span> <span className="text-white">{item.date}</span></p>
                <p className="flex justify-between rounded-xl bg-black/20 px-4 py-2.5"><span>Jam:</span> <span className="text-white">{item.time}</span></p>
                <p className="flex justify-between rounded-xl bg-black/20 px-4 py-2.5"><span>Device:</span> <span className="text-white">{item.deviceId || "-"}</span></p>
              </div>
            </>
          ) : (
            <EmptyState text="Belum ada data masuk dari ESP32." />
          )}
        </div>
      </div>
    </SectionShell>
  );
}

export function DashboardPage({ dashboard }) {
  const { summary, attendance, live, isLoading, pulseId } = dashboard;
  const activeCaption = summary.isUsingLatestDate ? `Tanggal alat ${summary.activeDate}` : "Presensi hari ini";

  return (
    <div className="animate-fadeIn">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Presensi" value={isLoading ? "..." : summary.totalToday} accentColorClass="text-neonCyan shadow-glowCyan" icon={BadgeCheck} caption={activeCaption} />
        <StatCard title="Diterima" value={isLoading ? "..." : summary.acceptedToday} accentColorClass="text-neonGreen shadow-glowGreen" icon={UserRoundCheck} caption={summary.isUsingLatestDate ? "Akses valid tanggal alat" : "Akses valid"} />
        <StatCard title="Ditolak" value={isLoading ? "..." : summary.rejectedToday} accentColorClass="text-neonPink shadow-glowPink" icon={ShieldAlert} caption={summary.isUsingLatestDate ? "Akses ditolak tanggal alat" : "Akses tidak valid"} />
        <StatCard title="User Aktif" value={isLoading ? "..." : summary.uniqueUsers} accentColorClass="text-neonPurple shadow-glowPurple" icon={Radio} caption="UID unik tercatat" />
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <AttendanceChart data={summary.daily} />
        <LiveCard item={live} pulseId={pulseId} />
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <SectionShell title="Recent Activity" icon={Clock3} className="lg:col-span-2">
          <ActivityRows rows={attendance} pulseId={pulseId} />
        </SectionShell>
        <SectionShell title="Server Status" icon={Wifi}>
          <div className="rounded-2xl border border-neonCyan/30 bg-neonCyan/10 p-6 shadow-glowCyan">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`h-4 w-4 rounded-full ${dashboard.isConnected ? "bg-neonGreen" : "bg-neonPink"}`}></div>
                <div className={`absolute inset-0 h-4 w-4 rounded-full animate-ping ${dashboard.isConnected ? "bg-neonGreen" : "bg-neonPink"}`}></div>
              </div>
              <p className="text-4xl font-black text-white">{dashboard.isConnected ? "LIVE" : "OFFLINE"}</p>
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300">Socket.IO realtime aktif saat tersambung. Jika putus, dashboard memakai fallback polling.</p>
          </div>
        </SectionShell>
      </section>
    </div>
  );
}
