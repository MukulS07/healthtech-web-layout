import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Search, Star, X } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow, OrangeButton } from "@/components/home/primitives";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { submitReviewFn } from "@/lib/server-functions/reviews";
import { CITIES } from "@/lib/site";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviews_/write")({
  validateSearch: (s: Record<string, unknown>) => ({
    doctor: typeof s["doctor"] === "string" ? (s["doctor"] as string) : undefined,
  }),
  head: () =>
    seo({
      title: "Write a Review",
      description: "Share your experience with a Go Surgery doctor to help other patients choose with confidence.",
      path: "/reviews/write",
      noindex: true,
    }),
  component: WriteReviewPage,
});

type PickedDoctor = { slug: string; name: string; specialty: string; city: string };
const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

function WriteReviewPage() {
  const [doctorQuery, setDoctorQuery] = useState("");
  const [options, setOptions] = useState<PickedDoctor[]>([]);
  const [searching, setSearching] = useState(false);
  const [doctor, setDoctor] = useState<PickedDoctor | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [treatment, setTreatment] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  useEffect(() => {
    const term = doctorQuery.trim();
    if (doctor || term.length < 3) {
      setOptions([]);
      return;
    }
    let live = true;
    setSearching(true);
    const t = setTimeout(() => {
      getDoctorsFn({ data: { query: term, limit: 8 } })
        .then((res) => live && res.success && setOptions(res.doctors.map((d) => ({ slug: d.slug, name: d.name, specialty: d.specialty, city: d.city }))))
        .finally(() => live && setSearching(false));
    }, 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [doctorQuery, doctor]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!doctor) return setError("Please choose the doctor who treated you.");
    if (!rating) return setError("Please choose a star rating.");
    setState("sending");
    const res = await submitReviewFn({ data: { doctorSlug: doctor.slug, patientName: name, rating, comment, city, treatment } }).catch(() => null);
    if (res?.success) setState("done");
    else {
      setState("idle");
      setError(res && !res.success ? res.error : "Could not submit your review. Please try again.");
    }
  };

  return (
    <div className="bg-background">
      <Header />
      <main className="bg-cream py-12">
        <Container className="max-w-2xl">
          <Eyebrow>Patient reviews</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold text-navy">Write a Review</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your honest experience helps other patients. Reviews are checked by our team before they're
            published — we don't edit what you write, but we remove anything abusive, promotional or
            containing personal medical details of others.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-background p-6 shadow-sm">
            {state === "done" ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 text-lg font-bold text-navy">Thank you for your review!</p>
                <p className="mt-1 text-sm text-muted-foreground">It will appear once our team has checked it.</p>
                <a href="/reviews" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Read other reviews</a>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-navy">Doctor who treated you *</p>
                  {doctor ? (
                    <div className="flex items-center justify-between rounded-md border border-primary/40 bg-cream px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-navy">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{[doctor.specialty, doctor.city].filter(Boolean).join(" · ")}</p>
                      </div>
                      <button type="button" aria-label="Change doctor" onClick={() => { setDoctor(null); setDoctorQuery(""); }} className="text-muted-foreground hover:text-navy">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <label className="flex items-center gap-2 rounded-md border border-border px-3 focus-within:border-primary">
                        <Search className="h-4 w-4 text-brand-orange" />
                        <input className="w-full bg-transparent py-3 text-sm outline-none" placeholder="Type the doctor's name" value={doctorQuery} onChange={(e) => setDoctorQuery(e.target.value)} />
                        {searching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                      </label>
                      {options.length ? (
                        <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-md border border-border bg-background p-1 shadow-lg">
                          {options.map((o) => (
                            <li key={o.slug}>
                              <button type="button" onClick={() => setDoctor(o)} className="w-full rounded px-3 py-2 text-left hover:bg-cream">
                                <span className="block text-sm font-semibold text-navy">{o.name}</span>
                                <span className="block text-xs text-muted-foreground">{[o.specialty, o.city].filter(Boolean).join(" · ")}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-navy">Your rating *</p>
                  <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
                        <Star className={cn("h-8 w-8", n <= (hover || rating) ? "fill-brand-orange text-brand-orange" : "text-border")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
                  <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="">Your city (optional)</option>
                    {CITIES.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <input className={inputClass} placeholder="Treatment you had (e.g. laser piles surgery)" value={treatment} onChange={(e) => setTreatment(e.target.value)} maxLength={80} />
                <div>
                  <textarea
                    className={cn(inputClass, "min-h-[140px] resize-y")}
                    placeholder="Tell others about your experience — the consultation, the procedure, recovery and support. (At least 40 characters.)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={3000}
                    required
                  />
                  <p className={cn("mt-1 text-right text-[11px]", comment.trim().length < 40 ? "text-muted-foreground" : "text-primary")}>
                    {comment.trim().length} / 40 minimum
                  </p>
                </div>
                {error ? <p className="text-xs font-medium text-destructive" role="alert">{error}</p> : null}
                <OrangeButton type="submit" disabled={state === "sending"} className="w-full">
                  {state === "sending" ? "Submitting..." : "Submit review"}
                </OrangeButton>
                <p className="text-center text-[11px] text-muted-foreground">
                  By submitting you confirm this is your genuine experience. See our <a href="/privacy" className="underline">privacy policy</a>.
                </p>
              </form>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
