import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton } from "@/components/home/primitives";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { resetPasswordFn } from "@/lib/server-functions/password-reset";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? (search["token"] as string) : "",
    email: typeof search["email"] === "string" ? (search["email"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Set a New Password | Go Surgery" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, email } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setStatus("saving");
    const res = await resetPasswordFn({ data: { token, email, password } }).catch(() => null);
    if (res?.success) {
      setStatus("done");
    } else {
      setStatus("idle");
      setError(res && !res.success ? res.error : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-background">
      <Header />
      <main className="bg-cream py-16">
        <Container className="max-w-md">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            {!token || !email ? (
              <div className="text-center">
                <h1 className="text-xl font-bold text-navy">Invalid reset link</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This link is incomplete. Please request a new one.
                </p>
                <a href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
                  Request a new link
                </a>
              </div>
            ) : status === "done" ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                <h1 className="mt-3 text-xl font-bold text-navy">Password updated</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  You can now log in with your new password. For your security, you've been signed
                  out on all other devices.
                </p>
                <a href="/account" className="mt-5 inline-block">
                  <OrangeButton>Log in</OrangeButton>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <KeyRound className="h-8 w-8 text-primary" />
                  <h1 className="mt-3 text-xl font-bold text-navy">Create a new password</h1>
                  <p className="mt-1 text-sm text-muted-foreground">For {email}</p>
                </div>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="New password (8+ chars, 1 uppercase, 1 special sign)"
                  autoComplete="new-password"
                  showStrength={true}
                />
                <PasswordInput
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                {error ? (
                  <p className="text-xs font-medium text-destructive">
                    {error}{" "}
                    {error.includes("expired") ? (
                      <a href="/forgot-password" className="underline">
                        Request a new link
                      </a>
                    ) : null}
                  </p>
                ) : null}
                <OrangeButton type="submit" disabled={status === "saving"} className="w-full">
                  {status === "saving" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </span>
                  ) : (
                    "Set new password"
                  )}
                </OrangeButton>
              </form>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
