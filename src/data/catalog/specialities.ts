import type { Speciality } from "./types";

export const SPECIALITIES: Speciality[] = [
  {
    slug: "proctology",
    name: "Proctology",
    tagline: "Care for piles, fissures, fistulas and other anorectal conditions.",
    intro:
      "Proctology deals with conditions of the anus, rectum and lower colon — piles, fissures, fistulas, pilonidal sinus, prolapse and abscesses. Many people put off seeing a doctor out of embarrassment, but most of these problems are common, very treatable, and get harder to treat the longer they are left.",
    more: [
      "Early-stage problems often settle with diet changes, stool softeners, sitz baths and medication. When symptoms keep coming back, bleed heavily or cause constant pain, a procedure is usually the more reliable option. Modern approaches — laser procedures, stapler techniques and minimally invasive fistula treatments — generally mean smaller wounds, less pain and a quicker return to work than older open surgery.",
      "A proctologist or general surgeon examines the area (usually a quick, gentle in-clinic examination, sometimes with a proctoscope) to confirm the diagnosis and grade of the problem before recommending a treatment. Imaging such as MRI is used for complex fistulas.",
    ],
    doctorMatch: "proctolog|colorectal|general[- ]surgeon|laparoscopic[- ]surgeon|^surgeon$",
    faqs: [
      {
        q: "What does a proctologist treat?",
        a: "Conditions of the anus and rectum: piles (haemorrhoids), anal fissures, fistulas, abscesses, pilonidal sinus, rectal prolapse, anal skin tags and some causes of chronic constipation and faecal incontinence.",
      },
      {
        q: "Is laser treatment a permanent cure for piles?",
        a: "Laser treatment removes or shrinks the existing piles, but no procedure changes the habits that cause them. Keeping stools soft (fibre, water), not straining and not sitting on the toilet for long periods is what keeps piles from coming back.",
      },
      {
        q: "Can women consult a proctologist?",
        a: "Yes. Piles and fissures are particularly common during pregnancy and after childbirth. You can ask for a female doctor or a chaperone during the examination.",
      },
      {
        q: "Is the examination painful?",
        a: "A proctology examination is usually brief and only mildly uncomfortable. If you have a very painful fissure, the doctor may examine you gently or use a local anaesthetic gel.",
      },
      {
        q: "How soon can I go back to work after a proctology procedure?",
        a: "After most laser or minimally invasive procedures, people return to desk work within a few days. Open surgery and complex fistula treatment usually need longer — your surgeon will give you a timeline for your specific procedure.",
      },
    ],
  },
  {
    slug: "laparoscopy",
    name: "Laparoscopy",
    tagline: "Keyhole surgery for gallstones, hernia, appendix and more.",
    intro:
      "Laparoscopic (keyhole) surgery is performed through a few small cuts using a camera and long, thin instruments. Compared with open surgery it usually means less pain, smaller scars, a shorter hospital stay and a faster return to normal activity.",
    more: [
      "Common laparoscopic operations include gallbladder removal, appendix removal, hernia repair and diagnostic laparoscopy to find the cause of abdominal pain. The abdomen is gently inflated with carbon dioxide so the surgeon has room to see and work.",
      "Not every patient is suitable for keyhole surgery — previous major abdominal surgery, severe inflammation or certain medical conditions may make open surgery the safer choice. Occasionally a keyhole operation has to be converted to open surgery during the procedure, which your surgeon will discuss with you beforehand.",
    ],
    doctorMatch: "laparoscopic|general[- ]surgeon|^surgeon$|gastrointestinal[- ]surgeon",
    faqs: [
      {
        q: "How is laparoscopic surgery different from open surgery?",
        a: "Open surgery uses one larger incision; laparoscopy uses several small (5–12 mm) incisions and a camera. The operation inside is often the same, but recovery is usually quicker with laparoscopy.",
      },
      {
        q: "Will I have visible scars?",
        a: "You will have a few small scars, typically around the navel and lower abdomen, which usually fade considerably over months.",
      },
      {
        q: "Why do I have shoulder pain after laparoscopy?",
        a: "The gas used to inflate the abdomen can irritate the diaphragm and cause referred shoulder-tip pain for a day or two. Walking around helps it settle.",
      },
      {
        q: "How long is the hospital stay?",
        a: "Many laparoscopic procedures need a same-day or overnight stay; more complex ones may need 2–3 days.",
      },
    ],
  },
  {
    slug: "general-surgery",
    name: "General Surgery",
    tagline: "Hernia, lumps, cysts, thyroid and other common operations.",
    intro:
      "General surgeons treat a wide range of conditions of the abdomen, skin and soft tissue, and some glands — including hernias, lipomas, cysts, abscesses and thyroid swellings. Many of these operations are short, planned procedures with a same-day or next-day discharge.",
    more: [
      "General surgery overlaps with several other specialities: many general surgeons also perform laparoscopic, proctology and breast operations. The right surgeon depends on the specific condition, so a consultation usually starts with examination and, where needed, an ultrasound or blood tests.",
    ],
    doctorMatch: "general[- ]surgeon|^surgeon$|general practitioner, general surgeon",
    faqs: [
      {
        q: "Does every lump need to be removed?",
        a: "No. Many lumps, such as small lipomas, are harmless and can be monitored. A lump that is growing, painful, hard, fixed or causing concern should be examined, and removal may be recommended.",
      },
      {
        q: "Can a hernia go away on its own?",
        a: "Hernias in adults do not heal on their own and tend to enlarge over time. Surgery is the only definitive treatment, though small painless hernias are sometimes watched.",
      },
      {
        q: "Are these operations done under general anaesthesia?",
        a: "It depends on the procedure — small lumps are often removed under local anaesthesia, while hernia and thyroid surgery are usually done under general or spinal anaesthesia.",
      },
    ],
  },
  {
    slug: "urology",
    name: "Urology",
    tagline: "Kidney stones, prostate, circumcision and urinary problems.",
    intro:
      "Urology covers the kidneys, ureters, bladder, prostate and male reproductive organs. Urologists treat kidney stones, enlarged prostate, urinary blockages, foreskin problems, hydrocele and varicocele, among other conditions.",
    more: [
      "Many urological procedures are endoscopic — performed through the urinary passage with no external cut — such as ureteroscopy for stones or TURP and laser procedures for an enlarged prostate. Shock-wave lithotripsy can break some kidney stones without any surgery at all.",
      "The right treatment for a kidney stone depends on its size, location and composition, which is why a CT scan or ultrasound is usually the first step.",
    ],
    doctorMatch: "\\burolog",
    faqs: [
      {
        q: "Do all kidney stones need surgery?",
        a: "No. Small stones (usually under about 5 mm) often pass on their own with fluids and medication. Larger stones, stones causing infection or blockage, or stones that don't pass may need lithotripsy or an endoscopic procedure.",
      },
      {
        q: "Is enlarged prostate the same as prostate cancer?",
        a: "No. Benign prostatic hyperplasia (BPH) is a non-cancerous enlargement that is very common with age. It can cause similar urinary symptoms, so your urologist may check a PSA blood test to help rule out cancer.",
      },
      {
        q: "Is circumcision done for medical reasons?",
        a: "Yes — for example for phimosis (a tight foreskin), repeated infections of the foreskin, or paraphimosis.",
      },
      {
        q: "How can I prevent kidney stones from coming back?",
        a: "Drinking enough water to keep urine pale, limiting salt and animal protein, and following advice based on your stone type are the main measures. Your urologist may test the stone to guide this.",
      },
    ],
  },
  {
    slug: "gynaecology",
    name: "Gynaecology",
    tagline: "Fibroids, ovarian cysts, endometriosis and women's surgery.",
    intro:
      "Gynaecology focuses on the female reproductive system — the uterus, ovaries, fallopian tubes, cervix and vagina. Gynaecologists treat conditions such as fibroids, ovarian cysts, endometriosis, heavy or irregular bleeding and PCOS, and perform procedures ranging from hysteroscopy to hysterectomy.",
    more: [
      "Many gynaecological operations can now be done laparoscopically or hysteroscopically (through the vagina and cervix, with no cuts), which usually shortens recovery. Whether to treat a condition with medication or surgery depends on symptoms, age and whether you plan future pregnancies.",
    ],
    doctorMatch: "gynecolog|gynaecolog|obstetrician|obstetrics",
    faqs: [
      {
        q: "Do fibroids always need surgery?",
        a: "No. Many fibroids cause no symptoms and only need monitoring. Treatment is considered when they cause heavy bleeding, pain, pressure symptoms or fertility problems.",
      },
      {
        q: "Can I get pregnant after fibroid or cyst surgery?",
        a: "Often yes. Myomectomy and ovarian cystectomy are designed to preserve the uterus and ovaries. Your gynaecologist will advise on how long to wait before trying to conceive.",
      },
      {
        q: "Is a hysterectomy the only option for heavy periods?",
        a: "No. Medication, hormonal IUDs, endometrial ablation and treatment of the underlying cause are often tried first. Hysterectomy is usually considered when other options haven't worked and no future pregnancy is planned.",
      },
    ],
  },
  {
    slug: "orthopaedics",
    name: "Orthopaedics",
    tagline: "Joint replacement, sports injuries, fractures and arthroscopy.",
    intro:
      "Orthopaedic surgeons treat problems of the bones, joints, ligaments and tendons — from arthritis and fractures to torn ligaments and sports injuries. Treatment ranges from physiotherapy and injections to arthroscopic (keyhole) surgery and joint replacement.",
    more: [
      "Joint replacement is usually considered when arthritis causes pain that limits daily life and hasn't improved with weight management, physiotherapy and medication. Arthroscopy lets the surgeon look inside and repair a joint through small incisions, and is commonly used for knee and shoulder injuries.",
      "Rehabilitation matters as much as the operation itself: a structured physiotherapy plan after surgery is what restores strength and range of movement.",
    ],
    doctorMatch: "orthop(a)?edic|orthopedist|joint[- ]replacement|knee replacement|hip replacement",
    faqs: [
      {
        q: "When should I consider knee replacement?",
        a: "When knee arthritis causes pain that limits walking, sleep or daily activities despite physiotherapy, weight management and medication, and X-rays show advanced joint damage.",
      },
      {
        q: "How long do joint replacements last?",
        a: "Most modern knee and hip replacements last many years — commonly 15–20 years or more — depending on activity level, weight and other factors.",
      },
      {
        q: "Do all ligament tears need surgery?",
        a: "No. Some partial tears heal with rest and physiotherapy. Complete ACL tears in active people, or tears causing the knee to give way, are more often treated surgically.",
      },
      {
        q: "Will I need physiotherapy after surgery?",
        a: "Almost always. Physiotherapy usually starts within a day or two of joint surgery and continues for several weeks.",
      },
    ],
  },
  {
    slug: "spine-surgery",
    name: "Spine Surgery",
    tagline: "Slipped disc, sciatica and spinal stenosis treatment.",
    intro:
      "Spine surgeons treat problems of the vertebrae, discs and nerves in the neck and back — such as slipped (herniated) discs, spinal stenosis and nerve compression causing sciatica. Most back pain improves without surgery, so an operation is usually reserved for persistent nerve symptoms or specific structural problems.",
    more: [
      "Surgery is considered when leg or arm pain from a trapped nerve does not improve after several weeks of conservative care, or urgently when there is progressive weakness or loss of bladder or bowel control. Minimally invasive and endoscopic techniques can remove disc material through small incisions.",
    ],
    doctorMatch: "spine|neurosurgeon",
    faqs: [
      {
        q: "Does a slipped disc always need surgery?",
        a: "No. Most disc herniations improve within weeks to a few months with activity modification, pain relief and physiotherapy.",
      },
      {
        q: "What symptoms need urgent attention?",
        a: "Loss of bladder or bowel control, numbness around the groin or buttocks, or rapidly worsening leg weakness need emergency assessment.",
      },
      {
        q: "How long is recovery after microdiscectomy?",
        a: "Many people walk the same day and return to desk work in a few weeks, avoiding heavy lifting for longer as advised by the surgeon.",
      },
    ],
  },
  {
    slug: "neurosurgery",
    name: "Neurosurgery",
    tagline: "Brain and nervous-system surgery.",
    intro:
      "Neurosurgeons operate on the brain, spinal cord and nerves — treating brain tumours, hydrocephalus, head injuries, some movement disorders and spinal conditions. These operations are highly specialised and planned carefully with detailed imaging.",
    more: [
      "Modern neurosurgery uses navigation systems, operating microscopes and, where appropriate, minimally invasive approaches to reduce the impact on surrounding healthy tissue. Recovery and outlook depend heavily on the underlying condition.",
    ],
    doctorMatch: "neurosurgeon",
    faqs: [
      {
        q: "What conditions do neurosurgeons treat?",
        a: "Brain and spinal tumours, hydrocephalus, head and spine injuries, nerve compression, some types of epilepsy and movement disorders such as Parkinson's disease (with deep brain stimulation).",
      },
      {
        q: "Is a neurologist the same as a neurosurgeon?",
        a: "No. Neurologists diagnose and treat nervous-system conditions with medication and other non-surgical therapies; neurosurgeons perform operations.",
      },
    ],
  },
  {
    slug: "ent",
    name: "ENT",
    tagline: "Ear, nose and throat surgery — sinus, tonsils, septum and ear.",
    intro:
      "ENT (otorhinolaryngology) surgeons treat conditions of the ears, nose, sinuses, throat and neck — including chronic sinusitis, a deviated septum, recurrent tonsillitis, enlarged adenoids, ear-drum perforations and hearing loss.",
    more: [
      "Most sinus and nasal operations are done endoscopically through the nostrils, so there are no external cuts. ENT surgeons also manage snoring and sleep-related breathing problems, voice disorders and some head and neck lumps.",
    ],
    doctorMatch: "\\bent\\b|otorhinolaryngolog|otolaryngolog|head[- ]and[- ]neck|head-neck",
    faqs: [
      {
        q: "When is tonsil removal recommended?",
        a: "Typically for frequent, well-documented tonsillitis over one to several years, a tonsil abscess, or enlarged tonsils causing breathing or sleep problems.",
      },
      {
        q: "Will sinus surgery change the shape of my nose?",
        a: "No. Endoscopic sinus surgery and septoplasty work inside the nose and don't change its external appearance.",
      },
      {
        q: "Can a perforated ear drum heal by itself?",
        a: "Many small perforations heal within weeks. Those that don't, or that cause recurrent discharge or hearing loss, can be repaired with tympanoplasty.",
      },
    ],
  },
  {
    slug: "ophthalmology",
    name: "Ophthalmology",
    tagline: "Cataract, LASIK, glaucoma and retina treatment.",
    intro:
      "Ophthalmologists are eye doctors who diagnose and treat eye disease medically and surgically — including cataract, glaucoma, diabetic eye disease, refractive errors (spectacle power) and pterygium.",
    more: [
      "Cataract surgery is one of the most commonly performed operations and is usually a short day-care procedure. Laser vision correction (LASIK, SMILE) and implantable lenses can reduce dependence on glasses for suitable candidates after a detailed eye assessment.",
    ],
    doctorMatch: "ophthalmolog|eye surgeon",
    faqs: [
      {
        q: "When should cataract be operated on?",
        a: "When blurred or glary vision starts interfering with reading, driving or daily activities. There is no need to wait for a cataract to become 'ripe'.",
      },
      {
        q: "Who is suitable for LASIK?",
        a: "Adults with a stable glasses prescription for at least a year, healthy corneas of adequate thickness and no active eye disease. A pre-LASIK evaluation decides suitability.",
      },
      {
        q: "Can glaucoma damage be reversed?",
        a: "No — vision lost to glaucoma can't be restored, which is why early detection and keeping eye pressure controlled with drops, laser or surgery are important.",
      },
    ],
  },
  {
    slug: "cardiac-surgery",
    name: "Cardiac Surgery",
    tagline: "Bypass, valve replacement and heart procedures.",
    intro:
      "Cardiac and cardiothoracic surgeons operate on the heart and major blood vessels in the chest — performing coronary artery bypass grafting (CABG), valve repair and replacement, and other heart operations.",
    more: [
      "Many blocked arteries are treated first by a cardiologist with angioplasty and stents; bypass surgery is often recommended when several arteries are involved or the blockage pattern makes stenting less suitable. Decisions are usually made jointly by the cardiologist and cardiac surgeon.",
    ],
    doctorMatch: "cardiac surgeon|cardiothoracic|cardiovascular and thoracic|cardio[- ]thoracic",
    faqs: [
      {
        q: "What is the difference between angioplasty and bypass surgery?",
        a: "Angioplasty opens a narrowed artery from inside using a balloon and stent through a catheter. Bypass surgery creates a new route for blood around the blockage using a blood vessel from elsewhere in the body.",
      },
      {
        q: "How long is recovery after heart surgery?",
        a: "Typically about a week in hospital and six to twelve weeks before returning to full activity, with cardiac rehabilitation helping recovery.",
      },
    ],
  },
  {
    slug: "vascular-surgery",
    name: "Vascular Surgery",
    tagline: "Varicose veins, diabetic foot and circulation problems.",
    intro:
      "Vascular surgeons treat diseases of the arteries and veins outside the heart and brain — including varicose veins, poor leg circulation, diabetic foot problems and creation of access for dialysis.",
    more: [
      "Varicose veins that cause aching, swelling, skin changes or ulcers can now usually be treated with minimally invasive options such as laser or radiofrequency ablation, done through a needle puncture rather than open stripping.",
    ],
    doctorMatch: "vascular[- ]surgeon",
    faqs: [
      {
        q: "Are varicose veins only a cosmetic problem?",
        a: "Not always. They can cause aching, heaviness, swelling, skin discolouration and ulcers, which are good reasons for treatment.",
      },
      {
        q: "Is laser treatment for varicose veins painful?",
        a: "It is done under local anaesthesia with a needle puncture; most people walk out the same day with mild discomfort for a few days.",
      },
    ],
  },
  {
    slug: "plastic-cosmetic-surgery",
    name: "Plastic & Cosmetic Surgery",
    tagline: "Reconstructive and aesthetic procedures — gynecomastia, liposuction and more.",
    intro:
      "Plastic surgeons perform reconstructive surgery (restoring form and function after injury, disease or congenital problems) and cosmetic surgery (changing appearance by choice) — for example gynecomastia correction, liposuction, tummy tuck, rhinoplasty and eyelid surgery.",
    more: [
      "Good outcomes depend on realistic expectations and choosing the right procedure for your body. A consultation should cover what can and can't be achieved, the recovery period, scarring and risks. Purely cosmetic procedures are generally not covered by health insurance.",
    ],
    doctorMatch: "plastic|cosmetic surgeon",
    faqs: [
      {
        q: "Is cosmetic surgery covered by insurance?",
        a: "Usually not, when done purely for appearance. Reconstructive procedures needed for medical reasons may be covered depending on your policy.",
      },
      {
        q: "Will there be scars?",
        a: "All surgery leaves some scarring; plastic surgeons place incisions where they are least visible and scars usually fade over 12–18 months.",
      },
    ],
  },
  {
    slug: "hair-transplant",
    name: "Hair Transplant",
    tagline: "FUE and FUT hair restoration.",
    intro:
      "Hair transplant surgery moves healthy hair follicles from a donor area (usually the back of the scalp) to thinning or bald areas. It is most often used for male and female pattern hair loss once the pattern has stabilised.",
    more: [
      "The two main techniques are FUE (individual follicles extracted one by one) and FUT (a strip of scalp removed and divided into grafts). Transplanted hair usually sheds within weeks and regrows over 6–12 months. Medical treatment is often continued to protect non-transplanted hair.",
    ],
    doctorMatch: "hair[- ]transplant",
    faqs: [
      {
        q: "Is a hair transplant permanent?",
        a: "Transplanted follicles are taken from areas resistant to pattern hair loss and generally keep growing, but surrounding native hair can continue to thin.",
      },
      {
        q: "When will I see results?",
        a: "New growth usually starts at 3–4 months, with the final result visible around 12 months.",
      },
    ],
  },
  {
    slug: "gastrointestinal-surgery",
    name: "Gastrointestinal Surgery",
    tagline: "Surgery of the stomach, intestines, liver and pancreas.",
    intro:
      "Gastrointestinal (GI) surgeons operate on the oesophagus, stomach, intestines, colon, liver, gallbladder and pancreas — treating conditions such as severe reflux and hiatal hernia, bowel disease and tumours of the digestive tract.",
    more: [
      "Many GI operations are now performed laparoscopically. Complex procedures, such as pancreatic or major liver surgery, are usually done in high-volume centres by surgeons who specialise in them.",
    ],
    doctorMatch: "gastrointestinal[- ]surgeon|gastro[- ]surgeon",
    faqs: [
      {
        q: "When is surgery considered for acid reflux?",
        a: "When reflux persists despite medication, when you'd prefer not to take lifelong medication, or when a large hiatal hernia is present. Tests such as endoscopy and pH studies come first.",
      },
      {
        q: "Is a gastroenterologist a surgeon?",
        a: "No. Gastroenterologists diagnose and treat digestive conditions medically and with endoscopy; GI surgeons perform operations.",
      },
    ],
  },
  {
    slug: "bariatric-surgery",
    name: "Bariatric Surgery",
    tagline: "Weight-loss surgery for severe obesity.",
    intro:
      "Bariatric (weight-loss) surgery changes the stomach and/or intestine to reduce how much you can eat and how your body handles food. It is considered for people with severe obesity, especially when obesity-related conditions such as type 2 diabetes or sleep apnoea are present.",
    more: [
      "Common operations include sleeve gastrectomy and gastric bypass. Surgery is a tool rather than a cure — long-term success depends on lifelong dietary changes, activity, vitamin supplements and regular follow-up.",
    ],
    doctorMatch: "bariatric",
    faqs: [
      {
        q: "Who is eligible for bariatric surgery?",
        a: "Commonly adults with a BMI of 40 or more, or 35 or more with obesity-related illness; Asian guidelines often use lower thresholds. Eligibility is decided after a medical, dietary and psychological assessment.",
      },
      {
        q: "Will I need to take vitamins after surgery?",
        a: "Yes. Most people need lifelong vitamin and mineral supplements and periodic blood tests.",
      },
    ],
  },
  {
    slug: "surgical-oncology",
    name: "Surgical Oncology",
    tagline: "Cancer surgery, including breast cancer surgery.",
    intro:
      "Surgical oncologists remove tumours and, where needed, nearby lymph nodes as part of cancer treatment. Surgery is often combined with chemotherapy, radiotherapy or other treatments planned by a multidisciplinary tumour board.",
    more: [
      "The type and extent of surgery depend on the cancer's type, size and stage. For breast cancer, for example, many patients can have breast-conserving surgery rather than a full mastectomy.",
    ],
    doctorMatch: "surgical oncologist|oncologist surgeon|cancer surgeon|onco[- ]surgeon",
    faqs: [
      {
        q: "Is surgery always part of cancer treatment?",
        a: "No. Some cancers are treated primarily with chemotherapy or radiotherapy. When surgery is used, it may come before or after other treatments.",
      },
      {
        q: "Should I get a second opinion?",
        a: "Many patients do, and it is a reasonable step for a major cancer operation. It rarely delays care significantly if arranged promptly.",
      },
    ],
  },
  {
    slug: "transplant-surgery",
    name: "Transplant Surgery",
    tagline: "Kidney and liver transplantation.",
    intro:
      "Transplant surgeons replace a failed organ with a healthy one from a living or deceased donor. Kidney and liver transplants are the most common. Transplantation involves detailed evaluation of both recipient and donor, and lifelong anti-rejection medication afterwards.",
    more: [
      "In India, organ donation and transplantation are regulated under the Transplantation of Human Organs and Tissues Act, which sets out donor eligibility and approval processes.",
    ],
    doctorMatch: "(liver|kidney|renal)?[- ]?transplant surgeon",
    faqs: [
      {
        q: "Who can donate a kidney or part of a liver?",
        a: "Usually a healthy adult close relative, after thorough medical evaluation and legal approval. Donation by others requires additional authorisation.",
      },
      {
        q: "Will I need medication after a transplant?",
        a: "Yes — lifelong immunosuppressive medicine to prevent rejection, with regular blood tests.",
      },
    ],
  },
  {
    slug: "paediatric-surgery",
    name: "Paediatric Surgery",
    tagline: "Surgery for infants and children.",
    intro:
      "Paediatric surgeons are trained specifically to operate on newborns, children and teenagers — treating conditions such as hernias, undescended testes, hypospadias and congenital abnormalities.",
    more: [
      "Children's anatomy, anaesthesia needs and recovery differ from adults', so procedures, pain control and hospital environments are adapted for them. Many common paediatric operations are day-care procedures.",
    ],
    doctorMatch: "pa?ediatric[- ]surgeon|pa?ediatric orthopedic",
    faqs: [
      {
        q: "When should an undescended testis be operated on?",
        a: "Generally between about 6 and 18 months of age if it has not come down on its own.",
      },
      {
        q: "Is general anaesthesia safe for children?",
        a: "It is very commonly and safely used; a paediatric anaesthetist assesses your child beforehand and explains the plan.",
      },
    ],
  },
  {
    slug: "oral-maxillofacial-surgery",
    name: "Oral & Maxillofacial Surgery",
    tagline: "Wisdom teeth, jaw surgery and facial injuries.",
    intro:
      "Oral and maxillofacial surgeons treat conditions of the mouth, teeth, jaws and face — including impacted wisdom teeth, jaw fractures, jaw deformities and some cysts and tumours of the jaw.",
    more: [
      "Corrective jaw (orthognathic) surgery is usually planned together with an orthodontist, with braces before and after surgery.",
    ],
    doctorMatch: "oral surgeon|maxillofacial",
    faqs: [
      {
        q: "Do all wisdom teeth need removal?",
        a: "No — only those causing pain, infection, decay, damage to neighbouring teeth or cysts.",
      },
      {
        q: "How long does swelling last after wisdom tooth removal?",
        a: "Swelling usually peaks at 2–3 days and settles within about a week.",
      },
    ],
  },
  {
    slug: "ivf-fertility",
    name: "IVF & Fertility",
    tagline: "Fertility evaluation, IUI, IVF and ICSI.",
    intro:
      "Fertility specialists help couples who have difficulty conceiving — investigating causes in both partners and offering treatments from ovulation induction and IUI to IVF and ICSI.",
    more: [
      "Couples are generally advised to seek evaluation after a year of trying (or six months if the woman is over 35). Evaluation usually includes ovarian reserve tests, an ultrasound, tubal assessment and semen analysis. Success rates vary widely with age and cause, so any clinic's figures should be interpreted carefully.",
    ],
    doctorMatch: "ivf|fertility|infertility",
    faqs: [
      {
        q: "What is the difference between IUI and IVF?",
        a: "In IUI, prepared sperm is placed in the uterus around ovulation. In IVF, eggs are collected, fertilised in the laboratory and an embryo is transferred to the uterus.",
      },
      {
        q: "Should both partners be tested?",
        a: "Yes. Male factors contribute to a large share of fertility problems, so a semen analysis is part of the first evaluation.",
      },
    ],
  },
];
