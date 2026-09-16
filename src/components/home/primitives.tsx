import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "orange",
}: {
  children: ReactNode;
  tone?: "orange" | "light";
}) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-wider",
        tone === "orange" ? "text-brand-orange" : "text-navy-foreground/80",
      )}
    >
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  tone?: "dark" | "light";
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 gap-4 sm:mb-12",
        align === "center"
          ? "flex flex-col items-center text-center"
          : "grid grid-cols-1 sm:flex sm:items-end sm:justify-between",
      )}
    >
      <div className={cn("min-w-0", align === "center" && "max-w-2xl")}>
        {eyebrow ? <Eyebrow tone={tone === "light" ? "light" : "orange"}>{eyebrow}</Eyebrow> : null}
        <h2
          className={cn(
            "mt-2 text-2xl font-bold tracking-tight leading-tight sm:text-3xl lg:text-[34px]",
            tone === "light" ? "text-navy-foreground" : "text-navy",
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={cn(
              "mt-2.5 text-sm leading-relaxed sm:text-base",
              tone === "light" ? "text-navy-foreground/80" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function OrangeButton({
  children,
  className,
  type = "button",
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-11 rounded-xl border border-primary/20 bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function OutlineButton({
  children,
  className,
  tone = "dark",
  disabled = false,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <Button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-11 rounded-xl border px-5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]",
        tone === "light"
          ? "border-white/30 bg-white/10 text-navy-foreground hover:bg-white/20 hover:border-white/40 shadow-xs"
          : "border-border bg-background text-navy hover:bg-muted hover:border-navy/20 shadow-xs",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function Carousel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pt-1"
      >
        {children}
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-navy shadow-sm transition-all hover:bg-muted hover:border-navy/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-navy shadow-sm transition-all hover:bg-muted hover:border-navy/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
