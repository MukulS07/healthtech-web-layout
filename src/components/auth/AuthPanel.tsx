import { useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { OrangeButton } from "@/components/home/primitives";
import { loginFn, signupFn } from "@/lib/server-functions/auth";
import { AdminLogin } from "@/components/auth/AdminLogin";
import { useCurrentUser } from "@/hooks/use-current-user";

type Mode = "login" | "signup" | "admin";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

export function AuthPanel({
  initialMode = "login",
  onSuccess,
  className,
}: {
  initialMode?: Mode;
  onSuccess?: () => void;
  className?: string;
}) {
  const { setUser } = useCurrentUser();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      let res;
      if (mode === "signup") {
        res = await signupFn({ data: { name, email, phone, password } });
      } else {
        res = await loginFn({ data: { email, password } });
      }

      if (res.success) {
        setUser(res.user);
        setPassword("");
        if (res.user.role === "admin") {
          toast.success("Welcome Admin! Directing to Admin Portal...");
          onSuccess?.();
          navigate({ to: "/admin" });
        } else {
          toast.success(
            mode === "signup" ? `Welcome, ${res.user.name}!` : `Welcome back, ${res.user.name}!`,
          );
          onSuccess?.();
          navigate({ to: "/account" });
        }
      } else {
        setError(res.error);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
  };

  return (
    <div className={cn("rounded-xl border border-border bg-cream p-5", className)}>
      {/* 3 Tab Header: Log In (Patient), Sign Up (Patient), Admin Access */}
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-background p-1 text-center">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={cn(
            "rounded-md py-2 text-xs font-semibold transition-colors sm:text-sm",
            mode === "login"
              ? "bg-navy text-navy-foreground"
              : "text-muted-foreground hover:text-navy",
          )}
        >
          Patient Log In
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={cn(
            "rounded-md py-2 text-xs font-semibold transition-colors sm:text-sm",
            mode === "signup"
              ? "bg-navy text-navy-foreground"
              : "text-muted-foreground hover:text-navy",
          )}
        >
          Patient Sign Up
        </button>
        <button
          type="button"
          onClick={() => switchMode("admin")}
          className={cn(
            "flex items-center justify-center gap-1 rounded-md py-2 text-xs font-semibold transition-colors sm:text-sm",
            mode === "admin"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-primary",
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Admin
        </button>
      </div>

      {mode === "admin" ? (
        <AdminLogin />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" ? (
            <>
              <input
                className={inputClass}
                placeholder="Full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="Phone number"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </>
          ) : null}

          <input
            type="email"
            className={inputClass}
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className={inputClass}
            placeholder={
              mode === "signup" ? "Create a password (min 8 characters)" : "Password"
            }
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={mode === "signup" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

          <OrangeButton type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "signup" ? "Creating account..." : "Logging in..."}
              </span>
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Log In"
            )}
          </OrangeButton>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Your account lets you track every appointment you book.
          </p>
        </form>
      )}
    </div>
  );
}
