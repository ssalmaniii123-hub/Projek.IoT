export const initialAttendanceForm = {
  uid: "",
  name: "",
  status: "diterima",
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  deviceId: ""
};

export function inputClass() {
  return "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-white outline-none transition-all focus:border-neonCyan focus:bg-white/10 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]";
}
