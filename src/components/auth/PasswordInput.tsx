import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  showStrength?: boolean;
  className?: string;
  id?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
  required = true,
  showStrength = false,
  className,
  id,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Complexity rules
  const hasMinLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
  const hasNumber = /[0-9]/.test(value);

  // Strength score: 0 to 4
  const metCount = [hasMinLength, hasUppercase, hasSpecialChar, hasNumber].filter(Boolean).length;

  let strengthLabel = "";
  let strengthColor = "bg-muted";

  if (value.length > 0) {
    if (metCount <= 1) {
      strengthLabel = "Weak";
      strengthColor = "bg-destructive";
    } else if (metCount === 2) {
      strengthLabel = "Fair";
      strengthColor = "bg-amber-500";
    } else if (metCount === 3) {
      strengthLabel = "Strong";
      strengthColor = "bg-emerald-500";
    } else {
      strengthLabel = "Very Strong";
      strengthColor = "bg-emerald-600";
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            "w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10",
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer focus:outline-none"
          title={showPassword ? "Hide password" : "Show password"}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-2 rounded-lg bg-background/80 p-3 border border-border/60 text-xs">
          {/* Strength Progress Bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Password strength:</span>
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                metCount <= 1 && "text-destructive",
                metCount === 2 && "text-amber-600",
                metCount >= 3 && "text-emerald-600",
              )}
            >
              {strengthLabel}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                metCount >= 1 ? strengthColor : "bg-transparent",
              )}
            />
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                metCount >= 2 ? strengthColor : "bg-transparent",
              )}
            />
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                metCount >= 3 ? strengthColor : "bg-transparent",
              )}
            />
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                metCount >= 4 ? strengthColor : "bg-transparent",
              )}
            />
          </div>

          {/* Complexity Rules Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
            <div
              className={cn(
                "flex items-center gap-1.5 font-medium transition-colors",
                hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
              )}
            >
              {hasMinLength ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <X className="h-3.5 w-3.5 shrink-0 opacity-40" />}
              <span>At least 8 characters</span>
            </div>

            <div
              className={cn(
                "flex items-center gap-1.5 font-medium transition-colors",
                hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
              )}
            >
              {hasUppercase ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <X className="h-3.5 w-3.5 shrink-0 opacity-40" />}
              <span>1 uppercase letter (A-Z)</span>
            </div>

            <div
              className={cn(
                "flex items-center gap-1.5 font-medium transition-colors",
                hasSpecialChar ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
              )}
            >
              {hasSpecialChar ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <X className="h-3.5 w-3.5 shrink-0 opacity-40" />}
              <span>1 special sign (!@#$)</span>
            </div>

            <div
              className={cn(
                "flex items-center gap-1.5 font-medium transition-colors",
                hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
              )}
            >
              {hasNumber ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <X className="h-3.5 w-3.5 shrink-0 opacity-40" />}
              <span>1 number (0-9)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
