import { useState } from "react";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { adminLogin } from "@/lib/server-functions/admin-auth";
import { useCurrentUser } from "@/hooks/use-current-user";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

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
      setError(err instanceof Error ? err.message : "Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3">
      <div className="rounded-lg bg-navy/5 p-2.5 border border-navy/10 flex items-center gap-2 text-xs text-navy font-medium">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>Restricted Access — Administrator Authentication</span>
      </div>

      <input
        type="email"
        placeholder="Admin email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className={inputClass}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        className={inputClass}
      />

      <input
        type="text"
        inputMode="numeric"
        placeholder="6-digit Authenticator code"
        value={form.token}
        onChange={(e) => setForm({ ...form, token: e.target.value })}
        maxLength={6}
        required
        className={`${inputClass} text-center tracking-widest font-mono font-bold`}
      />

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-primary text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Authenticating Admin...
          </span>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Sign in as Admin
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
        <Lock className="h-3 w-3" /> Secure 2FA multi-factor authentication active.
      </p>
    </form>
  );
}
