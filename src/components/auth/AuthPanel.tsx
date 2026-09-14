import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OrangeButton } from "@/components/home/primitives";
import { loginFn, signupFn } from "@/lib/server-functions/auth";
import { useCurrentUser } from "@/hooks/use-current-user";

type Mode = "login" | "signup";

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
      const res =
        mode === "signup"
          ? await signupFn({ data: { name, email, phone, password } })
          : await loginFn({ data: { email, password } });

      if (res.success) {
        setUser(res.user);
        setPassword("");
        toast.success(
          mode === "signup" ? `Welcome, ${res.user.name}!` : `Welcome back, ${res.user.name}!`,
        );
        onSuccess?.();
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
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-background p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              "rounded-md py-2 text-sm font-semibold transition-colors",
              mode === m ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-navy",
            )}
          >
            {m === "login" ? "Log In" : "Sign Up"}
          </button>
        ))}
      </div>

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
          placeholder={mode === "signup" ? "Create a password (min 8 characters)" : "Password"}
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
    </div>
  );
}
