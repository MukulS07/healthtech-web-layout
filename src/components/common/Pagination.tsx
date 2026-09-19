import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Crawlable pagination: real <a href="?page=N"> links (not JS-only buttons), so search engines
 * can reach every page of a directory.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const base = "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-semibold transition-colors";
  return (
    <nav aria-label="Pagination" className={cn("mt-10 flex flex-wrap items-center justify-center gap-1.5", className)}>
      {page > 1 ? (
        <a href={hrefFor(page - 1)} rel="prev" className={cn(base, "border-border text-navy hover:bg-cream")} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </a>
      ) : null}
      {list.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - list[i - 1]! > 1 ? <span className="px-1 text-muted-foreground">…</span> : null}
          <a
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(base, p === page ? "border-navy bg-navy text-white" : "border-border text-navy hover:bg-cream")}
          >
            {p}
          </a>
        </span>
      ))}
      {page < totalPages ? (
        <a href={hrefFor(page + 1)} rel="next" className={cn(base, "border-border text-navy hover:bg-cream")} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : null}
    </nav>
  );
}
