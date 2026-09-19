import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton } from "@/components/home/primitives";
import { requestPasswordResetFn } from "@/lib/server-functions/password-reset";

export const Route = createFileRoute("/forgot-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search["email"] === "string" ? (search["email"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Forgot Password | Go Surgery" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const search = Route.useSearch();
  const [email, setEmail] = useState(search.email ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const res = await requestPasswordResetFn({ data: { email } }).catch(() => null);
    if (res?.success) {
      setStatus("sent");
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
            {status === "sent" ? (
              <div className="text-center">
                <MailCheck className="mx-auto h-10 w-10 text-primary" />
                <h1 className="mt-3 text-xl font-bold text-navy">Check your email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account exists for <strong className="text-navy">{email}</strong>, we've sent
                  a link to set a new password. It's valid for 1 hour.
                </p>
                <a href="/account" className="mt-5 inline-block text-sm font-semibold text-primary hover:underline">
                  Back to log in
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <KeyRound className="h-8 w-8 text-primary" />
                  <h1 className="mt-3 text-xl font-bold text-navy">Forgot your password?</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter the email you signed up with and we'll send you a reset link.
                  </p>
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
                <OrangeButton type="submit" disabled={status === "sending"} className="w-full">
                  {status === "sending" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </OrangeButton>
                <a href="/account" className="block text-center text-xs font-semibold text-muted-foreground hover:text-navy">
                  Remembered it? Log in
                </a>
              </form>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
