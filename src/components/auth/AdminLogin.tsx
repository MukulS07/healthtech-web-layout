// src/components/auth/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { adminLogin } from "@/lib/server-functions/admin-auth";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AdminLogin() {
  const navigate = useNavigate();
  const { setUser } = useCurrentUser();
  const [form, setForm] = useState({ email: "", password: "", token: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin({ data: form });
      if (res && res.user) {
        setUser(res.user);
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Admin email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        inputMode="numeric"
        placeholder="6-digit Authenticator code"
        value={form.token}
        onChange={(e) => setForm({ ...form, token: e.target.value })}
        maxLength={6}
        required
        className="w-full border rounded px-3 py-2 text-center tracking-widest font-mono text-sm font-bold"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="w-full bg-black text-white rounded px-3 py-2">
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
