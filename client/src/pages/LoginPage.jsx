import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button, Field } from "../components/ui";
import { inputClass } from "../constants/form";
import { login } from "../lib/api";

export function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await login(form.username, form.password);
      localStorage.setItem("rfid-session", JSON.stringify(session));
      onLogin(session);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
      <div className="fixed inset-0 -z-10 dot-pattern" />
      <form onSubmit={submit} className="w-full max-w-md rounded-[22px] border-4 border-ink bg-white p-6 shadow-brutal">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-ink bg-limePop shadow-brutalSm">
            <Sparkles size={28} strokeWidth={3} />
          </span>
          <div>
            <p className="text-sm font-black uppercase text-ink/60">RFID Attendance</p>
            <h1 className="text-4xl font-black">Admin Login</h1>
          </div>
        </div>
        {error && <div className="mb-4 rounded-xl border-3 border-ink bg-pinkPop px-3 py-2 font-black">{error}</div>}
        <div className="grid gap-4">
          <Field label="Username">
            <input className={inputClass()} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </Field>
          <Field label="Password">
            <input className={inputClass()} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </Field>
          <Button disabled={loading} className="mt-2 w-full bg-limePop">
            <Check size={20} strokeWidth={3} />
            {loading ? "Memproses..." : "Masuk Dashboard"}
          </Button>
        </div>
      </form>
    </main>
  );
}
