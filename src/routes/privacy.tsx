import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, Eyebrow } from "@/components/home/primitives";

const sections = [
  {
    title: "Information We Collect",
    content: `When you use Prime Care's website or services, we may collect the following types of information:

Personal identification information: name, phone number, email address and city, provided when you fill in any consultation or contact form.

Health information: symptoms, conditions and treatment preferences you share with our care team. This information is used solely to match you with the right specialist and is never disclosed to third parties without your explicit consent.

Usage data: pages visited, time on site, browser type and device information, collected through standard analytics tools to help us improve our service.

Communication records: calls and messages with our care team may be recorded for quality assurance purposes. You will be informed at the start of any recorded interaction.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to:

• Connect you with appropriate specialist surgeons based on your condition and location.
• Coordinate your appointment, hospital admission, insurance pre-authorisation and post-operative support.
• Respond to your enquiries and provide 24x7 care coordination.
• Send appointment reminders and post-treatment follow-up communications (you may opt out at any time).
• Improve our website and services through aggregate, anonymised analytics.
• Comply with legal obligations applicable to healthcare providers in India.

We do not use your health information for marketing purposes. We do not sell your personal data to any third party.`,
  },
  {
    title: "Sharing Your Information",
    content: `Your personal and health information may be shared with:

Partner hospitals and surgeons: to facilitate your consultation, procedure and post-operative care. Shared only to the extent necessary to provide the service.

Insurance partners: with your explicit consent, to process pre-authorisation and cashless claims.

Technology partners: anonymised, aggregated data may be shared with our technology and analytics vendors under strict data processing agreements.

Regulatory authorities: we comply with all applicable Indian healthcare data regulations, including those issued by the Ministry of Health and Family Welfare and the National Digital Health Mission.

We do not share identifiable health data with any commercial third party without your prior written consent.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard technical and organisational security measures to protect your data:

• All data transmissions are encrypted using TLS 1.2 or higher.
• Personal and health data is stored in encrypted databases with restricted access controls.
• Access to patient records is limited to care coordinators and clinical staff directly involved in your care.
• We conduct regular security audits and penetration tests.

No data transmission over the internet is 100% secure. While we use best-practice measures, we cannot guarantee absolute security of data transmitted to our website.`,
  },
  {
    title: "Your Rights",
    content: `You have the following rights with respect to your personal data:

Access: request a copy of the personal data we hold about you.
Correction: ask us to correct inaccurate or incomplete data.
Deletion: request deletion of your data, subject to any legal retention obligations.
Portability: receive your data in a commonly used, machine-readable format.
Objection: object to our processing of your data for particular purposes.

To exercise any of these rights, contact us at privacy@primecare.in. We will respond within 30 days.`,
  },
  {
    title: "Cookies",
    content: `Our website uses cookies to provide a better experience. These include:

Essential cookies: required for the website to function correctly (e.g. session management).
Analytics cookies: help us understand how visitors use our site (e.g. Google Analytics). These are anonymised.
Preference cookies: remember your settings such as language and city selection.

You can control cookies through your browser settings. Disabling essential cookies may affect website functionality.`,
  },
  {
    title: "Children's Privacy",
    content: `Prime Care's services are not directed at children under 18. We do not knowingly collect personal data from anyone under 18 years of age. If a parent or guardian believes their child has provided us with personal information, please contact us and we will promptly delete it.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. Material changes will be communicated by email to registered users or through a prominent notice on our website at least 14 days before the change takes effect. Continued use of our services after changes constitute acceptance of the updated policy.`,
  },
  {
    title: "Contact Us",
    content: `For privacy-related queries or to exercise your data rights, contact our Data Protection Officer:

Email: privacy@primecare.in
Phone: 1800 000 1234 (Mon–Sat, 9 AM–6 PM)
Post: Data Protection Officer, Prime Care Health Pvt. Ltd., Sector 18, Gurugram – 122015, Haryana, India.`,
  },
];

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Prime Care" },
      { name: "description", content: "How Prime Care collects, uses and protects your personal and health information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-12">
          <Container>
            <Eyebrow tone="light">Legal</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-navy-foreground/70">Last updated: September 1, 2026</p>
          </Container>
        </section>

        <section className="py-14">
          <Container className="max-w-3xl">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Prime Care Health Pvt. Ltd. ("Prime Care", "we", "our" or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use and protect data when you use our website (primecare.in) or any of our services.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Please read this policy carefully. If you disagree with its terms, please do not use our services.
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
              This Privacy Policy was last reviewed and updated on 1 September 2026. By using Prime Care's website or services, you acknowledge that you have read and understood this policy.
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
