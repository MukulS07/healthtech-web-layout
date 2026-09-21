import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircleQuestion, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow, OrangeButton } from "@/components/home/primitives";
import { submitQuestionFn, getAnsweredQuestionsFn } from "@/lib/server-functions/questions";
import { seo } from "@/lib/seo";

const conditionOptions = [
  "Proctology (Piles, Fistula, Fissure)",
  "Gynaecology",
  "ENT",
  "Urology",
  "Orthopedics",
  "Ophthalmology",
  "General Surgery",
  "Cosmetic & Aesthetics",
  "Something else",
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
      toast.error("Please fill in your name, phone number, condition, and question.");
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
        toast.success(res.message);
        setName("");
        setAge("");
        setGender("");
        setPhone("");
        setCondition("");
        setMessage("");
      } else {
        toast.error(res.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Full Name *</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Phone *</label>
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
          <label className="mb-1.5 block text-xs font-semibold text-navy">Age</label>
          <input
            type="number"
            className={inputClass}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy">Gender</label>
          <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Prefer not to say</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-navy">Condition *</label>
        <select
          className={inputClass}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
        >
          <option value="">Select a condition</option>
          {conditionOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-navy">Your question *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={4}
          placeholder="Describe your symptoms or what you'd like to know…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <OrangeButton type="submit" disabled={isSubmitting} className="w-full py-3 text-base sm:w-auto">
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
          </span>
        ) : (
          "Ask Your Question"
        )}
      </OrangeButton>
    </form>
  );
}

function AskAQuestionPage() {
  const { questions } = Route.useLoaderData();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Ask a doctor</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Ask a Question
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Not ready to book yet? Ask our care team about your symptoms or a planned procedure
              and get a real answer — no obligation.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionHead eyebrow="Get started" title="Submit your question" />
              <AskForm />
            </div>
            <div className="rounded-xl bg-cream p-6">
              <MessageCircleQuestion className="h-8 w-8 text-brand-orange" />
              <h3 className="mt-3 text-base font-bold text-navy">What happens next?</h3>
              <ul className="mt-3 space-y-3 text-sm text-ink/80">
                <li className="flex gap-2">
                  <span className="font-bold text-brand-orange">1.</span> A member of our care
                  team reviews your question.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-orange">2.</span> We connect you with a
                  relevant specialist if a doctor's opinion is needed.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-orange">3.</span> You get a response by
                  phone or WhatsApp.
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                For urgent symptoms, please call 112 or visit your
                nearest emergency room instead of waiting for a reply here.
              </p>
            </div>
          </Container>
        </section>

        {questions.length > 0 && (
          <section className="bg-cream py-14">
            <Container className="max-w-3xl">
              <SectionHead eyebrow="From other patients" title="Recently answered questions" />
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
