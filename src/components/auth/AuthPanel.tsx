import { useState } from "react";
import { Loader2, Lock, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { OrangeButton } from "@/components/home/primitives";
import { loginFn, signupFn } from "@/lib/server-functions/auth";
import { AdminLogin } from "@/components/auth/AdminLogin";
import { DoctorLogin } from "@/components/auth/DoctorLogin";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/animate-ui/components/animate/tabs";

type Mode = "login" | "signup" | "doctor" | "admin";

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

  const handleTabChange = (val: string) => {
    setMode(val as Mode);
    setError("");
  };

  return (
    <div className={cn("rounded-xl border border-border/80 bg-cream p-5 shadow-xs", className)}>
      <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
        {/* Animated Tab Navigation using @animate-ui/components-animate-tabs */}
        <TabsList className="mb-4 grid w-full grid-cols-4 h-auto p-1 bg-background rounded-xl border border-border/80">
          <TabsTrigger
            value="login"
            className="py-2 px-1 text-xs font-semibold sm:text-sm whitespace-nowrap truncate data-[state=active]:bg-navy data-[state=active]:text-white transition-all"
          >
            Log In
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="py-2 px-1 text-xs font-semibold sm:text-sm whitespace-nowrap truncate data-[state=active]:bg-navy data-[state=active]:text-white transition-all"
          >
            Sign Up
          </TabsTrigger>
          <TabsTrigger
            value="doctor"
            className="py-2 px-1 text-xs font-semibold sm:text-sm flex items-center justify-center gap-1 whitespace-nowrap truncate data-[state=active]:bg-emerald-700 data-[state=active]:text-white transition-all"
          >
            <Stethoscope className="h-3.5 w-3.5 shrink-0" />
            <span>Doctor</span>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="py-2 px-1 text-xs font-semibold sm:text-sm flex items-center justify-center gap-1 whitespace-nowrap truncate data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Admin</span>
          </TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
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
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

              <OrangeButton type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </OrangeButton>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Your account lets you track every appointment you book.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
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
                placeholder="Create a password (min 8 characters)"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

              <OrangeButton type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </OrangeButton>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Your account lets you track every appointment you book.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="doctor">
            <DoctorLogin onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminLogin />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}
