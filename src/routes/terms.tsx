import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using the Prime Care website (primecare.in) or any of our services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website or services.

These Terms apply to all visitors, users and others who access or use the service. We may update these Terms from time to time. Continued use of our services after any changes constitutes acceptance of the revised Terms.`,
  },
  {
    title: "Nature of Our Service",
    content: `Prime Care is a healthcare facilitation platform. We connect patients with specialist surgeons, partner hospitals and insurance providers. We are not a hospital, clinic or medical institution.

Prime Care does not provide medical diagnosis or treatment directly. All clinical decisions, diagnoses and treatment plans are made by qualified, registered medical professionals in our partner network.

Nothing on this website constitutes medical advice. Always consult a qualified medical professional for health concerns. In a medical emergency, contact emergency services (108) immediately.`,
  },
  {
    title: "Eligibility",
    content: `Our services are available to individuals who are 18 years of age or older. By using our services, you represent and warrant that you are at least 18 years old.

Parents or legal guardians may use our services on behalf of minors in their care. In such cases, the adult assumes full responsibility for the minor's use of the service.`,
  },
  {
    title: "Consultations and Appointments",
    content: `Free first consultations are offered subject to availability of specialists in your city. Prime Care reserves the right to modify, reschedule or cancel consultations and will notify you in advance where possible.

Appointments are not binding contracts for medical services. Treatment decisions rest with the patient and the treating doctor after the consultation.

Patient information shared with us for the purpose of consultation scheduling will be handled in accordance with our Privacy Policy.`,
  },
  {
    title: "Payments and Refunds",
    content: `Cost estimates provided on our website are indicative only. Final costs are confirmed by the treating hospital and surgeon after clinical assessment.

Prime Care facilitates cashless insurance processing but does not guarantee insurance approval. Insurance decisions are made by the respective insurer.

EMI and payment plan arrangements are facilitated through partner financial institutions, subject to their credit assessment criteria.

Refund policies for advance payments are governed by the specific terms communicated at the time of booking. Contact care@primecare.in for refund queries.`,
  },
  {
    title: "User Conduct",
    content: `When using Prime Care's website or services, you agree not to:

• Provide false or misleading information.
• Impersonate any person or entity.
• Use the service for any unlawful purpose.
• Attempt to gain unauthorised access to our systems or data.
• Use automated tools to scrape, copy or reproduce our content without permission.
• Interfere with other users' access to the service.

We reserve the right to terminate access for any user who violates these terms.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website — including text, graphics, logos, images, treatment guides and software — is the property of Prime Care Health Pvt. Ltd. and is protected by applicable intellectual property laws.

You may not reproduce, distribute, modify or create derivative works from our content without prior written permission. Linking to our website is permitted provided it is done in a manner that does not misrepresent Prime Care or suggest a commercial relationship.`,
  },
  {
    title: "Third-Party Links",
    content: `Our website may contain links to third-party websites (hospital partners, insurance providers, payment processors). These links are provided for convenience and do not constitute an endorsement.

Prime Care has no control over third-party websites and is not responsible for their content, privacy practices or terms. We encourage you to review the terms and privacy policies of any third-party sites you visit.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by applicable law, Prime Care shall not be liable for:

• Any indirect, incidental or consequential damages arising from use of our services.
• Medical outcomes or complications from procedures performed by our partner surgeons or hospitals.
• Insurance denials or delays beyond our control.
• Service interruptions, data loss or unauthorised access despite security measures.

Our maximum aggregate liability for any claim related to these Terms shall not exceed the amount paid by you to Prime Care in the three months preceding the claim.`,
  },
  {
    title: "Disclaimers",
    content: `Prime Care's website and services are provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the website will be error-free, uninterrupted or free of viruses.

Medical information on this website is provided for general information purposes only and should not be used as a substitute for professional medical advice.`,
  },
  {
    title: "Governing Law and Disputes",
    content: `These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Gurugram, Haryana, India.

Before initiating legal proceedings, we encourage you to contact our care team at care@primecare.in to resolve any concerns informally. Most issues can be resolved quickly through direct communication.`,
  },
  {
    title: "Contact",
    content: `For questions about these Terms, contact us at:

Email: legal@primecare.in
Post: Legal Department, Prime Care Health Pvt. Ltd., Sector 18, Gurugram – 122015, Haryana, India.`,
  },
];

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Prime Care" },
      { name: "description", content: "Terms and conditions governing the use of Prime Care's website and services." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Legal</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Terms of Use</h1>
            <p className="mt-3 text-sm text-navy-foreground/70">Last updated: September 1, 2026</p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Please read these Terms of Use carefully before using Prime Care's website or services. These Terms constitute a legally binding agreement between you and Prime Care Health Pvt. Ltd.
            </p>

            <div className="mt-10 space-y-10">
              {sections.map((s, i) => (
                <section key={s.title}>
                  <h2 className="text-lg font-bold text-navy">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {s.content}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-border bg-cream p-5 text-sm text-muted-foreground">
              These Terms of Use were last reviewed and updated on 1 September 2026. By using Prime Care's website or services, you acknowledge that you have read, understood and agree to be bound by these Terms.
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
