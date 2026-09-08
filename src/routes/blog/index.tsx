import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow } from "@/components/home/primitives";

const categories = ["All", "Proctology", "Laparoscopy", "Orthopedics", "ENT", "Gynaecology", "Urology", "Recovery", "Insurance", "Nutrition"];

const allPosts = [
  { title: "Piles: when surgery is the right choice", slug: "piles-surgery-guide", cat: "Proctology", author: "Dr. Karan Mehta", date: "Sep 3, 2026", read: "5 min read", excerpt: "Not every case of piles needs surgery. Here's how specialists decide when laser treatment is the best option." },
  { title: "What to eat in the first week after hernia surgery", slug: "post-hernia-diet", cat: "Recovery", author: "Dr. Pradeep Dutta", date: "Aug 28, 2026", read: "4 min read", excerpt: "Nutrition plays a crucial role in surgical recovery. A dietitian and surgeon walk through the ideal first-week plan." },
  { title: "How cashless surgery approval actually works", slug: "cashless-insurance-guide", cat: "Insurance", author: "Care Team", date: "Aug 22, 2026", read: "6 min read", excerpt: "Insurance jargon made simple — from pre-authorisation to final discharge clearance." },
  { title: "Knee replacement: myths patients still believe", slug: "knee-replacement-myths", cat: "Orthopedics", author: "Dr. Ravi Shankar", date: "Aug 15, 2026", read: "7 min read", excerpt: "We address 7 of the most common misconceptions about knee replacement surgery and recovery." },
  { title: "Understanding laparoscopy: what you're not told", slug: "laparoscopy-guide", cat: "Laparoscopy", author: "Dr. Suresh Babu", date: "Aug 10, 2026", read: "5 min read", excerpt: "A frank look at what laparoscopic surgery involves — before, during and after the theatre." },
  { title: "PCOS and surgery: when medication isn't enough", slug: "pcos-treatment-options", cat: "Gynaecology", author: "Dr. Ananya Rao", date: "Aug 5, 2026", read: "6 min read", excerpt: "A comprehensive guide to surgical options for PCOS, when to consider them, and what recovery looks like." },
  { title: "Kidney stones: shock wave vs laser vs surgery", slug: "kidney-stone-treatment-comparison", cat: "Urology", author: "Dr. Alok Verma", date: "Jul 30, 2026", read: "8 min read", excerpt: "Three common treatment paths for kidney stones — compared by stone size, position and patient fitness." },
  { title: "Tonsillectomy recovery: what to stock at home", slug: "tonsillectomy-recovery-checklist", cat: "ENT", author: "Dr. Meena Pillai", date: "Jul 25, 2026", read: "4 min read", excerpt: "From ice chips to medication timing — a practical checklist for the first ten days after tonsil removal." },
  { title: "Why fibre matters more after colorectal surgery", slug: "fibre-after-surgery", cat: "Nutrition", author: "Care Team", date: "Jul 18, 2026", read: "3 min read", excerpt: "Diet directly affects healing after any colorectal procedure. Here's the science and the practical list." },
  { title: "Varicose veins: compression stockings or EVLA?", slug: "varicose-vein-treatment-options", cat: "Recovery", author: "Dr. Pradeep Dutta", date: "Jul 10, 2026", read: "5 min read", excerpt: "Conservative management vs. laser ablation — which approach works, for which patients." },
  { title: "How anaesthesia is chosen for day-care surgeries", slug: "anaesthesia-guide", cat: "Laparoscopy", author: "Care Team", date: "Jul 5, 2026", read: "5 min read", excerpt: "Local, regional or general — the anaesthesia decision depends on more than just the procedure." },
  { title: "Pre-surgery checklist: 14 things to do before your operation", slug: "pre-surgery-checklist", cat: "Recovery", author: "Care Team", date: "Jun 28, 2026", read: "4 min read", excerpt: "This straightforward checklist covers everything from blood work to what to stop eating — and why each item matters." },
];

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Healthfeed — Surgical & Health Articles | Prime Care" },
      { name: "description", content: "Doctor-reviewed guides on treatments, surgery recovery and insurance. Written for patients, not clinicians." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? allPosts : allPosts.filter((p) => p.cat === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Healthfeed</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Read, Learn & Decide Better</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Doctor-reviewed guides on treatments, recovery and insurance — written for patients, not clinicians.
            </p>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            {/* Category pills */}
            <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === c ? "bg-navy text-navy-foreground" : "bg-cream text-ink/70 hover:text-navy"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">No articles in this category yet.</p>
            ) : (
              <>
                {/* Featured article */}
                {featured && (
                  <a
                    href={`/blog/${featured.slug}`}
                    className="group mb-10 block overflow-hidden rounded-xl border border-border bg-cream transition-shadow hover:shadow-md"
                  >
                    <div className="grid lg:grid-cols-2">
                      <div className="h-56 w-full bg-gradient-to-br from-navy to-brand-blue lg:h-auto" />
                      <div className="p-6 lg:p-8">
                        <span className="w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
                          {featured.cat}
                        </span>
                        <h2 className="mt-3 text-xl font-bold leading-snug text-navy sm:text-2xl group-hover:text-brand-orange transition-colors">
                          {featured.title}
                        </h2>
                        <p className="mt-3 text-sm text-muted-foreground">{featured.excerpt}</p>
                        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{featured.author}</span>
                          <span>·</span>
                          <span>{featured.date}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.read}</span>
                        </div>
                        <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-brand-orange">
                          Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                {/* Article grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <a
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-lg border border-border bg-background p-5 transition-shadow hover:shadow-md"
                    >
                      <div className="h-3 w-full rounded-full bg-gradient-to-r from-navy to-brand-blue" />
                      <span className="mt-4 w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
                        {post.cat}
                      </span>
                      <h2 className="mt-3 flex-1 text-base font-bold leading-snug text-navy group-hover:text-brand-orange transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
