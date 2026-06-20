import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { API_URL, getAttendance, getLive, getSummary } from "../lib/api";

const emptySummary = {
  serverDate: "",
  activeDate: "",
  isUsingLatestDate: false,
  totalToday: 0,
  acceptedToday: 0,
  rejectedToday: 0,
  uniqueUsers: 0,
  daily: []
};

export function useDashboardData() {
  const [summary, setSummary] = useState(emptySummary);
  const [attendance, setAttendance] = useState([]);
  const [live, setLive] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pulseId, setPulseId] = useState(0);
  const [lastDevice, setLastDevice] = useState(null);

  const refresh = async () => {
    const [summaryData, attendanceData, liveData] = await Promise.all([
      getSummary(),
      getAttendance(30),
      getLive()
    ]);
    setSummary(summaryData);
    setAttendance(attendanceData);
    setLive(liveData);
  };

  useEffect(() => {
    let isMounted = true;

    refresh()
      .then(() => {
        if (isMounted) setError("");
      })
      .catch((refreshError) => {
        if (isMounted) setError(refreshError.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 4000
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", () => setIsConnected(false));

    socket.on("attendance:new", (record) => {
      setPulseId(record.id);
      setLive(record);
      setAttendance((current) => [record, ...current.filter((item) => item.id !== record.id)].slice(0, 30));
      window.setTimeout(() => setPulseId(0), 900);
    });

    socket.on("summary:update", (nextSummary) => {
      setSummary(nextSummary);
    });

    socket.on("attendance:changed", (payload) => {
      setSummary(payload.summary);
      setLive(payload.live);
      refresh().catch((refreshError) => setError(refreshError.message));
    });

    socket.on("device:heartbeat", (device) => {
      setLastDevice(device);
    });

    const fallbackTimer = window.setInterval(() => {
      if (!socket.connected) {
        refresh().catch((refreshError) => setError(refreshError.message));
      }
    }, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(fallbackTimer);
      socket.disconnect();
    };
  }, []);

  return useMemo(
    () => ({ summary, attendance, live, isConnected, isLoading, error, pulseId, lastDevice, refresh }),
    [summary, attendance, live, isConnected, isLoading, error, pulseId, lastDevice]
  );
}
