import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircleQuestion, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton } from "@/components/home/primitives";
import { submitQuestionFn, getAnsweredQuestionsFn } from "@/lib/server-functions/questions";
import { seo } from "@/lib/seo";
import { useLocale, useT } from "@/lib/i18n/context";

// `value` is what is stored and read by the care team, so it stays English; `key` is the label shown.
const conditionOptions = [
  { value: "Proctology (Piles, Fistula, Fissure)", key: "ask.cProctology" },
  { value: "Gynaecology", key: "spec.gynaecology" },
  { value: "ENT", key: "spec.ent" },
  { value: "Urology", key: "spec.urology" },
  { value: "Orthopedics", key: "spec.orthopaedics" },
  { value: "Ophthalmology", key: "spec.ophthalmology" },
  { value: "General Surgery", key: "spec.general-surgery" },
  { value: "Cosmetic & Aesthetics", key: "ask.cCosmetic" },
  { value: "Something else", key: "form.somethingElse" },
];

export const Route = createFileRoute("/ask-a-question")({
  loader: async () => {
    try {
      return await getAnsweredQuestionsFn();
    } catch {
      return { success: false, questions: [] };
    }
  },
  head: ({ match }) =>
    seo({
      locale: match.context.locale,
      title: "Ask a Question",
      description: "Ask our care team a question about your symptoms or a planned procedure and get a real answer.",
      path: "/ask-a-question",
    }),
  component: AskAQuestionPage,
});

function AskForm() {
  const t = useT();
  const locale = useLocale();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !condition || !message) {
      toast.error(t("ask.fillAll"));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitQuestionFn({
        data: {
          name,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          phone,
          condition,
          message,
        },
      });
      if (res.success) {
        toast.success(locale !== "en" ? t("ask.received") : res.message);
        setName("");
        setAge("");
        setGender("");
        setPhone("");
        setCondition("");
        setMessage("");
      } else {
        toast.error((locale === "en" && res.error) || t("home.genericError"));
      }
    } catch {
      toast.error(t("home.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("form.fullName")} *</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("form.phone")} *</label>
          <input
            className={inputClass}
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("ask.age")}</label>
          <input
            type="number"
            className={inputClass}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">{t("ask.gender")}</label>
          <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">{t("ask.genderNone")}</option>
            <option value="Female">{t("ask.female")}</option>
            <option value="Male">{t("ask.male")}</option>
            <option value="Other">{t("ask.other")}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-navy">{t("ask.condition")} *</label>
        <select
          className={inputClass}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
        >
          <option value="">{t("ask.selectCondition")}</option>
          {conditionOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {t(c.key)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-navy">{t("ask.question")} *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={4}
          placeholder={t("ask.placeholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <OrangeButton type="submit" disabled={isSubmitting} className="w-full py-3 text-base sm:w-auto">
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("form.sending")}
          </span>
        ) : (
          t("ask.submit")
        )}
      </OrangeButton>
    </form>
  );
}

function AskAQuestionPage() {
  const t = useT();
  const { questions } = Route.useLoaderData();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">{t("ask.eyebrow")}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              {t("footer.askQuestion")}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              {t("ask.intro")}
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionHead eyebrow={t("ask.getStarted")} title={t("ask.submitTitle")} />
              <AskForm />
            </div>
            <div className="rounded-xl bg-cream p-6">
              <MessageCircleQuestion className="h-8 w-8 text-brand-orange" />
              <h3 className="mt-3 text-base font-bold text-navy">{t("ask.next")}</h3>
              <ul className="mt-3 space-y-3 text-sm text-ink/80">
                <li className="flex gap-2">
                  <span className="font-bold text-brand-orange">1.</span> {t("ask.step1")}
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-orange">2.</span> {t("ask.step2")}
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-orange">3.</span> {t("ask.step3")}
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                {t("ask.urgent")}
              </p>
            </div>
          </Container>
        </section>

        {questions.length > 0 && (
          <section className="bg-cream py-14">
            <Container className="max-w-3xl">
              <SectionHead eyebrow={t("ask.fromOthers")} title={t("ask.recent")} />
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-border bg-background p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
                      <Stethoscope className="h-3.5 w-3.5" /> {q.condition}
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-navy">{q.message}</h4>
                    <p className="mt-1.5 text-sm text-muted-foreground">{q.answer}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">— {q.answeredBy}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
