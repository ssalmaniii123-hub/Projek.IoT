import { Wifi, WifiOff } from "lucide-react";

export function StatusBadge({ connected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 ${
        connected
          ? "border-neonGreen/50 bg-neonGreen/10 text-neonGreen shadow-glowGreen"
          : "border-neonPink/50 bg-neonPink/10 text-neonPink shadow-glowPink"
      }`}
    >
      {connected ? <Wifi size={18} /> : <WifiOff size={18} />}
      {connected ? "System Online" : "System Offline"}
    </button>
  );
}

export function SectionShell({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`glass-panel rounded-2xl p-5 md:p-6 transition-all duration-500 animate-slideUp ${className}`}>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neonCyan/20 to-neonPurple/20 text-neonCyan shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Icon size={20} strokeWidth={2.5} />
        </span>
        <h2 className="text-xl font-bold tracking-wide text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neonCyan to-neonPurple px-5 py-2.5 font-bold text-white shadow-glowCyan transition-all duration-300 hover:scale-[1.02] hover:shadow-glowPurple disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold tracking-wider text-slate-400 uppercase">
      {label}
      {children}
    </label>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-white/10 bg-white/5 px-4 py-12 text-center font-medium text-slate-400 backdrop-blur-sm">
      {text}
    </div>
  );
}

export function StatCard({ title, value, accentColorClass, icon: Icon, caption }) {
  // accentColorClass e.g. "text-neonGreen shadow-glowGreen"
  return (
    <section className="glass-panel group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-3 text-5xl font-black leading-none text-white tracking-tight md:text-6xl">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 transition-all duration-500 group-hover:scale-110 ${accentColorClass}`}>
          <Icon size={26} strokeWidth={2.5} />
        </div>
      </div>
      <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-md">
        {caption}
      </p>
    </section>
  );
}
