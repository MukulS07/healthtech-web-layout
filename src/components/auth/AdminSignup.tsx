// src/components/auth/AdminSignup.tsx
//
// Two-step flow:
//   1. Name / email / password  ->  adminSignup()  ->  get QR code
//   2. Scan QR in authenticator app, enter 6-digit code -> confirmAdminTotp()

import { useState } from "react";
import { adminSignup, confirmAdminTotp } from "@/lib/server-functions/admin-auth";

type Step = "details" | "verify" | "done";

export function AdminSignup() {
  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [userId, setUserId] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [manualSecret, setManualSecret] = useState("");
  const [code, setCode] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await adminSignup({ data: form });
      setUserId(result.userId);
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setManualSecret(result.manualSecret);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmAdminTotp({ data: { userId, token: code } });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "details") {
    return (
      <form onSubmit={handleSignup} className="space-y-4">
        <h2 className="text-lg font-semibold">Invite a new administrator</h2>
        <p className="text-sm text-gray-600">
          The new admin must be present to scan the authenticator QR code in the next step.
        </p>

        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password (12+ characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={12}
          className="w-full border rounded px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-black text-white rounded px-3 py-2">
          {loading ? "Creating account…" : "Continue"}
        </button>
      </form>
    );
  }

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <h2 className="text-lg font-semibold">Set up two-factor authentication</h2>
        <p className="text-sm text-gray-600">
          Scan this code with Google Authenticator, Authy, or any TOTP app.
        </p>

        <img src={qrCodeDataUrl} alt="Scan with your authenticator app" className="mx-auto" />

        <p className="text-xs text-gray-500 text-center">
          Can't scan it? Enter this key manually: <code>{manualSecret}</code>
        </p>

        <input
          type="text"
          inputMode="numeric"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
          className="w-full border rounded px-3 py-2 text-center tracking-widest"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-black text-white rounded px-3 py-2">
          {loading ? "Verifying…" : "Confirm & enable 2FA"}
        </button>
      </form>
    );
  }

  return (
    <div className="text-center space-y-2">
      <h2 className="text-lg font-semibold">You're all set</h2>
      <p className="text-sm text-gray-600">
        Two-factor authentication is enabled. The new admin can now sign in at /admin with their password and authenticator code.
      </p>
    </div>
  );
}
