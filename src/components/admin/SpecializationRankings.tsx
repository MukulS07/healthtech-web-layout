import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pin, Plus, Save, Search, X } from "lucide-react";
import { toast } from "sonner";
import { OrangeButton, OutlineButton } from "@/components/home/primitives";
import { getRankedCombinationsFn, getRankingFn, saveRankingFn } from "@/lib/server-functions/rankings";
import { MAX_PINNED_DOCTORS } from "@/lib/admin-constants";
import { SPECIALITIES } from "@/data/catalog";
import { CITIES } from "@/lib/site";
import { AdminEmpty, AdminLoading, AdminPanel, Pill, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Ranking = Extract<Awaited<ReturnType<typeof getRankingFn>>, { success: true }>;
type Doctor = Ranking["pinned"][number];

/**
 * Pin the surgeons who should lead a speciality's listing in a given city.
 *
 * Candidates are limited to doctors who genuinely match that speciality and city, so a pin can
 * never put someone at the top of a list they don't belong on.
 */
export function SpecializationRankings() {
  const [speciality, setSpeciality] = useState(SPECIALITIES[0]?.slug ?? "");
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [data, setData] = useState<Ranking | null>(null);
  const [pinned, setPinned] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [combos, setCombos] = useState<{ speciality: string; specialityName: string; city: string; count: number }[]>([]);

  const cities = useMemo(() => {
    const term = citySearch.trim().toLowerCase();
    return term ? CITIES.filter((c) => c.name.toLowerCase().includes(term)) : CITIES;
  }, [citySearch]);

  const loadCombos = () => {
    getRankedCombinationsFn()
      .then((res) => {
        if (res.success) setCombos(res.combinations);
      })
      .catch(() => undefined);
  };
  useEffect(loadCombos, []);

  const load = (query?: string) => {
    if (!speciality || !city) return;
    setLoading(true);
    getRankingFn({ data: { speciality, city, ...(query ? { query } : {}) } })
      .then((res) => {
        if (!res.success) {
          toast.error(res.error);
          setData(null);
          return;
        }
        setData(res);
        // Only reset the working list when it isn't mid-edit, so searching for a candidate
        // doesn't silently throw away pins that haven't been saved yet.
        if (!dirty) setPinned(res.pinned);
      })
      .catch(() => toast.error("Could not load rankings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setDirty(false);
    setPinned([]);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speciality, city]);

  useEffect(() => {
    if (!city) return;
    const t = setTimeout(() => load(candidateSearch), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateSearch]);

  const add = (doctor: Doctor) => {
    if (pinned.length >= MAX_PINNED_DOCTORS) {
      toast.error(`You can pin at most ${MAX_PINNED_DOCTORS} doctors per city.`);
      return;
    }
    if (pinned.some((p) => p.id === doctor.id)) return;
    setPinned((p) => [...p, doctor]);
    setDirty(true);
  };

  const remove = (id: string) => {
    setPinned((p) => p.filter((d) => d.id !== id));
    setDirty(true);
  };

  const move = (index: number, delta: number) => {
    setPinned((p) => {
      const next = [...p];
      const target = index + delta;
      if (target < 0 || target >= next.length) return p;
      const a = next[index];
      const b = next[target];
      if (!a || !b) return p;
      next[index] = b;
      next[target] = a;
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await saveRankingFn({ data: { speciality, city, doctorIds: pinned.map((p) => p.id) } });
    setSaving(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(res.count ? `${res.count} doctor(s) pinned for ${city}` : `Pins cleared for ${city}`);
    setDirty(false);
    loadCombos();
    load();
  };

  const specName = SPECIALITIES.find((s) => s.slug === speciality)?.name ?? speciality;
  const alreadyPinned = new Set(pinned.map((p) => p.id));

  return (
    <AdminPanel
      title="Specialisation rankings"
      description={`Pin up to ${MAX_PINNED_DOCTORS} surgeons per speciality per city — they lead the first page of that listing.`}
      actions={
        dirty ? (
          <OrangeButton onClick={save} disabled={saving} className="py-2 text-xs">
            <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? "Saving…" : "Save order"}
          </OrangeButton>
        ) : null
      }
    >
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-white p-3">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Speciality</label>
            <select
              className={cn(inputClass, "mt-1.5")}
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
            >
              {SPECIALITIES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-border bg-white p-3">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">City</label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className={cn(inputClass, "pl-9")}
                placeholder="Search city…"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
              />
            </div>
            <ul className="mt-2 max-h-64 overflow-y-auto">
              {cities.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => setCity(c.name)}
                    className={cn(
                      "w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                      c.name === city ? "bg-primary/10 font-semibold text-primary" : "text-navy",
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
              {cities.length === 0 ? <li className="px-2.5 py-3 text-xs text-muted-foreground">No city matches.</li> : null}
            </ul>
          </div>

          {combos.length ? (
            <div className="rounded-xl border border-border bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Already set up</p>
              <ul className="mt-2 space-y-1">
                {combos.slice(0, 12).map((c) => (
                  <li key={`${c.speciality}-${c.city}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpeciality(c.speciality);
                        setCity(c.city);
                      }}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-navy hover:bg-muted"
                    >
                      {c.specialityName} · {c.city} <span className="text-muted-foreground">({c.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {!city ? (
            <AdminEmpty>Choose a city to manage its rankings.</AdminEmpty>
          ) : loading && !data ? (
            <AdminLoading label="Loading doctors…" />
          ) : !data ? (
            <AdminEmpty>Nothing to show for this combination.</AdminEmpty>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-navy">
                    Pinned for {specName} in {city}
                  </p>
                  <Pill tone={pinned.length ? "good" : "muted"}>
                    {pinned.length} of {MAX_PINNED_DOCTORS}
                  </Pill>
                </div>
                {data.missingPins > 0 ? (
                  <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                    {data.missingPins} pinned doctor(s) are no longer in the directory and have been dropped from this
                    list. Save to clear them.
                  </p>
                ) : null}

                {pinned.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Nothing pinned — this listing is ordered by our normal ranking.
                  </p>
                ) : (
                  <ol className="mt-3 space-y-2">
                    {pinned.map((d, i) => (
                      <li key={d.id} className="flex items-center gap-2 rounded-lg border border-border bg-cream/60 p-2">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-navy">{d.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {[d.specialty, d.exp, d.locality || d.city].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === pinned.length - 1} aria-label="Move down" className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => remove(d.id)} aria-label={`Unpin ${d.name}`} className="rounded p-1 text-red-500 hover:bg-red-50">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-navy">
                    {specName} surgeons in {city}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {data.matchingDoctors.toLocaleString("en-IN")} match this speciality here
                  </span>
                </div>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    className={cn(inputClass, "pl-9")}
                    placeholder="Search by name or area…"
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                  />
                </div>

                {data.candidates.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">No surgeons match that search here.</p>
                ) : (
                  <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto">
                    {data.candidates.map((d) => (
                      <li key={d.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-navy">{d.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {[d.specialty, d.cred, d.exp, d.locality || d.city].filter(Boolean).join(" · ")}
                            {d.rating ? ` · ★ ${d.rating} (${d.reviewCount})` : ""}
                          </p>
                        </div>
                        <OutlineButton
                          className="shrink-0 px-2 py-1.5 text-xs"
                          disabled={alreadyPinned.has(d.id) || pinned.length >= MAX_PINNED_DOCTORS}
                          onClick={() => add(d)}
                        >
                          {alreadyPinned.has(d.id) ? (
                            <>
                              <Pin className="mr-1 h-3 w-3" /> Pinned
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1 h-3 w-3" /> Pin
                            </>
                          )}
                        </OutlineButton>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Pinning puts a surgeon in front of every patient who searches that speciality in that city, so
        only pin people the care team has actually checked. Pins apply to the first page; they don't
        change the total, and they never override the surgical and city filters.
      </p>
    </AdminPanel>
  );
}
