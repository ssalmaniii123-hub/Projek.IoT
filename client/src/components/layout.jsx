import { useState } from "react";
import { Cable, LayoutDashboard, LogOut, Radio, Sparkles } from "lucide-react";
import { NetworkModal } from "./NetworkModal";
import { Button, StatusBadge } from "./ui";

const navItems = [
  ["dashboard", LayoutDashboard, "Dashboard"],
  ["data", Radio, "Data"],
  ["device", Cable, "ESP32"]
];

export function Sidebar({ page, setPage, logout }) {
  return (
    <aside className="hidden min-h-screen w-28 border-r border-white/10 glass-panel lg:flex lg:flex-col lg:items-center py-8 z-10 relative">
      <button onClick={() => setPage("dashboard")} className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-neonCyan to-neonPurple text-white shadow-glowCyan transition-transform hover:scale-105">
        <Sparkles size={30} strokeWidth={2.5} />
      </button>
      <nav className="mt-12 flex flex-col gap-6">
        {navItems.map(([key, Icon, label]) => (
          <button key={key} onClick={() => setPage(key)} title={label} className={`grid h-14 w-14 place-items-center rounded-xl transition-all duration-300 hover:scale-110 ${page === key ? "bg-white/20 text-neonCyan shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>
            <Icon size={24} strokeWidth={2.5} />
          </button>
        ))}
        <button onClick={logout} title="Logout" className="mt-8 grid h-14 w-14 place-items-center rounded-xl text-slate-400 transition-all hover:bg-neonPink/20 hover:text-neonPink hover:shadow-glowPink">
          <LogOut size={24} strokeWidth={2.5} />
        </button>
      </nav>
    </aside>
  );
}

export function AppShell({ title, page, setPage, connected, error, onLogout, children }) {
  const [showNetwork, setShowNetwork] = useState(false);

  const openDevicePage = () => {
    setShowNetwork(false);
    setPage("device");
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="fixed inset-0 z-0 bg-mesh" />
      <div className="flex relative z-10">
        <Sidebar page={page} setPage={setPage} logout={onLogout} />
        <div className="w-full px-4 py-6 md:px-8 lg:px-10 max-h-screen overflow-y-auto">
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-neonCyan/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-neonCyan border border-neonCyan/30">
                RFID / RTC ESP32 Live Monitor
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge connected={connected} onClick={() => setShowNetwork(true)} />
              <Button onClick={onLogout} className="lg:hidden bg-white/10 border border-white/20 hover:bg-white/20 shadow-none"><LogOut size={18} />Logout</Button>
            </div>
          </header>

          <nav className="mb-8 grid grid-cols-3 gap-3 lg:hidden glass-panel rounded-2xl p-2">
            {navItems.map(([key, , label]) => (
              <button key={key} onClick={() => setPage(key)} className={`rounded-xl px-2 py-2.5 text-sm font-bold transition-all ${page === key ? "bg-white/20 text-neonCyan shadow-glowCyan" : "text-slate-400 hover:bg-white/10"}`}>
                {label}
              </button>
            ))}
          </nav>

          {error && <div className="mb-6 rounded-2xl border border-neonPink/50 bg-neonPink/20 px-5 py-4 font-bold text-neonPink shadow-glowPink backdrop-blur-md">Backend Connection Error: {error}</div>}
          
          <div className="pb-10">
            {children}
          </div>
        </div>
      </div>
      {showNetwork && (
        <NetworkModal
          connected={connected}
          onClose={() => setShowNetwork(false)}
          onOpenDevicePage={openDevicePage}
        />
      )}
    </main>
  );
}
