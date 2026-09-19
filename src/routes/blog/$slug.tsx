import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, Clock, Info } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { BLOG_AUTHOR, BLOG_POSTS, getBlogPost } from "@/data/blog";
import { getCondition, getTreatment } from "@/data/catalog";
import { seo, breadcrumbLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return seo({ title: "Article not found", description: "", path: "/blog", noindex: true });
    return seo({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      type: "article",
      jsonLd: [
        {
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published,
          dateModified: post.updated ?? post.published,
          author: { "@type": "Organization", name: BLOG_AUTHOR },
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Healthfeed", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]),
      ],
    });
  },
  component: BlogPostPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const treatments = post.relatedTreatments.map(getTreatment).filter((t): t is NonNullable<typeof t> => Boolean(t));
  const conditions = post.relatedConditions.map(getCondition).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const more = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category)
    .concat(BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category !== post.category))
    .slice(0, 3);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav aria-label="Breadcrumb" className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex flex-wrap items-center gap-2">
            <a href="/" className="hover:text-brand-orange">Home</a>/
            <a href="/blog" className="hover:text-brand-orange">Healthfeed</a>/
            <span className="font-medium text-ink">{post.category}</span>
          </Container>
        </nav>

        <section className="py-10">
          <Container className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
            <article className="min-w-0">
              <Eyebrow>{post.category}</Eyebrow>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-navy sm:text-4xl">{post.title}</h1>
              <p className="mt-3 text-base text-muted-foreground">{post.excerpt}</p>
              <p className="mt-4 flex flex-wrap items-center gap-2 border-b border-border pb-5 text-xs text-muted-foreground">
                <span className="font-semibold text-navy">{BLOG_AUTHOR}</span>·<span>Published {formatDate(post.published)}</span>·
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readMinutes} min read</span>
              </p>
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-cream p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {post.reviewedBy
                  ? `Medically reviewed by ${post.reviewedBy.name}, ${post.reviewedBy.credentials}.`
                  : "General health information, pending review by a named clinician. It isn't medical advice — please consult a doctor about your own situation."}{" "}
                <a href="/editorial-policy" className="underline">Editorial policy</a>
              </p>

              <div className="mt-8 space-y-8">
                {post.sections.map((s) => (
                  <section key={s.heading}>
                    <h2 className="text-xl font-bold text-navy">{s.heading}</h2>
                    {s.paragraphs.map((p, i) => (
                      <p key={i} className="mt-3 text-sm leading-relaxed text-ink/85 sm:text-base">{p}</p>
                    ))}
                    {s.bullets ? (
                      <ul className="mt-3 space-y-2">
                        {s.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/85 sm:text-base">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>

              {treatments.length || conditions.length ? (
                <div className="mt-10 rounded-xl border border-border bg-cream p-5">
                  <p className="text-sm font-bold text-navy">Related on Go Surgery</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {conditions.map((c) => (
                      <a key={c.slug} href={`/conditions/${c.slug}`} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-navy hover:border-primary/40">{c.name}</a>
                    ))}
                    {treatments.map((t) => (
                      <a key={t.slug} href={`/treatments/${t.slug}`} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary hover:border-primary/40">{t.name}</a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-10">
                <p className="text-sm font-bold text-navy">More articles</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {more.map((p) => (
                    <a key={p.slug} href={`/blog/${p.slug}`} className="group rounded-lg border border-border p-4 hover:shadow-sm">
                      <span className="text-[11px] font-semibold text-brand-orange-dark">{p.category}</span>
                      <p className="mt-1 text-sm font-semibold leading-snug text-navy group-hover:text-primary">{p.title}</p>
                      <ArrowRight className="mt-2 h-4 w-4 text-brand-orange" />
                    </a>
                  ))}
                </div>
              </div>
            </article>

            <aside className="lg:sticky lg:top-36 lg:self-start">
              <ConsultForm defaultInterest={conditions[0] ? `c:${conditions[0].slug}` : treatments[0] ? `t:${treatments[0].slug}` : undefined} />
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
