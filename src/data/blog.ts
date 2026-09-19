/**
 * Healthfeed articles — original patient-education content written for Go Surgery.
 *
 * Byline policy: articles are credited to the "Go Surgery Editorial Team". They previously carried
 * invented doctor bylines ("Dr. Karan Mehta" etc.) who don't exist in our directory — that's gone.
 * `reviewedBy` stays empty until a real, named clinician has actually reviewed a piece; the page
 * shows "Pending medical review" rather than implying a review that hasn't happened.
 */

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  published: string; // ISO date
  updated?: string;
  reviewedBy?: { name: string; credentials: string; profileSlug?: string };
  relatedTreatments: string[];
  relatedConditions: string[];
  sections: BlogSection[];
  readMinutes: number;
}

type RawPost = Omit<BlogPost, "readMinutes">;

const RAW_POSTS: RawPost[] = [
  {
    slug: "piles-surgery-guide",
    title: "Piles: when is surgery the right choice?",
    category: "Proctology",
    excerpt: "Most piles settle with simple changes. Here's how to tell when a procedure makes more sense — and what your options are.",
    published: "2026-06-02",
    relatedTreatments: ["laser-piles-surgery", "stapler-haemorrhoidopexy", "haemorrhoidectomy", "rubber-band-ligation"],
    relatedConditions: ["piles", "anal-fissure"],
    sections: [
      {
        heading: "First, what are piles?",
        paragraphs: [
          "Piles (haemorrhoids) are cushions of blood vessels in the anal canal that have become swollen. Everyone has these cushions — they only become 'piles' when they enlarge, bleed or slip down. Internal piles are graded from 1 (they bleed but stay inside) to 4 (they stay outside and can't be pushed back).",
          "They are extremely common, especially in people who strain on the toilet, sit for long periods, are pregnant or have recently given birth.",
        ],
      },
      {
        heading: "What usually works without surgery",
        paragraphs: ["For grade 1 and many grade 2 piles, the first step is to make bowel movements soft and easy so the swollen vessels can settle:"],
        bullets: [
          "Gradually increase fibre — fruit, vegetables, whole grains, dal, or a psyllium supplement",
          "Drink enough water that your urine stays pale",
          "Don't strain, and don't scroll on your phone on the toilet — long sitting increases pressure",
          "Warm sitz baths for 10–15 minutes ease itching and discomfort",
          "Short courses of prescribed creams or tablets for symptom relief",
        ],
      },
      {
        heading: "Signs a procedure may be the better option",
        paragraphs: ["Consider talking to a surgeon about a procedure when:"],
        bullets: [
          "Bleeding keeps recurring despite several weeks of good habits",
          "Piles come out during bowel movements and have to be pushed back (grade 3) or stay out (grade 4)",
          "Pain, itching or soiling is affecting work, sleep or daily life",
          "You've had repeated flare-ups over months",
        ],
      },
      {
        heading: "The main options, from least to most invasive",
        paragraphs: [
          "Rubber band ligation is a quick clinic procedure for smaller internal piles. Laser haemorrhoidoplasty shrinks piles from inside with a thin laser fibre and usually allows a return to desk work within days. Stapler haemorrhoidopexy lifts larger prolapsing piles back into place. Conventional haemorrhoidectomy removes the piles completely — it has the lowest chance of recurrence but a more painful first couple of weeks.",
          "The right choice depends on the grade and type of piles, any other conditions such as a fissure, and your own priorities about recovery time versus recurrence risk. A good surgeon will explain these trade-offs rather than recommend one technique for everyone.",
        ],
      },
      {
        heading: "Don't ignore bleeding",
        paragraphs: [
          "Piles are the most common cause of bright red rectal bleeding, but not the only one. If you're over 40, have a change in bowel habit, weight loss, anaemia, or a family history of bowel cancer, your doctor may recommend a colonoscopy before treating piles. That's good practice, not over-caution.",
        ],
      },
    ],
  },
  {
    slug: "post-hernia-diet",
    title: "What to eat in the first week after hernia surgery",
    category: "Recovery",
    excerpt: "Soft, fibre-rich food and plenty of fluids help you avoid straining — the most important thing in early recovery.",
    published: "2026-06-10",
    relatedTreatments: ["laparoscopic-hernia-repair", "open-hernia-repair", "umbilical-hernia-repair"],
    relatedConditions: ["inguinal-hernia", "umbilical-hernia"],
    sections: [
      {
        heading: "Why diet matters after hernia repair",
        paragraphs: [
          "The repair needs time to heal and for the mesh to settle into the tissues. Straining on the toilet, heavy coughing and bloating all raise pressure inside the abdomen. Pain medicines — especially opioids — and reduced activity make constipation common in the first few days, so what you eat and drink genuinely matters.",
        ],
      },
      {
        heading: "Day 1–2: light and easy",
        paragraphs: ["Start with small, frequent meals once you feel like eating:"],
        bullets: ["Clear soups, dal water, coconut water", "Khichdi, curd rice, idli, upma", "Bananas, papaya, stewed apple", "Plenty of water through the day"],
      },
      {
        heading: "Day 3–7: build up fibre gradually",
        paragraphs: ["Move back towards a normal home diet, emphasising foods that keep stools soft:"],
        bullets: [
          "Whole-wheat roti, oats, poha, brown rice",
          "Cooked vegetables and leafy greens",
          "Fruit such as papaya, guava, pear and oranges",
          "Soaked raisins, figs or prunes",
          "A psyllium (isabgol) supplement if your doctor recommends it",
        ],
      },
      {
        heading: "What to limit for now",
        paragraphs: ["Very spicy, deep-fried or heavy meals can cause bloating and discomfort. Fizzy drinks add gas. Alcohol interacts with pain medicines and dehydrates you. Large late-night meals can worsen reflux while you're less active."],
      },
      {
        heading: "Other ways to protect the repair",
        paragraphs: ["Support the wound with a pillow or your hand when you cough or sneeze. Walk a little several times a day — it helps your bowels and circulation. Avoid lifting anything heavy until your surgeon says it's safe, usually around four to six weeks. If you haven't opened your bowels for three days, contact your care team rather than straining."],
      },
    ],
  },
  {
    slug: "cashless-insurance-guide",
    title: "How cashless surgery approval actually works",
    category: "Insurance",
    excerpt: "Pre-authorisation, room-rent limits, co-pays and final settlement — insurance jargon, made simple.",
    published: "2026-06-18",
    relatedTreatments: [],
    relatedConditions: [],
    sections: [
      {
        heading: "Cashless vs reimbursement",
        paragraphs: [
          "With cashless treatment, the insurer (or its TPA — third-party administrator) pays the network hospital directly, and you pay only amounts your policy doesn't cover. With reimbursement, you pay the hospital yourself and claim the money back later by submitting bills. Cashless is only possible at hospitals in your insurer's network.",
        ],
      },
      {
        heading: "Step by step",
        paragraphs: [],
        bullets: [
          "Your surgeon recommends a procedure and the hospital prepares an estimate.",
          "The hospital's insurance desk sends a pre-authorisation request with your doctor's notes and the estimate.",
          "The insurer/TPA approves an initial amount, asks for more information, or declines.",
          "You're admitted and treated.",
          "At discharge, the hospital sends the final bill; the insurer approves the final amount.",
          "You pay any non-covered items (consumables, amounts above limits, co-pay) and go home.",
        ],
      },
      {
        heading: "Terms worth understanding before admission",
        paragraphs: [],
        bullets: [
          "Waiting period: many planned surgeries (piles, hernia, cataract, joint replacement) are only covered after 1–4 years of continuous cover.",
          "Room-rent limit: choosing a room above your limit can reduce what's paid on the whole bill, not just the room.",
          "Sub-limits: some policies cap specific procedures, such as cataract, at a fixed amount.",
          "Co-payment: a percentage you always pay, common in senior-citizen policies.",
          "Non-medical items: gloves, some consumables and admin charges are often excluded.",
        ],
      },
      {
        heading: "How to avoid surprises",
        paragraphs: [
          "Share your policy document and e-card before choosing a hospital. Ask for a written estimate and ask what the insurer is likely to pay versus what you'll pay. Keep copies of every report and prescription. If a request is queried, respond quickly — most delays come from missing documents.",
        ],
      },
    ],
  },
  {
    slug: "knee-replacement-myths",
    title: "Knee replacement: myths patients still believe",
    category: "Orthopaedics",
    excerpt: "\"I'm too old\", \"I'll never kneel again\", \"wait until it's unbearable\" — what's true and what isn't.",
    published: "2026-06-25",
    relatedTreatments: ["total-knee-replacement", "partial-knee-replacement"],
    relatedConditions: ["knee-arthritis"],
    sections: [
      {
        heading: "Myth: you should wait until the pain is unbearable",
        paragraphs: [
          "There's no prize for waiting. The decision is about quality of life: if arthritis pain is limiting walking, sleep or independence despite physiotherapy, weight management and medication — and X-rays confirm advanced damage — it's reasonable to consider surgery. Waiting too long can mean weaker muscles and a harder recovery.",
        ],
      },
      {
        heading: "Myth: I'm too old for surgery",
        paragraphs: [
          "Age alone rarely rules someone out. What matters is overall health — heart, lungs, diabetes control — and the ability to take part in rehabilitation. Many people in their 70s and 80s have successful knee replacements after a thorough pre-operative assessment.",
        ],
      },
      {
        heading: "Myth: the new knee will only last a few years",
        paragraphs: ["Modern implants commonly last 15–20 years or more. Weight, activity and implant positioning all affect wear, and most people never need a revision."],
      },
      {
        heading: "Myth: recovery takes a year in bed",
        paragraphs: [
          "Most patients stand and take a few steps within a day or two of surgery. Walking with support is usual at discharge, and most everyday activities return by around six weeks, with continued improvement over several months. Physiotherapy is the key — the operation is only half the result.",
        ],
      },
      {
        heading: "Myth: both knees can't be done",
        paragraphs: ["Both knees can be replaced in one operation or in two stages, depending on your health and your surgeon's assessment. Each approach has trade-offs worth discussing."],
      },
      {
        heading: "What is true",
        paragraphs: ["Kneeling can feel uncomfortable afterwards for some people, and a replaced knee is not quite the same as a healthy natural knee. Infection and blood clots are uncommon but serious risks, which is why pre-operative checks and post-operative precautions matter."],
      },
    ],
  },
  {
    slug: "laparoscopy-guide",
    title: "Laparoscopy: what to expect from keyhole surgery",
    category: "Laparoscopy",
    excerpt: "Small cuts don't mean small surgery. Here's what happens, why you might get shoulder pain, and how recovery really goes.",
    published: "2026-07-03",
    relatedTreatments: ["laparoscopic-cholecystectomy", "laparoscopic-hernia-repair", "laparoscopic-appendectomy", "diagnostic-laparoscopy"],
    relatedConditions: ["gallstones", "inguinal-hernia", "appendicitis"],
    sections: [
      {
        heading: "How keyhole surgery works",
        paragraphs: [
          "The surgeon makes a few small cuts, usually 5–12 mm, and gently fills the abdomen with carbon dioxide to create space. A thin camera shows the inside of the abdomen on a screen, and long instruments are used to do the operation. The organs being treated are the same as in open surgery — only the access is different.",
        ],
      },
      {
        heading: "Why recovery is usually quicker",
        paragraphs: ["Smaller wounds mean less pain, less time in hospital, lower wound-infection risk and an earlier return to work. Many gallbladder and hernia operations need only a same-day or overnight stay."],
      },
      {
        heading: "Common after-effects",
        paragraphs: [],
        bullets: [
          "Shoulder-tip pain for a day or two, caused by gas irritating the diaphragm — walking helps it settle",
          "Bloating and mild abdominal discomfort",
          "Tiredness for a week or two",
          "Small bruises around the incisions",
        ],
      },
      {
        heading: "When open surgery is still needed",
        paragraphs: ["Occasionally a keyhole operation is converted to open surgery — for example because of scarring from previous operations, severe inflammation or bleeding. This is a safety decision, not a failure, and your surgeon should discuss the possibility with you beforehand."],
      },
      {
        heading: "Call your care team if you notice",
        paragraphs: [],
        bullets: ["Fever or chills", "Worsening abdominal pain rather than steady improvement", "Redness or discharge from a wound", "Yellowing of the skin or eyes after gallbladder surgery", "Persistent vomiting"],
      },
    ],
  },
  {
    slug: "kidney-stone-treatment-comparison",
    title: "Kidney stones: shock waves, laser or keyhole surgery?",
    category: "Urology",
    excerpt: "ESWL, URS, RIRS and PCNL explained — and why stone size and position decide which one is best.",
    published: "2026-07-11",
    relatedTreatments: ["eswl", "ureteroscopy", "rirs", "pcnl"],
    relatedConditions: ["kidney-stones"],
    sections: [
      {
        heading: "Not every stone needs a procedure",
        paragraphs: ["Stones smaller than about 5 mm often pass on their own within a few weeks with fluids, pain relief and sometimes a medicine that relaxes the ureter. Procedures are considered when a stone is large, isn't moving, blocks the kidney, causes infection or keeps causing pain."],
      },
      {
        heading: "ESWL — shock wave lithotripsy",
        paragraphs: ["Focused shock waves break the stone from outside the body, with no cut. It suits small-to-medium kidney stones that aren't too hard. You may need more than one session, and fragments pass in the urine over days to weeks."],
      },
      {
        heading: "URS and RIRS — laser through the natural passage",
        paragraphs: ["A thin telescope goes up through the urethra and bladder. Ureteroscopy (URS) treats stones in the ureter; RIRS uses a flexible scope to reach stones inside the kidney. A laser breaks the stone and fragments are removed. There are no external cuts, though a temporary stent is often left for a week or two."],
      },
      {
        heading: "PCNL — for large stones",
        paragraphs: ["For stones larger than about 2 cm, or staghorn stones, a small tunnel is made through the back directly into the kidney. It is the most effective way to clear big stones in one go, with a slightly longer hospital stay."],
      },
      {
        heading: "Preventing the next one",
        paragraphs: ["Around half of people who have had a stone will get another within about ten years. Drinking enough water to keep urine pale, limiting salt and animal protein, and following advice based on an analysis of your stone are the best protection."],
      },
    ],
  },
  {
    slug: "tonsillectomy-recovery-checklist",
    title: "Tonsillectomy recovery: what to stock at home",
    category: "ENT",
    excerpt: "Recovery hurts more than people expect. A practical checklist for the two weeks after tonsil surgery.",
    published: "2026-07-19",
    relatedTreatments: ["tonsillectomy", "adenoidectomy"],
    relatedConditions: ["tonsillitis", "adenoid-hypertrophy"],
    sections: [
      {
        heading: "What to expect",
        paragraphs: ["Throat pain usually peaks around days 3–7 and often feels worse in the mornings. Ear pain is common too — it's referred from the throat, not an ear infection. White patches where the tonsils were are normal healing tissue, not infection. Full recovery takes about 10–14 days."],
      },
      {
        heading: "Stock up before surgery",
        paragraphs: [],
        bullets: [
          "Pain relief exactly as prescribed — take it regularly, not only when pain is bad",
          "Cold water, coconut water, buttermilk and diluted juices (avoid citrus)",
          "Soft foods: khichdi, curd rice, mashed potatoes, soft idli, custard, ice cream",
          "A humidifier or steam for dry mornings",
          "Chewing gum — it can help keep throat muscles moving (if your surgeon agrees)",
        ],
      },
      {
        heading: "The golden rule: keep drinking",
        paragraphs: ["Dehydration makes pain worse and increases the risk of bleeding. Sip often through the day, even when swallowing hurts. For children, count drinks and encourage them regularly."],
      },
      {
        heading: "Bleeding: know the warning signs",
        paragraphs: ["Bleeding can occur up to about two weeks after surgery, most often around days 5–10. Any bright red bleeding from the mouth or spitting blood needs urgent medical attention — go to the nearest emergency department."],
      },
    ],
  },
  {
    slug: "varicose-vein-treatment-options",
    title: "Varicose veins: stockings, laser or surgery?",
    category: "Vascular",
    excerpt: "When varicose veins are more than cosmetic, and how minimally invasive treatments like EVLA work.",
    published: "2026-07-27",
    relatedTreatments: ["evla", "rfa-varicose-veins", "sclerotherapy"],
    relatedConditions: ["varicose-veins"],
    sections: [
      {
        heading: "Why veins become varicose",
        paragraphs: ["Leg veins have one-way valves that help blood flow back to the heart. When valves weaken, blood pools and veins stretch, twist and bulge. Standing for long hours, pregnancy, family history and excess weight all increase the risk."],
      },
      {
        heading: "When treatment is worth considering",
        paragraphs: [],
        bullets: ["Aching, heaviness or cramps that affect daily life", "Swelling around the ankles", "Skin darkening, eczema or hardening near the ankle", "Bleeding from a vein or a leg ulcer"],
      },
      {
        heading: "Compression stockings",
        paragraphs: ["Properly fitted stockings relieve symptoms and are useful while you decide on treatment, during pregnancy, or if procedures aren't suitable. They don't make the faulty valves work again."],
      },
      {
        heading: "Laser (EVLA) and radiofrequency ablation",
        paragraphs: ["Through a needle puncture under local anaesthesia, a fibre or catheter is passed into the faulty vein and heats it closed. Blood reroutes through healthy veins. Most people walk out the same day and return to normal activity within days. These have largely replaced traditional vein stripping."],
      },
      {
        heading: "Sclerotherapy",
        paragraphs: ["Injecting a solution or foam closes smaller veins and spider veins. It's often used after ablation to treat remaining branches."],
      },
    ],
  },
  {
    slug: "anaesthesia-guide",
    title: "How anaesthesia is chosen for day-care surgery",
    category: "Before surgery",
    excerpt: "General, spinal, local or sedation — how your anaesthetist decides, and what you can do to prepare.",
    published: "2026-08-04",
    relatedTreatments: [],
    relatedConditions: [],
    sections: [
      {
        heading: "The main types",
        paragraphs: [],
        bullets: [
          "General anaesthesia: you're fully asleep and a breathing tube or airway device is used.",
          "Spinal/epidural: an injection in the lower back numbs you from the waist down; you can stay awake or be lightly sedated.",
          "Regional/nerve block: numbs one limb or area, often combined with sedation.",
          "Local anaesthesia: numbs just the area being treated.",
          "Sedation: medication to relax you, often with local anaesthesia.",
        ],
      },
      {
        heading: "How the choice is made",
        paragraphs: ["Your anaesthetist considers the operation, how long it takes, your health (heart, lungs, diabetes, blood thinners), previous reactions to anaesthesia and your preferences. For many lower-body procedures, spinal anaesthesia is a common choice; for abdominal keyhole surgery, general anaesthesia is usual."],
      },
      {
        heading: "Pre-anaesthesia check-up",
        paragraphs: ["You'll usually have blood tests, an ECG and sometimes a chest X-ray, depending on age and health. Bring a list of all medicines — including herbal and ayurvedic products — and tell the team about loose teeth, snoring or sleep apnoea, and any previous problems with anaesthesia."],
      },
      {
        heading: "Fasting and medicines",
        paragraphs: ["Follow the fasting instructions you're given exactly — typically no food for about six hours before, with clear fluids allowed until closer to the time. Don't stop blood thinners or diabetes medicines on your own; your doctors will tell you what to take and when."],
      },
    ],
  },
  {
    slug: "pre-surgery-checklist",
    title: "Pre-surgery checklist: things to do before your operation",
    category: "Before surgery",
    excerpt: "Paperwork, medicines, fasting, packing and planning your recovery — a practical list for planned surgery.",
    published: "2026-08-12",
    relatedTreatments: [],
    relatedConditions: [],
    sections: [
      {
        heading: "A week or two before",
        paragraphs: [],
        bullets: [
          "Complete pre-operative tests and the anaesthesia check-up",
          "Share your insurance policy and ID so pre-authorisation can start early",
          "Make a complete list of your medicines and ask which to stop or continue",
          "Stop smoking — even a short break helps wound healing and breathing",
          "Arrange leave from work and help at home for the first few days",
        ],
      },
      {
        heading: "The day before",
        paragraphs: [],
        bullets: [
          "Confirm your admission time and fasting instructions",
          "Bathe; don't shave the operation area yourself unless told to",
          "Remove nail polish and jewellery",
          "Pack loose clothes, slippers, phone charger, spectacles and reports",
        ],
      },
      {
        heading: "Documents to carry",
        paragraphs: [],
        bullets: ["Photo ID and insurance e-card", "All test reports and scans", "Doctor's prescription and consent forms", "A list of emergency contacts"],
      },
      {
        heading: "Plan your recovery",
        paragraphs: ["Arrange someone to take you home and stay with you for the first night after day-care surgery. Stock simple foods, fluids and any recommended supplies. Know who to call, and which warning signs need urgent attention."],
      },
    ],
  },
  {
    slug: "fibre-after-surgery",
    title: "Why fibre matters after anorectal surgery",
    category: "Recovery",
    excerpt: "Soft, regular bowel movements are the single most important part of healing after piles, fissure or fistula surgery.",
    published: "2026-08-20",
    relatedTreatments: ["laser-piles-surgery", "lateral-internal-sphincterotomy", "fistulotomy"],
    relatedConditions: ["piles", "anal-fissure", "anal-fistula", "chronic-constipation"],
    sections: [
      {
        heading: "The first bowel movement",
        paragraphs: ["Many people are anxious about the first bowel movement after surgery. Taking prescribed stool softeners, drinking well and eating fibre from the start make it much easier. Don't hold it in — delaying makes stools harder."],
      },
      {
        heading: "Good sources of fibre",
        paragraphs: [],
        bullets: ["Whole grains: oats, whole-wheat roti, brown rice, millets", "Pulses: dal, chana, rajma (increase gradually)", "Fruit: papaya, guava, pear, apple with skin, oranges", "Vegetables and leafy greens", "Psyllium husk (isabgol) with plenty of water"],
      },
      {
        heading: "Fibre needs water",
        paragraphs: ["Fibre works by holding water in the stool. Without enough fluid it can make constipation worse. Aim for pale urine and spread drinks through the day."],
      },
      {
        heading: "Make it a habit",
        paragraphs: ["The habits that help you heal are the same ones that stop piles and fissures coming back: fibre, fluids, not straining, and not sitting on the toilet for long."],
      },
    ],
  },
  {
    slug: "pcos-treatment-options",
    title: "PCOS: what actually helps",
    category: "Gynaecology",
    excerpt: "PCOS is managed mainly with lifestyle changes and medication — here's when fertility treatment comes in.",
    published: "2026-08-28",
    relatedTreatments: ["iui", "ivf"],
    relatedConditions: ["pcos", "infertility"],
    sections: [
      {
        heading: "What PCOS is",
        paragraphs: ["Polycystic ovary syndrome is a common hormonal condition. It's diagnosed when at least two of these are present: irregular or absent ovulation, signs of higher androgen levels (such as excess hair growth or acne), and ovaries that look polycystic on ultrasound — after other causes are excluded."],
      },
      {
        heading: "Lifestyle changes come first",
        paragraphs: ["For people who are above a healthy weight, losing even 5–10% of body weight can make periods more regular and improve ovulation. Regular physical activity and a balanced diet also improve insulin resistance, which is common in PCOS."],
      },
      {
        heading: "Medication",
        paragraphs: ["Depending on your goals, doctors may prescribe hormonal treatment to regulate periods, medicines that improve insulin sensitivity, treatments for acne or excess hair, and — when trying to conceive — medicines that stimulate ovulation."],
      },
      {
        heading: "Fertility treatment",
        paragraphs: ["If ovulation medicines alone don't lead to pregnancy, IUI or IVF may be recommended. People with PCOS can respond strongly to fertility drugs, so treatment is monitored closely."],
      },
      {
        heading: "Long-term health",
        paragraphs: ["PCOS is linked to a higher risk of type 2 diabetes, high cholesterol and, if periods are very infrequent, thickening of the womb lining. Regular check-ups help catch these early."],
      },
    ],
  },
];

function wordCount(p: RawPost) {
  const text = [p.title, p.excerpt, ...p.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])])].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export const BLOG_POSTS: BlogPost[] = RAW_POSTS.map((p) => ({
  ...p,
  readMinutes: Math.max(2, Math.round(wordCount(p) / 200)),
})).sort((a, b) => b.published.localeCompare(a.published));

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const BLOG_AUTHOR = "Go Surgery Editorial Team";
