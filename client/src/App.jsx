import { useMemo, useState } from "react";
import { AppShell } from "./components/layout";
import { useDashboardData } from "./hooks/useDashboardData";
import { DashboardPage } from "./pages/DashboardPage";
import { DataPage } from "./pages/DataPage";
import { DevicePage } from "./pages/DevicePage";
import { LoginPage } from "./pages/LoginPage";

const pageTitles = {
  dashboard: "Dashboard Overview",
  data: "Kelola Presensi",
  device: "Koneksi ESP32"
};

function AuthenticatedApp({ onLogout }) {
  const [page, setPage] = useState("dashboard");
  const dashboard = useDashboardData();
  const title = useMemo(() => pageTitles[page], [page]);

  return (
    <AppShell
      title={title}
      page={page}
      setPage={setPage}
      connected={dashboard.isConnected}
      error={dashboard.error}
      onLogout={onLogout}
    >
      {page === "dashboard" && <DashboardPage dashboard={dashboard} />}
      {page === "data" && <DataPage refreshDashboard={dashboard.refresh} />}
      {page === "device" && <DevicePage lastDevice={dashboard.lastDevice} refreshDashboard={dashboard.refresh} />}
    </AppShell>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem("rfid-session");
    return stored ? JSON.parse(stored) : null;
  });

  const logout = () => {
    localStorage.removeItem("rfid-session");
    setSession(null);
  };

  if (!session) return <LoginPage onLogin={setSession} />;
  return <AuthenticatedApp onLogout={logout} />;
}
