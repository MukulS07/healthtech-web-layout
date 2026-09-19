import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";
import { BLOG_AUTHOR, BLOG_POSTS } from "@/data/blog";
import { seo, breadcrumbLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/")({
  head: () =>
    seo({
      title: "Healthfeed — Surgery & Health Guides",
      description:
        "Plain-language guides on common conditions, surgical treatments, recovery and health insurance from the Go Surgery editorial team.",
      path: "/blog",
      jsonLd: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Healthfeed", path: "/blog" }])],
    }),
  component: BlogIndex,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function BlogIndex() {
  const categories = useMemo(() => ["All", ...new Set(BLOG_POSTS.map((p) => p.category))], []);
  const [cat, setCat] = useState("All");
  const posts = cat === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === cat);
  const [featured, ...rest] = posts;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Healthfeed</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Surgery & Health Guides</h1>
            <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">
              Practical, plain-language articles to help you understand conditions, prepare for
              surgery and recover well. General information only — not a substitute for advice from
              your own doctor.
            </p>
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold",
                    cat === c ? "border-navy bg-navy text-white" : "border-border bg-background text-navy hover:border-navy/30",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {featured ? (
              <a href={`/blog/${featured.slug}`} className="group mb-8 block rounded-xl border border-border bg-cream p-6 transition-shadow hover:shadow-md sm:p-8">
                <span className="rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">{featured.category}</span>
                <h2 className="mt-4 text-2xl font-bold text-navy group-hover:text-primary sm:text-3xl">{featured.title}</h2>
                <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">{featured.excerpt}</p>
                <p className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{BLOG_AUTHOR}</span>·<span>{formatDate(featured.published)}</span>·
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readMinutes} min read</span>
                </p>
              </a>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col justify-between rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div>
                    <span className="rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">{p.category}</span>
                    <h3 className="mt-4 text-base font-bold leading-snug text-navy group-hover:text-primary">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                  </div>
                  <p className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(p.published)} · {p.readMinutes} min read</span>
                    <ArrowRight className="h-4 w-4 text-brand-orange" />
                  </p>
                </a>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
