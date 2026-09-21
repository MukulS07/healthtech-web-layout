import { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Save, Search, X } from "lucide-react";
import { toast } from "sonner";
import { OrangeButton, OutlineButton } from "@/components/home/primitives";
import { getAdminFaqsFn, saveFaqFn, setFaqStatusFn, type AdminFaqFilters } from "@/lib/server-functions/faqs";
import { FAQ_PAGE_TYPES, FAQ_PAGE_LABELS, type FaqPageType } from "@/lib/admin-constants";
import { CONDITIONS, SPECIALITIES, TREATMENTS } from "@/data/catalog";
import { CITIES } from "@/lib/site";
import { AdminEmpty, AdminError, AdminLoading, AdminPanel, Pill, StatCard, inputClass, selectClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type FaqList = Extract<Awaited<ReturnType<typeof getAdminFaqsFn>>, { success: true }>;
type FaqRow = FaqList["faqs"][number];

const blank = {
  id: "",
  question: "",
  answer: "",
  pageType: "general" as FaqPageType,
  pageSlug: "",
  order: 0,
  status: "published" as "published" | "draft",
};

/** Slug choices for the page types we have a fixed catalog for. */
function slugOptions(pageType: FaqPageType): { value: string; label: string }[] {
  if (pageType === "speciality") return SPECIALITIES.map((s) => ({ value: s.slug, label: s.name }));
  if (pageType === "condition") return CONDITIONS.map((c) => ({ value: c.slug, label: c.name }));
  if (pageType === "treatment" || pageType === "cost") return TREATMENTS.map((t) => ({ value: t.slug, label: t.name }));
  if (pageType === "city") return CITIES.map((c) => ({ value: c.slug, label: c.name }));
  return [];
}

/** Add and edit the FAQs that appear on patient-facing pages. */
export function FaqManagement() {
  const [filters, setFilters] = useState<AdminFaqFilters>({});
  const [search, setSearch] = useState("");
  const [data, setData] = useState<FaqList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof blank | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminFaqsFn({ data: filters })
      .then((res) => {
        if (res.success) {
          setData(res);
          setError("");
        } else setError(res.error);
      })
      .catch(() => setError("Could not load FAQs."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filters]);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, query: search || undefined })), 400);
    return () => clearTimeout(t);
  }, [search]);

  const startEdit = (f: FaqRow) =>
    setEditing({
      id: f.id,
      question: f.question,
      answer: f.answer,
      pageType: f.pageType as FaqPageType,
      pageSlug: f.pageSlug,
      order: f.order,
      status: f.status as "published" | "draft",
    });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await saveFaqFn({ data: editing });
    setSaving(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(editing.id ? "FAQ updated" : "FAQ added");
    setEditing(null);
    load();
  };

  const toggle = async (f: FaqRow) => {
    const next = f.status === "published" ? "draft" : "published";
    const res = await setFaqStatusFn({ data: { id: f.id, status: next } });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(next === "draft" ? "Unpublished — patients no longer see it" : "Published");
    load();
  };

  const options = editing ? slugOptions(editing.pageType) : [];

  return (
    <AdminPanel
      title="FAQ management"
      description="Questions patients actually ask, published onto the relevant pages without a deploy."
      actions={
        <OrangeButton onClick={() => setEditing({ ...blank })} className="py-2 text-xs">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add FAQ
        </OrangeButton>
      }
    >
      {error ? <AdminError>{error}</AdminError> : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Published" value={data?.counts.published ?? 0} tone="good" />
        <StatCard label="Drafts" value={data?.counts.draft ?? 0} />
        <StatCard label="Showing" value={data?.faqs.length ?? 0} />
      </div>

      {editing ? (
        <div className="rounded-xl border border-primary/30 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy">{editing.id ? "Edit FAQ" : "New FAQ"}</h3>
            <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-navy">
              Appears on
              <select
                className={cn(selectClass, "mt-1 w-full")}
                value={editing.pageType}
                onChange={(e) => setEditing({ ...editing, pageType: e.target.value as FaqPageType, pageSlug: "" })}
              >
                {FAQ_PAGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {FAQ_PAGE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>

            {editing.pageType !== "general" ? (
              <label className="text-xs font-semibold text-navy">
                Which page
                {options.length ? (
                  <select
                    className={cn(selectClass, "mt-1 w-full")}
                    value={editing.pageSlug}
                    onChange={(e) => setEditing({ ...editing, pageSlug: e.target.value })}
                  >
                    <option value="">Every {FAQ_PAGE_LABELS[editing.pageType].toLowerCase()}</option>
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={cn(inputClass, "mt-1")}
                    placeholder="Page slug, or leave blank for all"
                    value={editing.pageSlug}
                    onChange={(e) => setEditing({ ...editing, pageSlug: e.target.value })}
                  />
                )}
              </label>
            ) : null}
          </div>

          <label className="mt-3 block text-xs font-semibold text-navy">
            Question
            <input
              className={cn(inputClass, "mt-1")}
              placeholder="How long does recovery take?"
              value={editing.question}
              onChange={(e) => setEditing({ ...editing, question: e.target.value })}
            />
          </label>

          <label className="mt-3 block text-xs font-semibold text-navy">
            Answer
            <textarea
              rows={5}
              className={cn(inputClass, "mt-1 resize-y")}
              placeholder="Answer in plain language, the way you'd say it on the phone."
              value={editing.answer}
              onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
            />
          </label>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold text-navy">
              Order
              <input
                type="number"
                className={cn(inputClass, "mt-1 w-24")}
                value={editing.order}
                onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
              />
            </label>
            <label className="text-xs font-semibold text-navy">
              Status
              <select
                className={cn(selectClass, "mt-1 block")}
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value as "published" | "draft" })}
              >
                <option value="published">Published</option>
                <option value="draft">Draft (hidden)</option>
              </select>
            </label>
            <OrangeButton onClick={save} disabled={saving} className="py-2 text-xs">
              <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? "Saving…" : "Save FAQ"}
            </OrangeButton>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            This appears to patients as medical guidance from us. Anything clinical should be checked
            by a clinician before it goes out — save it as a draft until it has been.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <label className="relative flex-1 sm:min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Search FAQs</span>
          <input className={cn(inputClass, "pl-9")} placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select
          aria-label="Page type"
          className={selectClass}
          value={filters.pageType ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, pageType: e.target.value || undefined }))}
        >
          <option value="">All page types</option>
          {FAQ_PAGE_TYPES.map((t) => (
            <option key={t} value={t}>
              {FAQ_PAGE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          className={selectClass}
          value={filters.status ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading && !data ? (
        <AdminLoading label="Loading FAQs…" />
      ) : !data?.faqs.length ? (
        <AdminEmpty>
          No FAQs yet. The hand-written ones already on speciality and treatment pages stay in the
          code — anything you add here is shown alongside them.
        </AdminEmpty>
      ) : (
        <ul className="space-y-2">
          {data.faqs.map((f) => (
            <li key={f.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy">{f.question}</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-ink/75">{f.answer}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Pill tone="info">{FAQ_PAGE_LABELS[f.pageType as FaqPageType]}</Pill>
                    {f.pageSlug ? <Pill>{f.pageSlug}</Pill> : <Pill>every page</Pill>}
                    <Pill tone={f.status === "published" ? "good" : "warning"}>{f.status}</Pill>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <OutlineButton className="px-2 py-1.5 text-xs" onClick={() => startEdit(f)}>
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                  </OutlineButton>
                  <OutlineButton className="px-2 py-1.5 text-xs" onClick={() => toggle(f)}>
                    {f.status === "published" ? (
                      <>
                        <EyeOff className="mr-1 h-3 w-3" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-3 w-3" /> Publish
                      </>
                    )}
                  </OutlineButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}
