# Pristyn Care-style homepage clone

Build a single, full homepage that closely matches pristyncare.com's structure and look, using the uploaded design system (navy + orange, Lexend type, rounded cards) and the captured page outline. Content will be plausible placeholder copy in the same voice — no real doctor photos, real names, or real phone numbers.

## Look and feel

- Colors: deep navy `#02273B` (header, footer, panel headers), blue `#0D4D7C`–`#125FA3` (hero, banded sections), brand orange `#FF8300`/`#F5820D` (all primary buttons, one highlighted phrase per headline), cream `#F4F0E8` for alternating bands, white cards with light-gray borders and soft shadows.
- Type: Lexend throughout — headings 550–700 weight, body 400; uppercase tracked-out eyebrows above section titles.
- Rounded corners (12–16px), tinted shadows, soft rounded-square icon chips.
- Section rhythm alternates blue → white → cream → white → navy footer.

## Sections (top to bottom)

1. Two-tier sticky header — navy bar with logo mark, city selector, search, menus, orange "Book Free Consultation"; white bar with the specialty nav row (Proctology, Laparoscopy, Gynaecology, ENT, Urology, Vascular, Aesthetics, Orthopedics, Ophthalmology, Fertility, Weight Loss, Dermatology, Our Hospitals).
2. Hero — trust pills (avatar stack + "Trusted by 2M+", 4.8/5 rating), big headline with the brand name in orange, one-line value prop, call CTA, doctor cutout photo, and a floating white "Book FREE Consultation" form card (name, phone, treatment, city, orange submit, privacy microcopy).
3. Trust strip — 4-up icon stat badges (Cashless on 100+ Insurers, USFDA-Approved, Dedicated Team, Free Consultation).
4. Find Specialized Care Near You — tabbed search (Specialities / Treatments / Conditions) plus a specialty tile grid with duotone photo tiles and "View All 20+ Specialities".
5. Patient Experiences — three cards (Pre Surgery / During Surgery / Recovery) with bullet lists and "Watch Video" play buttons.
6. Pristyn Super Specialty Hospitals — blue band with feature pills (NABH, 24/7 Emergency, Robotic Surgery, Zero Infection) and a hospital card carousel with rating badges.
7. Your Journey to Recovery — 6 numbered steps with icon chips.
8. Built by Trusted Hands — doctor card carousel with category chips, credentials, rating, experience, and two-button footers.
9. Stats row — 2M+ Lives Touched, 800+ Hospitals, 25+ Cities, 400+ Surgeons.
10. Cashless Surgery on 100+ Insurers — 30-minute approval, insurer logo grid, "Check Eligibility".
11. Patient testimonials — quote cards with name + city.
12. About Pristyn Care — long-form text with the consultation form card repeating in the right rail.
13. Healthfeed / blog card carousel on a cream band.
14. FAQ accordion.
15. Download App — angled phone mockups, store buttons.
16. Navy footer — link columns, city list, legal strip; sticky mobile call/book bar.

## Technical notes

- Rewrite `src/routes/index.tsx` as the homepage, composed from components under `src/components/home/`.
- Add navy/blue/orange/cream tokens and Lexend to `src/styles.css` (`@theme inline`); Lexend loaded via a `<link>` in `src/routes/__root.tsx`. No hardcoded color utilities in components.
- Carousels: horizontal scroll rows with arrow controls, CSS scroll-snap (no extra libraries).
- Interactive bits are frontend-only: search tabs, accordion, form fields with a "thanks" toast on submit (no backend).
- Imagery: generated placeholder photos (doctor hero cutout, specialty tiles, hospital and doctor cards, app mockup) saved under `src/assets/`.
- Page-specific `head()` with a real title/description/og tags on the index route.
