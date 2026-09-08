import { createFileRoute } from "@tanstack/react-router";
import { Clock, ArrowRight, Share2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";

type BlogPost = {
  title: string;
  cat: string;
  author: string;
  authorRole: string;
  date: string;
  read: string;
  excerpt: string;
  body: { heading?: string; text: string }[];
  tags: string[];
  related: { title: string; slug: string; cat: string; read: string }[];
};

const postData: Record<string, BlogPost> = {
  "piles-surgery-guide": {
    title: "Piles: when surgery is the right choice",
    cat: "Proctology",
    author: "Dr. Karan Mehta",
    authorRole: "MS (General Surgery), 11 Years Experience",
    date: "September 3, 2026",
    read: "5 min read",
    excerpt: "Not every case of piles needs surgery. Here's how specialists decide when laser treatment is the best option.",
    body: [
      { text: "Piles — or haemorrhoids — affect an estimated one in three adults at some point in their lives. Yet many patients delay seeking care because they assume surgery is the only option, or because they find the subject uncomfortable to discuss. The truth is more nuanced." },
      { heading: "When do piles not need surgery?", text: "Grade 1 and early Grade 2 piles often respond well to dietary changes and topical treatments. Increasing fibre intake, staying hydrated and avoiding prolonged sitting on the toilet can resolve mild haemorrhoids completely. We always explore conservative management first." },
      { heading: "The tipping point: when is surgery indicated?", text: "Surgery becomes the right conversation when haemorrhoids are Grade 2 or above and don't respond to medication, when there is persistent bleeding (even if not heavy), when pain interrupts daily life, or when a prolapsed haemorrhoid cannot be pushed back manually." },
      { heading: "Why laser over traditional surgery?", text: "Laser proctoplasty has replaced traditional haemorrhoidectomy as the first-choice procedure at Prime Care. The laser cauterises the feeding blood vessel without incision, which means near-zero blood loss, no visible wound and a dramatically faster recovery. Most patients go home the same day and return to desk work within 3 days." },
      { heading: "What the procedure looks like", text: "Under short general anaesthesia (or spinal, depending on the case), a small fibre-optic probe delivers laser energy precisely to the haemorrhoidal tissue. The whole procedure takes around 20–30 minutes. There are no stitches, no dressings and no dietary restrictions beyond the first 24 hours." },
      { heading: "Recovery expectations", text: "Days 1–2: Mild discomfort, managed with paracetamol. Days 3–5: Most patients feel comfortable enough to resume light activity. Day 7: Follow-up appointment to confirm healing. Week 3: Full recovery for most patients." },
      { text: "If you've been managing symptoms on your own for more than 4–6 weeks, or if bleeding has occurred more than once, a specialist opinion is worth seeking. At Prime Care the first consultation is free — and you'll leave knowing exactly where you stand." },
    ],
    tags: ["Piles", "Laser Surgery", "Proctology", "Recovery"],
    related: [
      { title: "Anal Fissure Treatment: what patients need to know", slug: "anal-fissure-guide", cat: "Proctology", read: "4 min read" },
      { title: "What to eat in the first week after colorectal surgery", slug: "post-colorectal-diet", cat: "Nutrition", read: "3 min read" },
      { title: "How cashless surgery approval actually works", slug: "cashless-insurance-guide", cat: "Insurance", read: "6 min read" },
    ],
  },
};

const fallbackPost: BlogPost = {
  title: "Health & Surgery Guide",
  cat: "General",
  author: "Prime Care Team",
  authorRole: "Medical Content Team",
  date: "September 2026",
  read: "5 min read",
  excerpt: "A patient-focused guide to understanding your surgical options.",
  body: [
    { text: "At Prime Care, we believe informed patients make better decisions and recover faster. This guide walks through what you need to know before, during and after your procedure." },
    { heading: "Before your surgery", text: "Your specialist will walk through every aspect of the procedure during the free first consultation. Feel free to ask about anaesthesia, expected recovery time, cost and insurance coverage." },
    { heading: "On surgery day", text: "Our care coordinator will be with you from the moment you arrive. We manage all hospital paperwork and insurance pre-authorisation so you can focus entirely on your health." },
    { heading: "Recovery", text: "Most minimally invasive procedures at Prime Care allow same-day or next-day discharge. Your care coordinator will provide a written recovery plan and schedule follow-up consultations." },
  ],
  tags: ["Surgery", "Patient Guide", "Recovery"],
  related: [
    { title: "How cashless surgery approval actually works", slug: "cashless-insurance-guide", cat: "Insurance", read: "6 min read" },
    { title: "Pre-surgery checklist: 14 things to do before your operation", slug: "pre-surgery-checklist", cat: "Recovery", read: "4 min read" },
  ],
};

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = postData[params.slug] ?? fallbackPost;
    return {
      meta: [
        { title: `${post.title} | Prime Care Healthfeed` },
        { name: "description", content: post.excerpt },
      ],
    };
  },
  component: BlogDetail,
});

function BlogDetail() {
  const { slug } = Route.useParams();
  const post = postData[slug] ?? fallbackPost;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">Home</a>
            <span>/</span>
            <a href="/blog" className="hover:text-brand-orange">Healthfeed</a>
            <span>/</span>
            <span className="font-medium text-ink line-clamp-1">{post.title}</span>
          </Container>
        </nav>

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.6fr]">
          {/* Article */}
          <article className="min-w-0">
            <span className="w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
              {post.cat}
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-snug text-navy sm:text-3xl lg:text-4xl">{post.title}</h1>
            <p className="mt-3 text-base text-muted-foreground italic">{post.excerpt}</p>

            <div className="mt-5 flex items-center gap-4 border-b border-border pb-5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-bold text-navy-foreground">
                {post.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.authorRole}</p>
              </div>
              <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                <span>{post.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read}</span>
                <button aria-label="Share" className="ml-2 text-brand-orange">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="prose prose-sm sm:prose-base mt-8 max-w-none text-ink/80 [&>h2]:mt-8 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-navy [&>p]:mt-4 [&>p]:leading-relaxed">
              {post.body.map((block, i) => (
                <div key={i}>
                  {block.heading && <h2>{block.heading}</h2>}
                  <p>{block.text}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink/70 border border-border">{t}</span>
              ))}
            </div>

            {/* Related articles */}
            {post.related.length > 0 && (
              <section className="mt-12">
                <Eyebrow>Read next</Eyebrow>
                <div className="mt-4 space-y-3">
                  {post.related.map((r) => (
                    <a key={r.slug} href={`/blog/${r.slug}`} className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-cream p-4 transition-shadow hover:shadow-sm">
                      <div>
                        <span className="text-[11px] font-semibold text-brand-orange">{r.cat}</span>
                        <p className="mt-0.5 text-sm font-semibold text-navy group-hover:text-brand-orange transition-colors">{r.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{r.read}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ConsultForm />
            <div className="rounded-lg border border-border bg-cream p-5">
              <p className="text-sm font-semibold text-navy">Browse more topics</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Proctology", "Laparoscopy", "Recovery", "Insurance", "Orthopedics", "Gynaecology"].map((t) => (
                  <a
                    key={t}
                    href="/blog"
                    className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-ink/70 border border-border hover:border-brand-orange hover:text-brand-orange transition-colors"
                  >
                    {t}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
