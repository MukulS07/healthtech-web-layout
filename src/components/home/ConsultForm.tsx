import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Lock, MessageCircle } from "lucide-react";
import { OrangeButton } from "./primitives";
import { cn } from "@/lib/utils";
import { submitConsultationFn } from "@/lib/server-functions/consultations";
import { track } from "@/lib/track";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLocale, useT } from "@/lib/i18n/context";
import { Emph, WithLink } from "@/lib/i18n/rich";
import { CONDITIONS, SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { CALLBACK_PHRASE, CALLER, cap, CITIES, DEFAULT_WORDING, promiseEnabled, whatsappHref } from "@/lib/site";
import { A } from "@/components/common/A";

/** Options for the "treatment or condition" select, grouped by speciality. */
function useInterestGroups() {
  const t = useT();
  return useMemo(
    () =>
      SPECIALITIES.map((s) => ({
        label: s.name,
        options: [
          { value: `s:${s.slug}`, label: t("form.generalConsult", { spec: s.name }) },
          ...CONDITIONS.filter((c) => c.speciality === s.slug).map((c) => ({ value: `c:${c.slug}`, label: c.name })),
          ...TREATMENTS.filter((t) => t.speciality === s.slug).map((t) => ({ value: `t:${t.slug}`, label: t.name })),
        ],
      })),
    [t],
  );
}

const PREFERRED_CITY_KEY = "gs-city";

/**
 * The lead form. No account needed — a login wall in front of the first enquiry was the site's
 * biggest drop-off. Patients can optionally create an account afterwards to track the request.
 */
export function ConsultForm({
  className,
  defaultInterest,
  defaultCity,
  doctorName,
  title,
  showDetails = false,
}: {
  className?: string | undefined;
  /** Preselect e.g. "s:proctology", "c:piles", "t:laser-piles-surgery". */
  defaultInterest?: string | undefined;
  defaultCity?: string | undefined;
  doctorName?: string | undefined;
  title?: React.ReactNode;
  /** Extra fields for the full booking page: email, preferred date, message. */
  showDetails?: boolean;
  /** @deprecated kept so existing call sites compile; the account bar was removed. */
  hideAccountBar?: boolean;
}) {
  const groups = useInterestGroups();
  const t = useT();
  const locale = useLocale();
  const { user } = useCurrentUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(defaultInterest ?? "");
  const [city, setCity] = useState(defaultCity ?? "");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  // Unticked by default. A pre-ticked box isn't affirmative consent under the DPDP Act, and it
  // makes the consent record worth little if someone later disputes being called.
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [doneMessage, setDoneMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name);
    setPhone((v) => v || user.phone.replace(/\D/g, "").slice(-10));
    setEmail((v) => v || user.email);
  }, [user]);

  // Remember the visitor's city (shared with the header city picker).
  useEffect(() => {
    if (defaultCity) return;
    try {
      const saved = localStorage.getItem(PREFERRED_CITY_KEY);
      if (saved) setCity((v) => v || saved);
    } catch {
      /* storage unavailable */
    }
  }, [defaultCity]);

  const inputClass =
    "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Checked here as well as on the server so the message arrives in the reader's language; the
    // server's own checks (and its English messages) remain the authority.
    if (name.trim().length < 2) return void setError(t("form.errName"));
    if (phone.replace(/\D/g, "").length < 10) return void setError(t("form.errPhone"));
    if (!interest) return void setError(t("form.errInterest"));
    if (!city) return void setError(t("form.errCity"));
    if (!consent) return void setError(t("form.errConsent"));
    setStatus("sending");
    try {
      const res = await submitConsultationFn({
        data: {
          name,
          phone,
          interest,
          city,
          consent,
          email: showDetails ? email : undefined,
          preferredDate: showDetails ? preferredDate : undefined,
          message: showDetails ? message : undefined,
          doctorName,
          sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
        },
      });
      if (res.success) {
        setDoneMessage(locale !== "en" && DEFAULT_WORDING ? t("consult.received") : res.message);
        setStatus("done");
        // Counts alongside calls and WhatsApp clicks in the admin report, so the care team can see
        // which pages actually produce enquiries rather than just traffic.
        track({
          type: "enquiry",
          targetType: doctorName ? "doctor" : "site",
          ...(doctorName ? { targetName: doctorName } : {}),
          city,
        });
        try {
          localStorage.setItem(PREFERRED_CITY_KEY, city);
        } catch {
          /* ignore */
        }
      } else {
        setError(locale !== "en" ? t("form.errSubmit") : res.error);
        setStatus("idle");
      }
    } catch {
      setError(t("form.errSubmit"));
      setStatus("idle");
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-navy/10 bg-background shadow-sm", className)}>
      <div className="border-b border-border bg-brand-orange-soft px-5 py-4">
        <p className="text-base font-bold text-navy">
          {title ??
            (promiseEnabled("free-consult") ? (
              <>
                Book a <span className="text-primary">free consultation</span>
              </>
            ) : (
              <Emph text={t("consult.title")} />
            ))}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {doctorName
            ? t("consult.subDoctor", { doctor: doctorName })
            : DEFAULT_WORDING
              ? t("consult.subCallback")
              : `Share a few details — ${CALLER} will call you back ${CALLBACK_PHRASE}.`}
        </p>
      </div>

      {status === "done" ? (
        <div className="space-y-4 p-5 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <div>
            <p className="text-base font-bold text-navy">{t("consult.thanks", { name: name.split(" ")[0] ?? "" })}</p>
            <p className="mt-1 text-sm text-muted-foreground">{doneMessage}</p>
          </div>
          <ol className="space-y-1.5 rounded-lg bg-cream p-3 text-left text-xs text-ink/80">
            <li>
              {DEFAULT_WORDING
                ? t("consult.step1", { phone: phone.replace(/\D/g, "").slice(-10) })
                : `1. ${cap(CALLER)} calls you on ${phone.replace(/\D/g, "").slice(-10)}.`}
            </li>
            <li>{t("consult.step2")}</li>
            <li>{t("consult.step3")}</li>
          </ol>
          <A href={whatsappHref(`Hi, I just requested a consultation (${name}).`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
            <MessageCircle className="h-4 w-4" /> {t("consult.whatsappChat")}
          </A>
          {!user ? (
            <p className="text-xs text-muted-foreground">
              <WithLink
                text={t("consult.track")}
                link={
                  <A href="/account" className="font-semibold text-primary hover:underline">
                    {t("consult.createAccount")}
                  </A>
                }
              />
            </p>
          ) : null}
        </div>
      ) : (
        <form className="space-y-3 p-5" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="sr-only">{t("form.fullName")}</span>
            <input className={inputClass} placeholder={`${t("form.fullName")} *`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="flex overflow-hidden rounded-md border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
            <span className="grid place-items-center border-r border-border bg-cream px-3 text-sm font-semibold text-navy">+91</span>
            <span className="sr-only">{t("form.mobile")}</span>
            <input
              className="w-full bg-background px-4 py-3 text-sm text-ink outline-none placeholder:text-muted-foreground"
              placeholder={`${t("form.mobile")} *`}
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={14}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ""))}
              required
            />
          </label>
          <label className="block">
            <span className="sr-only">{t("form.treatmentOrCondition")}</span>
            <select className={inputClass} value={interest} onChange={(e) => setInterest(e.target.value)} required>
              <option value="" disabled>
                {t("form.selectTreatment")} *
              </option>
              {groups.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">{t("form.city")}</span>
            <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required>
              <option value="" disabled>
                {t("form.selectCity")} *
              </option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="Other">{t("form.otherCity")}</option>
            </select>
          </label>

          {showDetails ? (
            <>
              <input className={inputClass} type="email" placeholder={t("form.emailOptional")} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="block text-xs font-medium text-muted-foreground">
                {t("form.preferredDateOptional")}
                <input
                  className={cn(inputClass, "mt-1")}
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </label>
              <textarea
                className={cn(inputClass, "min-h-[88px] resize-y")}
                placeholder={t("form.describeConcern")}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </>
          ) : null}

          <label className="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground">
            <input type="checkbox" className="mt-0.5 accent-[var(--primary)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              <WithLink
                text={t("form.consent")}
                link={
                  <A href="/privacy" className="underline">
                    {t("form.consentLink")}
                  </A>
                }
              />
            </span>
          </label>

          {error ? <p className="text-xs font-medium text-destructive" role="alert">{error}</p> : null}

          <OrangeButton type="submit" disabled={status === "sending"} className="w-full">
            {status === "sending" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("form.sending")}
              </span>
            ) : (
              t("form.submit")
            )}
          </OrangeButton>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" /> {t("form.secure")}
          </p>
        </form>
      )}
    </div>
  );
}
