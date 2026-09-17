// src/components/auth/DoctorLogin.tsx
import { useState } from "react";
import { Loader2, Stethoscope, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { loginFn } from "@/lib/server-functions/auth";
import { useCurrentUser } from "@/hooks/use-current-user";

import { PasswordInput } from "@/components/auth/PasswordInput";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10";

export function DoctorLogin({ onSuccess }: { onSuccess?: (() => void) | undefined }) {
  const { setUser } = useCurrentUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [licenseCode, setLicenseCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginFn({ data: { email, password } });
      if (res.success) {
        setUser(res.user);
        toast.success(`Welcome, Dr. ${res.user.name}! Directing to Care Portal...`);
        onSuccess?.();
        navigate({ to: "/doctors" });
      } else {
        setError(res.error);
      }
    } catch (err) {
      console.error(err);
      setError("Doctor authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3">
      <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Care Specialist & Doctor Portal — Verified Connection</span>
      </div>

      <input
        type="email"
        placeholder="Doctor / Specialist Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputClass}
      />

      <input
        type="text"
        placeholder="Medical License / NPI Code (Optional)"
        value={licenseCode}
        onChange={(e) => setLicenseCode(e.target.value)}
        className={inputClass}
      />

      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="Password"
        autoComplete="current-password"
      />

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Authenticating Doctor...
          </span>
        ) : (
          <>
            <Stethoscope className="h-4 w-4" />
            Care Specialist Sign In
          </>
        )}
      </button>
    </form>
  );
}
