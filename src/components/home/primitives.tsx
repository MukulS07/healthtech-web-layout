import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-4 sm:px-6", className)}>{children}</div>;
}

export function Eyebrow({ children, tone = "orange" }: { children: ReactNode; tone?: "orange" | "light" }) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.18em]",
        tone === "orange" ? "text-brand-orange" : "text-navy-foreground/70",
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
        "mb-8 gap-4 sm:mb-10",
        align === "center" ? "flex flex-col items-center text-center" : "grid grid-cols-1 sm:flex sm:items-end sm:justify-between",
      )}
    >
      <div className={cn("min-w-0", align === "center" && "max-w-2xl")}>
        {eyebrow ? <Eyebrow tone={tone === "light" ? "light" : "orange"}>{eyebrow}</Eyebrow> : null}
        <h2
          className={cn(
            "mt-2 text-2xl font-bold leading-tight sm:text-3xl lg:text-[34px]",
            tone === "light" ? "text-navy-foreground" : "text-navy",
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={cn("mt-2 text-sm sm:text-base", tone === "light" ? "text-navy-foreground/75" : "text-muted-foreground")}>
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
  onClick,
}: {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-8px_var(--brand-orange)] transition-colors hover:bg-brand-orange-dark",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  className,
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-colors",
        tone === "light"
          ? "border-navy-foreground/40 text-navy-foreground hover:bg-navy-foreground/10"
          : "border-navy/25 text-navy hover:bg-navy/5",
        className,
      )}
    >
      {children}
    </button>
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
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {children}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-navy transition-colors hover:bg-cream"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-navy transition-colors hover:bg-cream"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
