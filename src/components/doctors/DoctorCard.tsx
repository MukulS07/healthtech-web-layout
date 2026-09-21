import { Building2, MapPin, Phone, Star } from "lucide-react";
import { OrangeButton, OutlineButton } from "@/components/home/primitives";
import { cn } from "@/lib/utils";
import { BOOK_LABEL_SHORT, telHref } from "@/lib/site";
import { A } from "@/components/common/A";
import { track } from "@/lib/track";

export interface DoctorCardData {
  id: string;
  name: string;
  initials?: string;
  slug: string;
  specialty: string;
  cred: string;
  exp: number | null;
  rating: string | null;
  reviewCount?: number;
  city: string;
  locality?: string;
  img: string;
  hospital?: { name: string; slug: string; locality: string } | null;
}

/**
 * Real photo when the doctor has one; otherwise a neutral initials avatar. Never a stock face —
 * rotating stock photos across real doctors reads as fake (and got genders wrong).
 */
export function DoctorAvatar({
  name,
  initials,
  img,
  className,
}: {
  name: string;
  initials?: string | undefined;
  img?: string | undefined;
  className?: string | undefined;
}) {
  if (img) {
    return <img src={img} alt={name} loading="lazy" className={cn("object-cover", className)} />;
  }
  const letters = initials || name.replace(/^Dr\.\s*/, "").slice(0, 2).toUpperCase();
  return (
    <div
      aria-hidden
      className={cn(
        "grid place-items-center bg-gradient-to-br from-primary/15 to-brand-orange-soft font-bold text-primary",
        className,
      )}
    >
      {letters}
    </div>
  );
}

export function RatingChip({ rating, reviewCount }: { rating: string | null; reviewCount?: number | undefined }) {
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy shadow-sm">
      <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {rating}
      {reviewCount ? <span className="font-medium text-muted-foreground">({reviewCount})</span> : null}
    </span>
  );
}

/**
 * The one doctor card used everywhere (directory, speciality, city, homepage).
 * `layout="row"` is the compact mobile-friendly list row; `layout="card"` the grid/carousel card.
 */
export function DoctorCard({
  doctor: d,
  layout = "card",
  className,
}: {
  doctor: DoctorCardData;
  layout?: "card" | "row";
  className?: string;
}) {
  const profileHref = d.slug ? `/doctors/${d.slug}` : "/doctors";
  const where = [d.hospital?.name, d.hospital?.locality || d.locality, d.city].filter(Boolean);
  const bookHref = `/contact?doctor=${encodeURIComponent(d.name)}${d.city ? `&city=${encodeURIComponent(d.city)}` : ""}`;
  // Who patients actually ring and open, for the admin Call & WhatsApp report.
  const trackTarget = { targetType: "doctor" as const, targetId: d.id, targetName: d.name, city: d.city };

  const actions = (
    <div className="flex gap-2">
      <A
        href={telHref}
        className="flex-1"
        aria-label={`Call about ${d.name}`}
        onClick={() => track({ type: "call", ...trackTarget })}
      >
        <OutlineButton className="w-full justify-center px-2 py-2 text-xs">
          <Phone className="h-3 w-3" /> Call
        </OutlineButton>
      </A>
      <A href={bookHref} className="flex-1">
        <OrangeButton className="w-full justify-center px-2 py-2 text-xs">{BOOK_LABEL_SHORT}</OrangeButton>
      </A>
    </div>
  );

  const details = (
    <>
      <h3 className="truncate text-base font-bold text-navy">{d.name}</h3>
      {d.specialty ? <p className="mt-0.5 truncate text-xs font-semibold text-primary">{d.specialty}</p> : null}
      {d.cred ? <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{d.cred}</p> : null}
      {d.exp ? (
        <p className="mt-1.5 text-xs font-semibold text-navy">
          {d.exp} {d.exp === 1 ? "year" : "years"} experience
        </p>
      ) : null}
      {d.hospital?.name ? (
        <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
          <Building2 className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{d.hospital.name}</span>
        </p>
      ) : null}
      {where.length > (d.hospital?.name ? 1 : 0) ? (
        <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{[d.hospital?.locality || d.locality, d.city].filter(Boolean).join(", ")}</span>
        </p>
      ) : null}
    </>
  );

  if (layout === "row") {
    return (
      <article className={cn("min-w-0 rounded-lg border border-border bg-background p-3 shadow-sm", className)}>
        <A href={profileHref} className="flex gap-3" onClick={() => track({ type: "profile_click", ...trackTarget })}>
          <DoctorAvatar name={d.name} initials={d.initials} img={d.img} className="h-14 w-14 shrink-0 rounded-full text-base" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">{details}</div>
              <RatingChip rating={d.rating} reviewCount={d.reviewCount} />
            </div>
          </div>
        </A>
        <div className="mt-3">{actions}</div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <A href={profileHref} className="block" onClick={() => track({ type: "profile_click", ...trackTarget })}>
        <div className="relative">
          <DoctorAvatar name={d.name} initials={d.initials} img={d.img} className="h-44 w-full text-4xl" />
          <span className="absolute right-3 top-3">
            <RatingChip rating={d.rating} reviewCount={d.reviewCount} />
          </span>
        </div>
        <div className="p-4 pb-0">{details}</div>
      </A>
      <div className="p-4">
        <A href={profileHref} className="mb-2 block text-center text-xs font-semibold text-primary hover:underline">
          View profile
        </A>
        {actions}
      </div>
    </article>
  );
}
