import { createFileRoute } from "@tanstack/react-router";
import { Star, Quote } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow } from "@/components/home/primitives";

const tags = ["All", "Highly Recommended", "Recommend for Precision", "Excellent Recovery", "Best Insurance Support", "5 Star Care"];

const reviews = [
  { tag: "HIGHLY RECOMMENDED", quote: "From booking to discharge, everything was handled for me. I was back at work within four days of piles surgery. The care coordinator called every single day.", name: "Rohan M.", treatment: "Piles Surgery", city: "Bangalore", rating: 5 },
  { tag: "RECOMMEND FOR PRECISION", quote: "The insurance approval came through in under an hour. Zero paperwork for my family — the team at Prime Care handled absolutely everything.", name: "Kavita S.", treatment: "Hernia Repair", city: "Pune", rating: 5 },
  { tag: "EXCELLENT RECOVERY", quote: "My surgeon explained every step patiently and calmly. The follow-up calls even after discharge made a real difference to my recovery confidence.", name: "Imran A.", treatment: "Laparoscopic Surgery", city: "Hyderabad", rating: 5 },
  { tag: "BEST INSURANCE SUPPORT", quote: "I was skeptical about cashless treatment. But Prime Care got my HDFC policy pre-approved within 45 minutes. I paid zero out of pocket.", name: "Deepa R.", treatment: "Cataract Surgery", city: "Delhi NCR", rating: 5 },
  { tag: "HIGHLY RECOMMENDED", quote: "The hospital was spotless, the team was professional, and I went home the same evening. My husband could not believe how quick the knee surgery was.", name: "Sunita P.", treatment: "Knee Replacement", city: "Mumbai", rating: 4 },
  { tag: "5 STAR CARE", quote: "As someone who had been putting off hernia surgery for two years, I wish I had come to Prime Care sooner. No drama, no pain, great result.", name: "Farhan K.", treatment: "Hernia Repair", city: "Chennai", rating: 5 },
  { tag: "RECOMMEND FOR PRECISION", quote: "Dr. Rao performed my fibroid removal laparoscopically. I discharged the next morning. It was nothing like the horror stories I had heard.", name: "Meghna T.", treatment: "Fibroid Removal", city: "Kochi", rating: 5 },
  { tag: "EXCELLENT RECOVERY", quote: "Free pick-up, free drop, free follow-up — and the surgery itself was completely cashless. I have recommended Prime Care to three friends already.", name: "Vijay S.", treatment: "Kidney Stone Treatment", city: "Bangalore", rating: 5 },
  { tag: "HIGHLY RECOMMENDED", quote: "The care coordinator was available every time I called, before and after surgery. I have never felt so supported through a medical experience.", name: "Priya N.", treatment: "Gallstone Removal", city: "Delhi NCR", rating: 5 },
  { tag: "BEST INSURANCE SUPPORT", quote: "We were worried about costs since my husband needed a hip replacement. The insurance team sorted everything in one day. We paid only the co-pay.", name: "Anita M.", treatment: "Hip Replacement", city: "Ahmedabad", rating: 5 },
  { tag: "5 STAR CARE", quote: "ENT surgery done in under 30 minutes. I stayed just two hours for monitoring and was home for dinner. Remarkable.", name: "Bashir A.", treatment: "ENT Procedure", city: "Lucknow", rating: 5 },
  { tag: "RECOMMEND FOR PRECISION", quote: "The surgeon explained the varicose vein EVLA procedure with complete clarity. Zero discomfort during the procedure, healed beautifully.", name: "Lakshmi V.", treatment: "Varicose Vein Treatment", city: "Hyderabad", rating: 4 },
];

const tagColorMap: Record<string, string> = {
  "HIGHLY RECOMMENDED": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "RECOMMEND FOR PRECISION": "bg-blue-50 text-blue-700 border-blue-200",
  "EXCELLENT RECOVERY": "bg-purple-50 text-purple-700 border-purple-200",
  "BEST INSURANCE SUPPORT": "bg-amber-50 text-amber-700 border-amber-200",
  "5 STAR CARE": "bg-brand-orange-soft text-brand-orange-dark border-brand-orange/20",
};

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Patient Reviews & Stories | Prime Care" },
      { name: "description", content: "Real stories from 2M+ patients. See why patients across India trust Prime Care for surgery and specialist care." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        {/* Stats hero */}
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Built by trusted hands, valued by thousands</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Patient Reviews & Stories</h1>
            <div className="mt-8 flex flex-wrap gap-8">
              {[
                { value: "2M+", label: "Patients Treated" },
                { value: "4.8 / 5", label: "Average Rating" },
                { value: "98%", label: "Would Recommend" },
                { value: "45+", label: "Cities Covered" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-brand-orange sm:text-3xl">{s.value}</p>
                  <p className="mt-0.5 text-xs text-navy-foreground/70">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Star display */}
            <div className="mt-6 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-brand-orange text-brand-orange" />
              ))}
              <span className="ml-2 text-sm font-semibold text-navy-foreground">4.8 out of 5 — from 18,000+ verified reviews</span>
            </div>
          </Container>
        </section>

        {/* Reviews grid */}
        <section className="py-14">
          <Container>
            <SectionHead
              eyebrow="What our patients say"
              title="Verified Patient Stories"
              subtitle="These are fictional placeholder reviews. Real patient stories will be added here."
              align="center"
            />
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:break-inside-avoid [&>*]:mb-5">
              {reviews.map((r, i) => (
                <article key={i} className="rounded-xl border border-border bg-background p-5">
                  <div className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide ${tagColorMap[r.tag] ?? "bg-cream text-ink/70 border-border"}`}>
                    {r.tag}
                  </div>
                  <Quote className="mt-4 h-5 w-5 text-brand-orange opacity-60" />
                  <p className="mt-2 text-sm italic leading-relaxed text-ink/80">"{r.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                      {r.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.treatment} · {r.city}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
