import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";
import { SITE } from "@/lib/site";
import { seo } from "@/lib/seo";

const sections = [
  {
    h: "Who writes our content",
    p: [
      `Health guides, condition and treatment pages on ${SITE.name} are written by our editorial team using established medical references and clinical guidelines. We credit content to the "${SITE.name} Editorial Team" rather than attaching a doctor's name to something that doctor didn't write or review.`,
    ],
  },
  {
    h: "Medical review",
    p: [
      "When a named, qualified clinician has reviewed a page, we show their name, qualifications and the review date on that page. Pages that have not yet had a named clinical review say so. We never display a reviewer who hasn't actually reviewed the content.",
    ],
  },
  {
    h: "What our pages are — and aren't",
    p: [
      "Our content is general health education to help you understand your options and prepare better questions for your doctor. It is not a diagnosis or personal medical advice, and it doesn't replace an examination by a qualified doctor.",
      "Typical figures such as operating time, hospital stay and recovery are general ranges. Your own surgeon will tell you what applies to you.",
    ],
  },
  {
    h: "Numbers and claims",
    p: [
      "We only publish statistics we can support. Directory figures (for example the number of surgeons or hospitals listed) describe our directory — they are not claims about patients treated or partnerships. We don't publish success rates or prices we can't substantiate.",
    ],
  },
  {
    h: "Patient reviews",
    p: [
      "Reviews submitted on this website are checked by our team before publication; we don't edit their wording, but we remove abusive or promotional content and anything that identifies other people.",
      "Older reviews come from our directory's existing records, and we are still verifying their source. Reviews that fail automated checks — for example text that is repeated word-for-word across different reviews, a missing doctor name, or a rating outside the normal 1–5 stars — are held back and not shown until they can be checked. Very short reviews are not displayed on public review walls.",
    ],
  },
  {
    h: "Corrections and updates",
    p: [
      `We review our pages periodically and update them when guidance changes. If you spot an error, please email ${SITE.email} with the page link — we'll look into it and correct it promptly.`,
    ],
  },
];

export const Route = createFileRoute("/editorial-policy")({
  head: () =>
    seo({
      title: "Editorial Policy",
      description: `How ${SITE.name} writes, reviews and updates its health content, reviews and statistics.`,
      path: "/editorial-policy",
    }),
  component: EditorialPolicy,
});

function EditorialPolicy() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Our standards</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Editorial Policy</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">
              How we write, review and maintain the health information on this website.
            </p>
          </Container>
        </section>
        <section className="py-12">
          <Container className="max-w-3xl space-y-8">
            {sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-xl font-bold text-navy">{s.h}</h2>
                {s.p.map((p, i) => (
                  <p key={i} className="mt-3 text-sm leading-relaxed text-ink/85 sm:text-base">{p}</p>
                ))}
              </section>
            ))}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
