import { useEffect, useState } from "react";
import { Check, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { Button, EmptyState, Field, SectionShell } from "../components/ui";
import { initialAttendanceForm, inputClass } from "../constants/form";
import { createAttendance, deleteAttendance, searchAttendance, updateAttendance } from "../lib/api";

function AttendanceForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(editing || initialAttendanceForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(editing || initialAttendanceForm);
  }, [editing]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, time: form.time.length === 5 ? `${form.time}:00` : form.time };
      if (editing?.id) await updateAttendance(editing.id, payload);
      else await createAttendance(payload);
      setForm(initialAttendanceForm);
      onSaved();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell title={editing ? "Edit Presensi" : "Tambah Presensi Manual"} icon={editing ? Pencil : Plus}>
      {error && <div className="mb-5 rounded-xl border border-neonPink/50 bg-neonPink/10 px-4 py-3 font-semibold text-neonPink">{error}</div>}
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nama"><input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="UID"><input required className={inputClass()} value={form.uid} onChange={(event) => setForm({ ...form, uid: event.target.value })} /></Field>
          <Field label="Status">
            <select className={inputClass()} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="diterima" className="bg-panelSolid text-white">Diterima</option>
              <option value="ditolak" className="bg-panelSolid text-white">Ditolak</option>
            </select>
          </Field>
          <Field label="Device ID"><input className={inputClass()} value={form.deviceId || ""} onChange={(event) => setForm({ ...form, deviceId: event.target.value })} /></Field>
          <Field label="Tanggal"><input required type="date" className={inputClass()} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} style={{ colorScheme: "dark" }} /></Field>
          <Field label="Jam"><input required type="time" className={inputClass()} value={form.time?.slice(0, 5)} onChange={(event) => setForm({ ...form, time: event.target.value })} style={{ colorScheme: "dark" }} /></Field>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          <Button disabled={saving}><Check size={18} strokeWidth={2.5} />{saving ? "Menyimpan..." : "Simpan"}</Button>
          {editing && <Button type="button" onClick={onCancel} className="bg-white/10 text-white shadow-none border border-white/20 hover:bg-white/20 hover:shadow-none hover:scale-[1.02]"><X size={18} strokeWidth={2.5} />Batal</Button>}
        </div>
      </form>
    </SectionShell>
  );
}

export function DataPage({ refreshDashboard }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    setLoading(true);
    const data = await searchAttendance({ search, status, limit: 200 });
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRows().catch(() => setLoading(false));
  }, []);

  const saveDone = () => {
    setEditing(null);
    loadRows();
    refreshDashboard();
  };

  const remove = async (row) => {
    if (!window.confirm(`Hapus presensi ${row.name}?`)) return;
    await deleteAttendance(row.id);
    loadRows();
    refreshDashboard();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr] animate-fadeIn">
      <AttendanceForm editing={editing} onSaved={saveDone} onCancel={() => setEditing(null)} />
      <SectionShell title="Data Presensi" icon={Search}>
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_180px_auto]">
          <input className={inputClass()} placeholder="Cari nama, UID, atau device..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className={inputClass()} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="" className="bg-panelSolid text-white">Semua Status</option>
            <option value="diterima" className="bg-panelSolid text-white">Diterima</option>
            <option value="ditolak" className="bg-panelSolid text-white">Ditolak</option>
          </select>
          <Button onClick={loadRows} className="bg-gradient-to-r from-neonPurple to-neonPink shadow-glowPurple hover:shadow-glowPink hover:scale-[1.02]"><RefreshCw size={18} strokeWidth={2.5} />Filter</Button>
        </div>
        {loading ? (
          <EmptyState text="Memuat data..." />
        ) : rows.length === 0 ? (
          <EmptyState text="Belum ada data presensi. Data akan muncul setelah ESP32 mengirim request atau admin menambah manual." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  {["Nama", "UID", "Status", "Tanggal", "Jam", "Device", "Aksi"].map((head) => <th key={head} className="border-b border-white/10 px-4 py-4 font-bold uppercase tracking-wider">{head}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-4 font-semibold text-white">{row.name}</td>
                    <td className="px-4 py-4 font-mono font-medium text-slate-300">{row.uid}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${row.status === "diterima" ? "bg-neonGreen/10 text-neonGreen border border-neonGreen/20" : "bg-neonPink/10 text-neonPink border border-neonPink/20"}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-300">{row.date}</td>
                    <td className="px-4 py-4 font-medium text-slate-300">{row.time}</td>
                    <td className="px-4 py-4 font-medium text-slate-300">{row.deviceId || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(row)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-neonCyan transition-all hover:bg-neonCyan/20 hover:scale-110" aria-label="Edit"><Pencil size={16} /></button>
                        <button onClick={() => remove(row)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-neonPink transition-all hover:bg-neonPink/20 hover:scale-110" aria-label="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionShell>
    </div>
  );
}
