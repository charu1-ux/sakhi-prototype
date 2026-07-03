// Client-side Sakhi engine — runs in browser, calls Groq directly

// ─── Prototype mock — WHO/FOGSI/ICMR/ACOG verified content ───────────────────

const DISCLAIMER_HI =
  "\n\nमैं आपकी सहेली हूँ, डॉक्टर नहीं। जो मैं बताती हूँ वो जानकारी है — कोई भी ज़रूरी निर्णय अपनी डॉक्टर से ज़रूर पक्का करें। 💜";
const DISCLAIMER_EN =
  "\n\nI'm your health companion, not a doctor. What I share is information — always confirm important decisions with your doctor. 💜";
type Video = { label: string; channel: string; url: string; embedId?: string };
type Article = { title: string; source: string; url: string; summary?: string };

export const BREATHING_EXERCISE =
  "अभी एक काम करें — डीप बेली ब्रीदिंग। यह सबसे आसान और असरदार तरीका है:\n\n🫁 साँस लें — 4 तक गिनें\nपेट बाहर की तरफ जाए, छाती नहीं — यह ज़रूरी है\n\n🫁 साँस छोड़ें — 4 तक गिनें\nपेट अंदर की तरफ आए\n\nबीच में साँस बिल्कुल न रोकें — सीधे लें और छोड़ें। 5-6 बार करें — आप फर्क महसूस करेंगी। 💜";

const RESPONSES: { keywords: string[]; answer: string; video?: Video; article?: Article }[] = [
  // ── About FOGSI ───────────────────────────────────────────────────────────
  {
    keywords: ["fogsi", "fogsi kya hai", "fogsi kya hota"],
    answer:
      "FOGSI यानी Federation of Obstetric & Gynaecological Societies of India — भारत की सबसे बड़ी स्त्री रोग विशेषज्ञों की संस्था है जिसमें 35,000+ डॉक्टर हैं। सखी की सारी जानकारी FOGSI की गाइडलाइन्स से सत्यापित है। ये गाइडलाइन्स भारतीय महिलाओं की ज़रूरतों को ध्यान में रखकर बनाई गई हैं।",
    article: {
      title: "FOGSI Patient Information",
      source: "FOGSI",
      url: "https://www.fogsi.org/patient-information/",
    },
  },

  // ── About ICMR ────────────────────────────────────────────────────────────
  {
    keywords: ["icmr", "icmr kya hai", "icmr kya hota"],
    answer:
      "ICMR यानी Indian Council of Medical Research — भारत की सर्वोच्च चिकित्सा अनुसंधान संस्था है जो केंद्र सरकार के अधीन काम करती है। ICMR भारतीय महिलाओं के लिए पोषण, एनीमिया, और प्रजनन स्वास्थ्य पर राष्ट्रीय दिशानिर्देश जारी करती है। सखी की डाइट और जांच संबंधी सलाह ICMR की गाइडलाइन्स पर आधारित है।",
    article: {
      title: "ICMR Health Guidelines",
      source: "ICMR",
      url: "https://www.icmr.gov.in/guidelines.html",
    },
  },

  // ── About WHO ─────────────────────────────────────────────────────────────
  {
    keywords: ["who kya hai", "who kya hota", "world health organization", "who guidelines"],
    answer:
      "WHO यानी World Health Organization — संयुक्त राष्ट्र की वैश्विक स्वास्थ्य संस्था है। WHO महिला स्वास्थ्य, मातृ स्वास्थ्य, और प्रजनन अधिकारों पर अंतरराष्ट्रीय मानक तय करती है। सखी WHO की गाइडलाइन्स को भारतीय संदर्भ में लागू करती है।",
    article: {
      title: "WHO Women's Health",
      source: "WHO",
      url: "https://www.who.int/health-topics/women-s-health",
    },
  },

  // ── About ACOG ────────────────────────────────────────────────────────────
  {
    keywords: ["acog", "acog kya hai", "acog kya hota"],
    answer:
      "ACOG यानी American College of Obstetricians & Gynecologists — अमेरिका की प्रमुख स्त्री रोग विशेषज्ञों की संस्था है। ACOG की गाइडलाइन्स पीरियड दर्द, PMDD, गर्भावस्था, और रजोनिवृत्ति पर विश्व स्तर पर मानक मानी जाती हैं। सखी ACOG की सिफारिशों का उपयोग उन विषयों पर करती है जहाँ भारतीय दिशानिर्देश अधूरे हैं।",
    article: {
      title: "ACOG Patient Resources",
      source: "ACOG",
      url: "https://www.acog.org/womens-health",
    },
  },

  // ── About sources generally ───────────────────────────────────────────────
  {
    keywords: [
      "verified source",
      "sach hai",
      "bharosa",
      "kaun batata hai",
      "source kya hai",
      "kahan se jaankari",
      "reliable hai",
    ],
    answer:
      "सखी की सारी जानकारी चार संस्थाओं से सत्यापित है — FOGSI (भारत की स्त्री रोग विशेषज्ञ संस्था), ICMR (भारतीय चिकित्सा अनुसंधान परिषद), WHO (विश्व स्वास्थ्य संगठन), और ACOG (अमेरिकी स्त्री रोग संस्था)। इन सभी की गाइडलाइन्स सार्वजनिक और नियमित रूप से अपडेट होती हैं। सखी जानकारी देती है — अंतिम निर्णय हमेशा आपकी डॉक्टर के साथ लें।",
    article: {
      title: "FOGSI Patient Information",
      source: "FOGSI",
      url: "https://www.fogsi.org/patient-information/",
    },
  },

  // ── Period pain & cramps ──────────────────────────────────────────────────
  {
    keywords: [
      "ऐंठन",
      "मरोड़",
      "पीरियड दर्द",
      "पीरियड में दर्द",
      "पीरियड मे दर्द",
      "पीरियड में बहुत दर्द",
      "period pain",
      "period dard",
      "period me dard",
      "periods me dard",
      "masik dard",
      "माहवारी दर्द",
      "माहवारी में दर्द",
      "cramp",
      "dysmenorrhoea",
      "period peet dard",
      "period kamar dard",
      "back pain during period",
      "period ke time pet dard",
      "endometriosis",
      "एंडोमेट्रियोसिस",
      "adenomyosis",
      "एडेनोमायोसिस",
      "fibroid",
      "फाइब्रॉएड",
      "गर्भाशय में दर्द",
      "pet mein bahut dard",
      "pait dukh raha",
      "niche pet mein dard",
      "pet dukhta hai",
      "pait dukhta hai",
    ],
    answer:
      "यह दर्द बहुत real है — और आपको इसे सहते रहने की ज़रूरत नहीं है। FOGSI और WHO के अनुसार, पीरियड के पहले 1-2 दिन हल्का दर्द सामान्य है। लेकिन यदि दर्द इतना तेज़ हो कि रोज़मर्रा के काम रुक जाएं, तो यह Endometriosis या Adenomyosis का संकेत हो सकता है। ACOG की गाइडलाइन कहती है कि ऐसे दर्द को 'सामान्य' मानकर सहना नहीं चाहिए — इसका उपचार संभव है।",
    video: {
      label: "पीरियड दर्द — Dr. Cuterus समझाती हैं",
      channel: "Dr. Cuterus",
      url: "https://www.youtube.com/@dr_cuterus",
      embedId: "uzR70T4fnFY",
    },
  },

  // ── Irregular periods ─────────────────────────────────────────────────────
  {
    keywords: [
      "अनियमित",
      "irregular",
      "पीरियड नहीं",
      "aniyamit",
      "irregular period",
      "देर से",
      "der se",
      "जल्दी",
      "missed period",
      "period late",
      "period early",
      "period skip",
      "पीरियड छूट",
      "पीरियड रुक",
      "cycle",
      "साइकिल",
      "28 दिन",
      "21 दिन",
      "महीना",
      "मासिक धर्म",
      "period miss ho gaya",
      "period nahi aaya",
      "period nahi aya",
      "mahina nahi aaya",
      "cycle nahi aai",
      "period jaldi aa gaya",
      "period rukh gaya",
      "period band ho gaya",
      "period skip ho gaya",
      "masik nahi aaya",
      "period time pe nahi aata",
      "mahavari time par nahi aata",
    ],
    answer:
      "यह बहुत आम है और इसका समाधान है — घबराइए नहीं। ICMR के अनुसार, 21 से 35 दिनों के बीच का चक्र सामान्य माना जाता है। इससे अधिक अनियमितता थायराइड असंतुलन, PMOS, या अत्यधिक तनाव के कारण हो सकती है। WHO की सिफारिश है कि यदि 3 महीने से अधिक समय से पीरियड अनियमित हो, तो स्त्री रोग विशेषज्ञ से जांच कराएं।",
    video: {
      label: "अनियमित पीरियड — Maitri Woman Health",
      channel: "Maitri Woman Health",
      url: "https://www.youtube.com/@maitriwomanhealth",
      embedId: "bkoqKWZtB_0",
    },
  },

  // ── Heavy/light bleeding ──────────────────────────────────────────────────
  {
    keywords: [
      "ज़्यादा खून",
      "zyada khoon",
      "bahut bleeding",
      "बहुत bleeding",
      "heavy period",
      "heavy flow",
      "clot",
      "थक्के",
      "पैड जल्दी भर",
      "रात को भी पैड",
      "कम खून",
      "light period",
      "spotting",
      "दाग",
      "brown discharge",
      "black blood",
      "काला खून",
      "khoon zyada aa raha",
      "bahut zyada khoon",
      "thakke aa rahe",
      "pad jaldi bhar jaata",
      "raat ko pad badalna",
      "kam khoon aana",
      "thoda sa khoon",
      "bura rang khoon",
      "kaala khoon aana",
      "bahut zyada bleeding ho rahi",
      "kam bleeding ho rahi",
    ],
    answer:
      "यह सुनकर चिंता होना बिल्कुल स्वाभाविक है — और आपने सही किया बताकर। FOGSI के अनुसार, यदि पीरियड में हर 2 घंटे में पैड बदलनी पड़े या 7 दिन से अधिक चले, तो यह Heavy Menstrual Bleeding (HMB) है। इसके कारण फाइब्रॉएड, थायराइड, या खून जमाने की समस्या हो सकती है। ACOG की गाइडलाइन है कि CBC और अल्ट्रासाउंड जांच से कारण का पता लगाया जाए।",
    video: {
      label: "Heavy bleeding — Fortis Healthcare",
      channel: "Fortis Healthcare",
      url: "https://www.youtube.com/fortishealthcare",
      embedId: "qfje3cYj9Us",
    },
  },

  // ── PMOS / hormones ───────────────────────────────────────────────────────
  {
    keywords: [
      "pcos",
      "pcod",
      "pmos",
      "पीसीओएस",
      "पीसीओडी",
      "पीएमओएस",
      "हॉर्मोन",
      "hormone",
      "सिस्ट",
      "cyst",
      "ovary",
      "अंडाशय",
      "बाल चेहरे",
      "unwanted hair",
      "facial hair",
      "hirsutism",
      "वजन बढ़ना",
      "weight gain",
      "मुँहासे",
      "muhaase",
      "muhase",
      "acne",
      "पिंपल",
      "pimple",
      "testosterone",
      "estrogen",
      "progesterone",
      "lh",
      "fsh",
      "androgen",
      "इंसुलिन",
      "insulin resistance",
      "chehre par bal",
      "chehre pe bal",
      "chehre par baal",
      "chehre pe baal",
      "bal chehre par aana",
      "baal chehre pe",
      "thodi pe baal",
      "thodi par baal",
      "thodi ke baal",
      "thodi pe bal",
      "munh pe baal",
      "munh pe bal",
      "chehre ke baal",
      "chehre ke bal",
      "upper lip baal",
      "upper lip bal",
      "chin pe baal",
      "chin par baal",
      "daadhi jaisi baal",
      "daadhi jaisi bal",
      "unwanted baal",
      "unwanted bal",
      "wajan badh raha",
      "weight badh raha",
      "muhase ho rahe",
      "pimple aa rahe",
      "hormone gadbad",
      "hormone imbalance",
      "ovary mein cyst",
      "andaashay mein ganth",
      "chehre par baal ugna",
      "periods irregular aur weight badhna",
    ],
    answer:
      "यह जानकर परेशान होना बिल्कुल स्वाभाविक है — आप अकेली नहीं हैं। FOGSI और ACOG के अनुसार, भारत में हर पाँच में से एक महिला को PMOS (Polycystic Morphology of Ovaries — जिसे पहले PCOS कहते थे) होता है, जो दुनिया में सबसे अधिक है। इसमें अनियमित पीरियड, वजन बढ़ना, और चेहरे पर अनचाहे बाल आम लक्षण हैं। नियमित व्यायाम, संतुलित आहार, और सही चिकित्सकीय देखभाल से PMOS को बहुत प्रभावी ढंग से नियंत्रित किया जा सकता है।",
    video: {
      label: "PMOS को समझें — PCOS Society India",
      channel: "PCOS Society India",
      url: "https://www.youtube.com/@thepcossocietyindia",
      embedId: "tk-JplDJOEo",
    },
  },

  // ── Appetite / weakness / fatigue / dizziness ─────────────────────────────
  {
    keywords: [
      "भूख",
      "appetite",
      "poor appetite",
      "खाना नहीं",
      "भूख नहीं",
      "खाने का मन नहीं",
      "कमज़ोरी",
      "kamzori",
      "weakness",
      "थकान",
      "thakan",
      "fatigue",
      "tired",
      "exhausted",
      "चक्कर",
      "dizziness",
      "सांस फूलना",
      "breathless",
      "shortness of breath",
      "पीला चेहरा",
      "pale",
      "नींद",
      "lethargy",
      "सुस्ती",
      "energy नहीं",
      "कम ऊर्जा",
      "bhook nahi lagti",
      "bhook nahi lagna",
      "khana nahi khaya",
      "khane ka man nahi",
      "bahut thak jaati hoon",
      "chakkar aa raha",
      "chakkar aata hai",
      "sans foolna",
      "pila chehra ho gaya",
      "energy nahi hai",
      "bahut kamzori",
      "uthne ka mann nahi",
      "chakkar",
      "chakkar aa rahe",
      "bhook bilkul nahi lagti",
      "kamzori mehsoos ho rahi",
    ],
    answer:
      "इन लक्षणों के साथ दिन गुज़ारना सच में बहुत थका देने वाला होता है — आप अकेली नहीं हैं जो यह महसूस करती हैं। भूख न लगना, थकान, और चक्कर आना — ये एनीमिया (खून की कमी) या थायराइड असंतुलन के सबसे आम संकेत हैं। WHO के अनुसार, भारत में 57% महिलाओं में आयरन की कमी है। ICMR की सिफारिश है कि CBC (Complete Blood Count) और TSH जांच से कारण का पता लगाया जा सकता है। इन लक्षणों को नज़रअंदाज़ न करें।",
    article: {
      title: "Anaemia — WHO Fact Sheet",
      source: "WHO",
      url: "https://www.who.int/news-room/fact-sheets/detail/anaemia",
    },
  },

  // ── Anaemia / iron ────────────────────────────────────────────────────────
  {
    keywords: [
      "खून की कमी",
      "एनीमिया",
      "anaemia",
      "anemia",
      "हीमोग्लोबिन",
      "haemoglobin",
      "hemoglobin",
      "आयरन",
      "iron",
      "iron deficiency",
      "ferritin",
      "फेरिटिन",
      "rbc",
      "red blood cell",
      "cbc",
      "blood test",
      "khoon ki kami",
      "khoon kam hai",
      "haemoglobin kam",
      "iron ki kami",
      "iron nahi hai",
      "blood test karna",
      "anaemia hai mujhe",
      "khoon kam ho gaya",
      "anemic hoon",
    ],
    answer:
      "WHO के अनुसार, भारत में 57% महिलाओं में एनीमिया है — मुख्य कारण आयरन की कमी है। ICMR की सिफारिश है कि महिलाओं को प्रतिदिन 29mg आयरन की आवश्यकता है। हरी पत्तेदार सब्ज़ियां, दालें, और विटामिन C के साथ सेवन अवशोषण बढ़ाता है। CBC रक्त परीक्षण से निदान की पुष्टि होती है।",
    video: {
      label: "खून की कमी — Apollo Hospitals",
      channel: "Apollo Hospitals",
      url: "https://www.youtube.com/c/apollohospitalsindia",
      embedId: "_e_QSCzhKhQ",
    },
  },

  // ── Thyroid ───────────────────────────────────────────────────────────────
  {
    keywords: [
      "थायराइड",
      "thyroid",
      "tsh",
      "t3",
      "t4",
      "हाइपो",
      "hypothyroid",
      "हाइपर",
      "hyperthyroid",
      "गले में सूजन",
      "goitre",
      "गोइटर",
      "थायराइड की गोली",
      "levothyroxine",
      "मेटाबॉलिज़्म",
      "metabolism",
      "thyroid hai mujhe",
      "thyroid ki problem",
      "gale mein sujan",
      "thyroid ki goli",
      "thyroid test",
      "metabolism slow ho gaya",
      "wajan bina wajah badh raha",
      "gala sujaa hua",
      "thyroid ki dawai",
    ],
    answer:
      "WHO और ICMR के अनुसार, थायराइड असंतुलन महिलाओं में पुरुषों की तुलना में 5-8 गुना अधिक पाया जाता है। Hypothyroidism से पीरियड भारी और अनियमित हो सकते हैं, वजन बढ़ सकता है और थकान होती है। सामान्य TSH रेंज 0.4-4.0 mIU/L मानी जाती है। वार्षिक TSH जांच की सलाह दी जाती है।",
    video: {
      label: "थायराइड और महिला स्वास्थ्य — Medanta",
      channel: "Medanta Healthcare",
      url: "https://www.youtube.com/@MedantaHealthcare",
      embedId: "XRQgs9ImsaA",
    },
  },

  // ── Menopause / perimenopause ─────────────────────────────────────────────
  {
    keywords: [
      "रजोनिवृत्ति",
      "menopause",
      "मेनोपॉज़",
      "perimenopause",
      "गर्म लहर",
      "hot flash",
      "hot flush",
      "night sweat",
      "रात को पसीना",
      "period बंद",
      "45 साल",
      "50 साल",
      "हड्डी कमज़ोर",
      "osteoporosis",
      "ऑस्टियोपोरोसिस",
      "bone density",
      "rajonivritti",
      "menopause kya hota",
      "period band ho raha",
      "raat ko pasina aata",
      "garam lagta hai achanak",
      "haddi kamzor ho gayi",
      "bone kamzor",
      "umar ke saath period",
      "garmi lagna",
      "achanak garmi lagti",
      "raat ko garmi lagti",
      "period aana band ho gaya",
    ],
    answer:
      "यह जीवन का एक नया अध्याय है — और इसे समझना आपका अधिकार है। WHO के अनुसार, रजोनिवृत्ति आमतौर पर 45-55 वर्ष की उम्र में होती है। ACOG की गाइडलाइन के अनुसार, गर्म लहरें, नींद न आना, और मूड बदलाव Estrogen के घटने से होते हैं। Hormone Replacement Therapy (HRT) सहित कई उपचार विकल्प उपलब्ध हैं — डॉक्टर से परामर्श लें।",
    video: {
      label: "रजोनिवृत्ति — Dr. Megha Khanna",
      channel: "Dr. Megha Khanna",
      url: "https://www.youtube.com/@DrMeghaKhanna",
      embedId: "11J2wCeMdm0",
    },
  },

  // ── Infertility / difficulty conceiving ──────────────────────────────────
  {
    keywords: [
      "cant get pregnant",
      "can't get pregnant",
      "not getting pregnant",
      "unable to conceive",
      "unable to get pregnant",
      "conceive nahi ho raha",
      "pregnant nahi ho rahi",
      "baccha nahi ho raha",
      "baccha nahi ho rahi",
      "bachha nahi ho raha",
      "bachha nahi ho rahi",
      "bachha nahi hota",
      "baccha nahi hota",
      "bachha nahi hua",
      "garbh nahi thahar raha",
      "bachcha paida nahi",
      "conception problem",
      "infertility",
      "बाँझपन",
      "fertility treatment",
      "ivf",
      "iui",
      "egg freezing",
      "ovulation problem",
      "ovulation nahi ho rahi",
      "anda nahi ban raha",
      "period aata hai par pregnant nahi",
      "amh",
      "anti mullerian",
      "ovarian reserve",
      "egg count",
      "egg quality",
      "anda kam hai",
      "iui",
      "ivf kya hai",
      "test tube baby",
      "pregnant nahi ho pa rahi",
      "baccha plan kar rahe hain",
      "baccha kaise hoga",
      "baccha kaise ho",
      "baccha kab hoga",
      "baccha kab ho sakta",
      "baccha chahiye",
      "bachcha chahiye",
      "maa banana chahti",
      "maa ban sakti hoon",
      "pregnant kaise hoon",
      "pregnant kaise hoti",
      "garbhvati kaise hoon",
      "conception kaise hota",
      "conceive kaise kare",
      "conceive kaise hoga",
      "when will i get pregnant",
      "pregnant kab hoongi",
      "pregnant kab hogi",
      "pregnant kab hounga",
      "pregnant kab ho sakti hoon",
      "mujhe pregnant hone mein",
      "pregnant hone mein kitna time",
      "conceive kab hoga",
      "maa kab banungi",
      "maa kab ban sakti hoon",
    ],
    answer:
      "यह बहुत कठिन समय होता है — और आपकी तकलीफ़ बिल्कुल समझ में आती है। WHO के अनुसार, 12 महीने नियमित कोशिश के बाद भी गर्भधारण न होना Infertility कहलाता है। FOGSI की गाइडलाइन है कि पहले TSH, AMH, और Pelvic Ultrasound जांच करें — इनसे अक्सर कारण सामने आ जाता है। PMOS, थायराइड असंतुलन, और Fallopian Tube blockage भारत में सबसे आम कारण हैं — और इनका उपचार संभव है।",
    article: {
      title: "Infertility — WHO Fact Sheet",
      source: "WHO",
      url: "https://www.who.int/news-room/fact-sheets/detail/infertility",
    },
  },

  // ── Pregnancy ─────────────────────────────────────────────────────────────
  {
    keywords: [
      "गर्भावस्था",
      "pregnancy",
      "pregnant",
      "प्रेगनेंसी",
      "गर्भ",
      "गर्भवती",
      "antenatal",
      "prenatal",
      "ultrasound",
      "सोनोग्राफी",
      "delivery",
      "प्रसव",
      "normal delivery",
      "c-section",
      "सिजेरियन",
      "folic acid",
      "फोलिक एसिड",
      "morning sickness",
      "उल्टी",
      "nausea pregnancy",
      "miscarriage",
      "गर्भपात",
      "conceive",
      "गर्भधारण",
      "main pregnant hoon",
      "mujhe pregnancy hai",
      "garbhavati hoon",
      "ma banne wali hoon",
      "baccha chahiye",
      "ulti aa rahi hai",
      "ji maichlaana",
      "garbhpat ho gaya",
      "prasav kab hoga",
      "normal delivery hogi",
      "c section kab",
      "pregnant hoon kya karu",
      "garbhwati hoon",
    ],
    answer:
      "WHO की ANC गाइडलाइन के अनुसार, गर्भावस्था में कम से कम 8 बार प्रसव-पूर्व जांच की सिफारिश की जाती है। FOGSI के अनुसार, फोलिक एसिड, आयरन, और कैल्शियम के नियमित सेवन से माँ और बच्चे दोनों का स्वास्थ्य बेहतर रहता है। गर्भधारण में कठिनाई हो तो स्त्री रोग विशेषज्ञ से जल्द परामर्श लें।",
    video: {
      label: "गर्भावस्था देखभाल — Dr. Megha Khanna",
      channel: "Dr. Megha Khanna",
      url: "https://www.youtube.com/@DrMeghaKhanna",
      embedId: "11J2wCeMdm0",
    },
  },

  // ── Postpartum ────────────────────────────────────────────────────────────
  {
    keywords: [
      "प्रसव के बाद",
      "postpartum",
      "post partum",
      "postnatal",
      "post natal",
      "ppd",
      "delivery के बाद",
      "delivery ke baad",
      "after delivery",
      "after birth",
      "बच्चे के बाद",
      "breastfeeding",
      "स्तनपान",
      "दूध",
      "लोचिया",
      "lochia",
      "postpartum depression",
      "post partum depression",
      "बच्चे के बाद उदासी",
      "delivery ke baad depression",
      "baby blues",
      "नवजात",
      "newborn",
      "baccha hone ke baad",
      "prasav ke baad",
      "stanpan",
      "dudh nahi aa raha",
      "dudh kam hai",
      "naye bacche ki maa",
      "delivery ke baad udaasi",
      "bacche ke baad thakan",
      "delivery ke baad thakan bahut",
    ],
    answer:
      "यह बहुत साहस की बात है कि आपने यह share किया — नई माँ के लिए यह समय बहुत कठिन हो सकता है। FOGSI और WHO के अनुसार, प्रसव के बाद 4-6 हफ्ते तक हल्का मूड बदलाव (baby blues) सामान्य है। लेकिन यदि उदासी, रोना, या बच्चे से दूरी 2 हफ्ते से अधिक रहे, तो यह Postpartum Depression हो सकता है — जो इलाज योग्य है। ACOG की सिफारिश है कि स्तनपान कराने वाली माँ को प्रतिदिन अतिरिक्त 500 कैलोरी और आयरन की ज़रूरत होती है।",
    video: {
      label: "Postpartum Depression — Apollo Hospitals",
      channel: "Apollo Hospitals",
      url: "https://www.youtube.com/watch?v=gxZmbF4oTdE",
      embedId: "gxZmbF4oTdE",
    },
    article: {
      title: "Postpartum Depression — ACOG Patient FAQ",
      source: "ACOG",
      url: "https://www.acog.org/womens-health/faqs/postpartum-depression",
    },
  },

  // ── Vaginal discharge / infection ─────────────────────────────────────────
  {
    keywords: [
      "discharge",
      "सफेद पानी",
      "white discharge",
      "leucorrhoea",
      "योनि स्राव",
      "itching",
      "खुजली",
      "jalan",
      "जलन",
      "burning",
      "smell",
      "बदबू",
      "yeast infection",
      "fungal",
      "bacterial vaginosis",
      "uti",
      "urinary infection",
      "पेशाब में जलन",
      "frequent urination",
      "बार बार पेशाब",
      "std",
      "sti",
      "infection",
      "safed pani",
      "safed pani aa raha",
      "white pani aana",
      "neeche khujali",
      "neeche jalan",
      "bura smell aa raha",
      "peshab mein jalan",
      "baar baar peshab",
      "peshab bar bar aana",
      "yoni mein khujali",
      "neeche se smell",
      "neeche se pani aana",
    ],
    answer:
      "WHO और FOGSI के अनुसार, हल्का पारदर्शी या सफेद स्राव सामान्य है। लेकिन यदि स्राव पीला, हरा, या बदबूदार हो, या खुजली और जलन हो, तो यह Bacterial Vaginosis या Yeast Infection हो सकता है। UTI (पेशाब में संक्रमण) में जलन और बार-बार पेशाब आना आम लक्षण हैं। दोनों का इलाज सरल है — स्त्री रोग विशेषज्ञ से परामर्श लें।",
    video: {
      label: "सफेद पानी — Dr. Neha Gupta, 1mg",
      channel: "1mg",
      url: "https://www.youtube.com/watch?v=QvkyrxH6DYQ",
      embedId: "QvkyrxH6DYQ",
    },
  },

  // ── Breast health ─────────────────────────────────────────────────────────
  {
    keywords: [
      "स्तन",
      "breast",
      "गांठ",
      "lump",
      "mammogram",
      "मैमोग्राम",
      "nipple",
      "निप्पल",
      "breast pain",
      "स्तन दर्द",
      "mastalgia",
      "breast cancer",
      "स्तन कैंसर",
      "self examination",
      "cbse",
      "stan mein ganth",
      "stan dard",
      "chhaati mein ganth",
      "chhaati mein dard",
      "nipple se paani",
      "stan ki janch",
      "breast ki check",
      "chhati mein kuch mehsoos",
      "chest mein ganth",
    ],
    answer:
      "WHO और ACOG के अनुसार, 40 वर्ष की आयु के बाद प्रतिवर्ष मैमोग्राफी की सलाह दी जाती है। FOGSI की गाइडलाइन कहती है कि मासिक स्व-परीक्षण महत्वपूर्ण है — कोई भी नई गांठ, त्वचा में बदलाव, या असामान्य स्राव की तुरंत जांच करानी चाहिए। स्तन दर्द अक्सर हॉर्मोनल होता है और सामान्य हो सकता है।",
    article: {
      title: "Breast Cancer Screening — WHO",
      source: "WHO",
      url: "https://www.who.int/news-room/fact-sheets/detail/breast-cancer",
    },
  },

  // ── Contraception ─────────────────────────────────────────────────────────
  {
    keywords: [
      "गर्भनिरोधक",
      "contraceptive",
      "contraception",
      "birth control",
      "गोली",
      "copper",
      "iud",
      "copper-t",
      "कॉपर टी",
      "condom",
      "कंडोम",
      "family planning",
      "परिवार नियोजन",
      "emergency contraception",
      "i-pill",
      "unwanted pregnancy",
      "नसबंदी",
      "sterilization",
      "tubectomy",
      "garbhnirodh",
      "pregnancy rokne ki goli",
      "copper t lagwana",
      "condom use karna",
      "emergency goli",
      "i pill leni chahiye",
      "pregnancy nahi chahiye",
      "nalsabandi",
      "parivar niyojan",
      "pregnancy se bachne ka tarika",
    ],
    answer:
      "WHO की Medical Eligibility Criteria के अनुसार, गर्भनिरोधक के कई सुरक्षित विकल्प हैं — गोलियां, कॉपर-T, हॉर्मोनल IUD, और कंडोम। FOGSI का सुझाव है कि सही विकल्प आपकी उम्र, स्वास्थ्य स्थिति, और भविष्य की योजनाओं पर निर्भर करता है। Emergency contraception (I-Pill) असुरक्षित संबंध के 72 घंटे के भीतर ली जा सकती है।",
    article: {
      title: "परिवार नियोजन — MoHFW राष्ट्रीय कार्यक्रम",
      source: "MoHFW",
      url: "https://mohfw.gov.in/programmes/reproductive-and-child-health/family-planning",
    },
  },

  // ── Breathing exercise / low mood help ───────────────────────────────────
  {
    keywords: [
      "breathing exercise",
      "deep breathing",
      "breath",
      "saans",
      "साँस",
      "relax kaise",
      "calm kaise",
      "shant kaise",
      "anxiety breathing",
      "kya karu abhi",
      "abhi kya karu",
      "help me now",
      "feel better kaise",
      "low mood help",
      "sad help",
      "udasi se kaise",
      "man theek kaise",
      "मन शांत",
      "घबराहट कम",
      "तनाव कम kaise",
      "stress relief",
    ],
    answer: BREATHING_EXERCISE,
  },

  // ── Mental health / mood / stress ─────────────────────────────────────────
  {
    keywords: [
      "मूड",
      "mood",
      "udasi",
      "उदासी",
      "period depression",
      "pms depression",
      "hormonal depression",
      "anxiety",
      "चिंता",
      "घबराहट",
      "तनाव",
      "stress",
      "रोना",
      "irritable",
      "चिड़चिड़ापन",
      "pms",
      "pmdd",
      "premenstrual",
      "मासिक से पहले",
      "panic",
      "mood swing",
      "मन खराब",
      "man kharab",
      "mann kharab",
      "bura lag raha",
      "bura feel",
      "sad feel",
      "rona aa raha",
      "bahut rona",
      "dil udas",
      "akela feel",
      "अकेलापन",
      "loneliness",
      "mood bahut kharab rehta",
      "chidchidapan bahut hota",
    ],
    answer:
      "यह feeling बहुत real है — और इसका एक नाम भी है। ACOG और WHO के अनुसार, पीरियड से 1-2 हफ्ते पहले मूड बदलाव, चिड़चिड़ापन, और उदासी PMS (Premenstrual Syndrome) के लक्षण हैं — यह Estrogen और Progesterone के उतार-चढ़ाव से होता है। यदि ये लक्षण बहुत गंभीर हों तो यह PMDD हो सकता है जिसका इलाज संभव है। नियमित व्यायाम, पर्याप्त नींद, और काउंसलिंग से राहत मिलती है।",
    article: {
      title: "Premenstrual Syndrome (PMS) — ACOG FAQ",
      source: "ACOG",
      url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome",
    },
  },

  // ── Skin / hair related to hormones ───────────────────────────────────────
  {
    keywords: [
      "बाल झड़ना",
      "hair loss",
      "hair fall",
      "alopecia",
      "गंजापन",
      "बाल पतले",
      "skin",
      "त्वचा",
      "pigmentation",
      "dark spots",
      "काले धब्बे",
      "acanthosis",
      "stretch marks",
      "स्ट्रेच मार्क्स",
      "नाखून",
      "nails brittle",
      "bal jhadna",
      "bal jhadh rahe",
      "bal patale ho rahe",
      "kale dabbe",
      "chehra kala pad raha",
      "gardan kali",
      "stretch marks aa gaye",
      "nakhun toote",
      "baal girna",
      "baal jhad rahe bahut",
      "skin par kale dhabbe",
    ],
    answer:
      "FOGSI के अनुसार, महिलाओं में बाल झड़ने के पीछे अक्सर आयरन की कमी, थायराइड असंतुलन, या PMOS होता है। WHO की गाइडलाइन कहती है कि अत्यधिक बाल झड़ने पर CBC, TSH, और हॉर्मोन पैनल जांच करानी चाहिए। गर्दन और बगल पर काले धब्बे (Acanthosis Nigricans) इंसुलिन प्रतिरोध का संकेत हो सकते हैं — यह PMOS में आम है।",
    article: {
      title: "Polycystic Ovary Syndrome — WHO Fact Sheet",
      source: "WHO",
      url: "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
    },
  },

  // ── Pelvic pain / ovarian cyst / uterus ──────────────────────────────────
  {
    keywords: [
      "pelvic pain",
      "पेल्विक दर्द",
      "ovarian cyst",
      "डिम्बग्रंथि पुटी",
      "uterus",
      "गर्भाशय",
      "uterine fibroid",
      "polyp",
      "पॉलिप",
      "cervix",
      "गर्भाशय ग्रीवा",
      "cervical",
      "pap smear",
      "पैप स्मियर",
      "cancer screening",
      "hpv",
      "एचपीवी",
      "neeche pet mein dard",
      "ovary mein dard",
      "garbaashay mein problem",
      "bacchedaani mein dard",
      "pap smear karna",
      "cervical check",
      "hpv vaccine",
      "cancer ki janch",
      "pet ke niche dabav mehsoos",
    ],
    answer:
      "WHO और FOGSI के अनुसार, पेल्विक दर्द, सूजन, या दबाव महसूस होना Ovarian Cyst, Fibroid, या Endometriosis का संकेत हो सकता है। ACOG की सिफारिश है कि 21 वर्ष की आयु से नियमित Pap Smear कराएं — यह सर्वाइकल कैंसर की रोकथाम का सबसे प्रभावी तरीका है। HPV वैक्सीन 9-26 वर्ष की उम्र में सबसे प्रभावी होती है।",
    video: {
      label: "Ovarian Cyst — Dr. Priyamvada Shah, Cloudnine",
      channel: "Cloudnine Hospitals",
      url: "https://www.youtube.com/watch?v=kgxJLmpRjRY",
      embedId: "kgxJLmpRjRY",
    },
  },

  // ── Nutrition / bone health ───────────────────────────────────────────────
  {
    keywords: [
      "पोषण",
      "nutrition",
      "diet",
      "खान-पान",
      "calcium",
      "कैल्शियम",
      "विटामिन",
      "vitamin d",
      "विटामिन डी",
      "omega",
      "फोलिक",
      "folic",
      "supplement",
      "हड्डी",
      "bone",
      "joint pain",
      "जोड़ों का दर्द",
      "खाना",
      "food",
      "kya khana chahiye",
      "diet mein kya",
      "calcium ki kami",
      "vitamin d ki kami",
      "dhoop nahi milti",
      "haddi mein dard",
      "jodon mein dard",
      "supplement lena chahiye",
      "iron rich food",
      "poshan ki kami",
      "kya khana chahiye periods mein",
    ],
    answer:
      "ICMR की डाइटरी गाइडलाइन के अनुसार, महिलाओं को प्रतिदिन 600mg कैल्शियम, 29mg आयरन, 400mcg फोलिक एसिड, और पर्याप्त विटामिन D की आवश्यकता है। WHO सिफारिश करता है कि रंगीन सब्ज़ियां, दालें, और डेयरी उत्पाद महिलाओं के हॉर्मोन संतुलन में सहायक हैं। विटामिन D की कमी भारत में बहुत आम है — धूप और जांच दोनों ज़रूरी हैं।",
    article: {
      title: "Dietary Guidelines for Indians — ICMR-NIN",
      source: "ICMR",
      url: "https://www.nin.res.in/dietaryguidelines.html",
    },
  },

  // ── Sexual health ─────────────────────────────────────────────────────────
  {
    keywords: [
      "यौन स्वास्थ्य",
      "sexual health",
      "sex",
      "संबंध",
      "दर्द संबंध",
      "painful sex",
      "dyspareunia",
      "libido",
      "इच्छा नहीं",
      "low libido",
      "vaginismus",
      "vaginal dryness",
      "योनि सूखापन",
      "lubricant",
      "sambandh mein dard",
      "sex mein dard",
      "ichha nahi hoti",
      "mann nahi karta",
      "yoni mein sukhapan",
      "intimacy mein problem",
      "shareerik sambandh",
      "sambandh banate waqt dard",
    ],
    answer:
      "WHO के अनुसार, यौन स्वास्थ्य समग्र स्वास्थ्य का अभिन्न हिस्सा है। संभोग के दौरान दर्द (Dyspareunia) के कारण रजोनिवृत्ति से योनि सूखापन, Vaginismus, या Endometriosis हो सकते हैं — ये सभी इलाज योग्य हैं। FOGSI कहती है कि यौन स्वास्थ्य से जुड़ी किसी भी चिंता को डॉक्टर से बेझिझक साझा करें।",
    article: {
      title: "Sexual & Reproductive Health — FOGSI",
      source: "FOGSI",
      url: "https://www.fogsi.org/patient-information/",
    },
  },

  // ── Puberty / first period / adolescent health ────────────────────────────
  {
    keywords: [
      "पहली बार पीरियड",
      "first period",
      "menarche",
      "किशोरावस्था",
      "puberty",
      "लड़की",
      "बच्ची",
      "teen",
      "teenager",
      "13 साल",
      "14 साल",
      "15 साल",
      "छाती",
      "chest development",
      "शरीर बदलाव",
      "body changes",
      "period कब",
      "period शुरू",
      "पीरियड की उम्र",
      "pehli baar period",
      "period kab aayega",
      "period shuru kab",
      "ladki ka period",
      "chhati aa rahi hai",
      "sharir badal raha",
      "umar mein period",
      "beti ka period",
      "period ki umar",
      "beti ko period nahi aaya abhi tak",
    ],
    answer:
      "WHO के अनुसार, लड़कियों में पहला पीरियड (Menarche) आमतौर पर 11-15 वर्ष की उम्र में आता है। FOGSI की गाइडलाइन कहती है कि पहले 1-2 साल अनियमित पीरियड सामान्य है — शरीर हॉर्मोन संतुलन बना रहा होता है। यदि 15 वर्ष तक पीरियड न आए या बहुत तेज़ दर्द हो, तो स्त्री रोग विशेषज्ञ से मिलें।",
    article: {
      title: "Adolescent Menstrual Health — FOGSI",
      source: "FOGSI",
      url: "https://www.fogsi.org/patient-information/",
    },
  },

  // ── Hormonal migraine / headache ──────────────────────────────────────────
  {
    keywords: [
      "सिरदर्द",
      "headache",
      "migraine",
      "माइग्रेन",
      "period headache",
      "पीरियड में सिरदर्द",
      "hormonal headache",
      "आँखों में दर्द",
      "nausea headache",
      "उल्टी सिरदर्द",
      "half head pain",
      "आधा सिर दर्द",
      "sir dard",
      "sar dard",
      "adha sir dard",
      "migraine ho raha",
      "period mein sir dard",
      "sar mein dard",
      "aankhon mein dard",
      "sir bhaari lagta",
      "sir mein dard period se pehle",
    ],
    answer:
      "ACOG के अनुसार, पीरियड से पहले या दौरान सिरदर्द Estrogen के अचानक घटने से होता है — इसे Menstrual Migraine कहते हैं। WHO की गाइडलाइन कहती है कि यह 20-30% महिलाओं को प्रभावित करता है। पर्याप्त पानी, नियमित नींद, और तनाव कम करने से राहत मिलती है। बार-बार गंभीर माइग्रेन हो तो न्यूरोलॉजिस्ट से परामर्श लें।",
    article: {
      title: "Migraine — Mayo Clinic",
      source: "Mayo Clinic",
      url: "https://www.mayoclinic.org/diseases-conditions/migraine-headache/symptoms-causes/syc-20360201",
    },
  },

  // ── Bloating / gas / digestive issues ────────────────────────────────────
  {
    keywords: [
      "bloating",
      "सूजन",
      "पेट फूलना",
      "pet fulna",
      "gas",
      "गैस",
      "acidity",
      "एसिडिटी",
      "constipation",
      "कब्ज़",
      "ibs",
      "irritable bowel",
      "period bloating",
      "पीरियड में सूजन",
      "पेट भारी",
      "digestion",
      "पाचन",
      "pet fool raha",
      "gas ban rahi",
      "acidity ho rahi",
      "kabz ho raha",
      "pet bhaari lag raha",
      "khana hazam nahi",
      "paacan theek nahi",
      "period mein pet fulta",
      "pet phoola hua lagta",
    ],
    answer:
      "FOGSI के अनुसार, पीरियड से पहले पेट फूलना और गैस Progesterone के कारण होती है — यह बहुत आम है। WHO की गाइडलाइन कहती है कि महिलाओं में IBS (Irritable Bowel Syndrome) पुरुषों की तुलना में दोगुना पाया जाता है और यह हॉर्मोन से जुड़ा है। नमक कम करें, पानी अधिक पिएं, और प्रोसेस्ड फ़ूड से बचें।",
    article: {
      title: "Digestive Health & Women — FOGSI",
      source: "FOGSI",
      url: "https://www.fogsi.org/patient-information/",
    },
  },

  // ── Vitamin B12 deficiency ────────────────────────────────────────────────
  {
    keywords: [
      "b12",
      "विटामिन बी12",
      "vitamin b12",
      "b12 कमी",
      "nerve",
      "नसें",
      "numbness",
      "सुन्नपन",
      "झनझनाहट",
      "tingling",
      "vegetarian",
      "शाकाहारी",
      "vegan",
      "cobalamin",
      "b12 ki kami",
      "haath pair mein jhanjhanahat",
      "sunnapan",
      "haath pair sote",
      "thakan zyada",
      "shakahari hoon",
      "veg khana khati hoon",
      "nerve problem",
      "haath pair sunn ho jaate",
    ],
    answer:
      "ICMR के अनुसार, भारत में शाकाहारी महिलाओं में Vitamin B12 की कमी बहुत आम है क्योंकि B12 मुख्यतः पशु उत्पादों में पाया जाता है। WHO की गाइडलाइन कहती है कि B12 की कमी से थकान, हाथ-पैरों में झनझनाहट, और याददाश्त कमज़ोर होना हो सकता है। गर्भावस्था में B12 की कमी बच्चे के नर्वस सिस्टम को प्रभावित कर सकती है — नियमित जांच ज़रूरी है।",
    article: {
      title: "Vitamin B12 Deficiency — ICMR-NIN",
      source: "ICMR",
      url: "https://www.nin.res.in/dietaryguidelines.html",
    },
  },

  // ── Gestational diabetes / diabetes in women ──────────────────────────────
  {
    keywords: [
      "gestational diabetes",
      "गर्भावस्था में शुगर",
      "sugar",
      "शुगर",
      "diabetes",
      "मधुमेह",
      "blood sugar",
      "glucose",
      "hba1c",
      "insulin",
      "type 2",
      "प्रेगनेंसी में शुगर",
      "gtt",
      "glucose tolerance",
      "sugar ki bimari",
      "mujhe diabetes hai",
      "pregnancy mein sugar",
      "blood sugar badhna",
      "sugar control",
      "madhumeh",
      "insulin leni padti",
      "sugar ki jaanch karani hai",
    ],
    answer:
      "WHO के अनुसार, Gestational Diabetes (गर्भावस्था में मधुमेह) 5-10% गर्भवती महिलाओं में होती है और बच्चे के जन्म के बाद अक्सर ठीक हो जाती है। FOGSI की सिफारिश है कि 24-28 सप्ताह पर GTT (Glucose Tolerance Test) ज़रूर कराएं। PMOS वाली महिलाओं में Type 2 Diabetes का खतरा अधिक होता है — वार्षिक HbA1c जांच करें।",
    article: {
      title: "Gestational Diabetes Guidelines — ICMR",
      source: "ICMR",
      url: "https://www.icmr.gov.in/guidelines.html",
    },
  },

  // ── Urinary incontinence / pelvic floor ──────────────────────────────────
  {
    keywords: [
      "urinary incontinence",
      "पेशाब लीकेज",
      "pelvic floor",
      "kegel",
      "कीगल",
      "bladder",
      "मूत्राशय",
      "खाँसने पर पेशाब",
      "हँसने पर पेशाब",
      "leak urine",
      "prolapse",
      "गर्भाशय नीचे",
      "uterine prolapse",
      "hanste waqt peshab",
      "khanste waqt peshab",
      "peshab leak hoti",
      "kegel exercise kaise",
      "neeche pressure lagta",
      "bacchedaani neeche",
      "hasne par peshab nikal jata",
    ],
    answer:
      "ACOG और FOGSI के अनुसार, प्रसव के बाद या रजोनिवृत्ति में Pelvic Floor कमज़ोर होने से हँसने, खाँसने पर पेशाब लीक हो सकता है — यह बहुत आम है पर इसके बारे में बात नहीं होती। Kegel exercises से 70% महिलाओं को राहत मिलती है। गंभीर मामलों में Physiotherapy या सर्जरी का विकल्प उपलब्ध है।",
    article: {
      title: "Urinary Incontinence — ACOG Patient FAQ",
      source: "ACOG",
      url: "https://www.acog.org/womens-health/faqs/urinary-incontinence",
    },
  },

  // ── Menstrual hygiene / products ──────────────────────────────────────────
  {
    keywords: [
      "pad",
      "पैड",
      "tampon",
      "टैम्पन",
      "menstrual cup",
      "मेंस्ट्रुअल कप",
      "sanitary",
      "hygiene",
      "साफ-सफाई",
      "पीरियड के दौरान",
      "period care",
      "रैश",
      "rash",
      "infection from pad",
      "cloth pad",
      "कपड़ा",
      "pad kab badlein",
      "pad kitne ghante",
      "menstrual cup kaise",
      "period mein rash",
      "kapda use karna",
      "sanitary pad nahi hai",
      "pad se infection",
      "saaf safai period mein",
      "pad kitni der use karein",
    ],
    answer:
      "WHO और UNICEF की गाइडलाइन कहती है कि Sanitary Pad, Tampon, और Menstrual Cup — सभी सुरक्षित विकल्प हैं। Pad हर 4-6 घंटे में बदलें — ज़्यादा देर रखने से संक्रमण और रैश हो सकता है। Menstrual Cup 8-12 घंटे तक उपयोग किया जा सकता है और पर्यावरण के लिए बेहतर है। साफ, सूती अंडरवियर पहनें।",
    article: {
      title: "Periods & Menstrual Hygiene — NHS",
      source: "NHS",
      url: "https://www.nhs.uk/conditions/periods/",
    },
  },

  // ── Sleep / insomnia ──────────────────────────────────────────────────────
  {
    keywords: [
      "नींद नहीं",
      "neend nahi",
      "insomnia",
      "sleep",
      "नींद",
      "रात को जागना",
      "night waking",
      "नींद की कमी",
      "poor sleep",
      "sleep disturbance",
      "सोने में दिक्कत",
      "नींद की गोली",
      "melatonin",
      "sleepless",
      "neend nahi aati",
      "raat ko jaagna",
      "so nahi paati",
      "sone mein dikkat",
      "der se neend aati",
      "neend poori nahi hoti",
      "uthke nahi so paati",
      "raat ko neend nahi aati",
    ],
    answer:
      "ACOG के अनुसार, महिलाओं में नींद की समस्या पुरुषों की तुलना में 40% अधिक होती है — इसका मुख्य कारण हॉर्मोन उतार-चढ़ाव, PMS, गर्भावस्था, और रजोनिवृत्ति है। WHO की सिफारिश है कि महिलाओं को प्रतिदिन 7-9 घंटे की नींद ज़रूरी है। सोने से 1 घंटे पहले स्क्रीन बंद करें, एक निश्चित समय पर सोएं, और कैफीन से बचें।",
    article: {
      title: "Insomnia — Mayo Clinic",
      source: "Mayo Clinic",
      url: "https://www.mayoclinic.org/diseases-conditions/insomnia/symptoms-causes/syc-20355167",
    },
  },

  // ── Exercise / physical activity ──────────────────────────────────────────
  {
    keywords: [
      "exercise",
      "व्यायाम",
      "yoga",
      "योग",
      "workout",
      "period में exercise",
      "पीरियड में योग",
      "walking",
      "चलना",
      "gym",
      "physical activity",
      "खेलकूद",
      "sport",
      "running",
      "दौड़ना",
      "period mein exercise karein",
      "period mein gym jaana",
      "period mein yoga",
      "vyayam karna chahiye",
      "period mein chalna",
      "exercise safe hai",
      "workout period time",
      "gym jaana chahiye periods mein",
    ],
    answer:
      "WHO की गाइडलाइन के अनुसार, पीरियड के दौरान हल्का व्यायाम — जैसे चलना, योग, और स्ट्रेचिंग — दर्द और थकान में राहत देता है। ACOG कहती है कि महिलाओं को प्रति सप्ताह कम से कम 150 मिनट मध्यम तीव्रता का व्यायाम करना चाहिए। PMOS और PMS दोनों में नियमित व्यायाम हॉर्मोन संतुलन में सबसे प्रभावी गैर-दवा उपाय है।",
    article: {
      title: "Exercise in Women — NHS",
      source: "NHS",
      url: "https://www.nhs.uk/live-well/exercise/",
    },
  },

  // ── Stress & periods / lifestyle ─────────────────────────────────────────
  {
    keywords: [
      "तनाव से पीरियड",
      "stress period",
      "period delay stress",
      "travel period",
      "सफर में पीरियड",
      "weight loss period",
      "dieting period",
      "पीरियड पर असर",
      "lifestyle",
      "जीवनशैली",
      "tanav se period late",
      "tension se period rukha",
      "safar mein period",
      "dieting se period",
      "wajan ghataane se period",
      "stress mein period miss",
      "jeevanshaili",
      "tension mein period late ho jata",
    ],
    answer:
      "WHO और ACOG के अनुसार, अत्यधिक तनाव, अचानक वजन घटना, लंबी यात्रा, या नींद न आना — ये सब Cortisol बढ़ाते हैं जो Estrogen और Progesterone को प्रभावित करता है और पीरियड में देरी ला सकता है। यह शरीर की सामान्य प्रतिक्रिया है। यदि 2-3 महीने से अधिक हो तो जांच ज़रूरी है।",
    article: {
      title: "Stress Management — Mayo Clinic",
      source: "Mayo Clinic",
      url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/basics/stress-basics/hlv-20049495",
    },
  },

  // ── Autoimmune / thyroid / lupus ──────────────────────────────────────────
  {
    keywords: [
      "autoimmune",
      "lupus",
      "rheumatoid",
      "arthritis",
      "गठिया",
      "joint swelling",
      "जोड़ों में सूजन",
      "autoimmune disease",
      "hashimoto",
      "हाशिमोटो",
      "inflammatory",
      "सूजन रोग",
      "gathiya",
      "jodon mein sujan",
      "autoimmune bimari",
      "immune system problem",
      "jodon mein dard sujan",
      "hashimoto thyroid",
      "joint mein sujan rehti",
    ],
    answer:
      "WHO के अनुसार, Autoimmune बीमारियाँ पुरुषों की तुलना में महिलाओं में 3 गुना अधिक होती हैं — इसका कारण Estrogen का प्रतिरक्षा तंत्र पर प्रभाव माना जाता है। Hashimoto's Thyroiditis (थायराइड की सूजन), Rheumatoid Arthritis, और Lupus महिलाओं में सबसे आम हैं। नियमित जांच और स्त्री रोग विशेषज्ञ व रुमेटोलॉजिस्ट की टीम से देखभाल ज़रूरी है।",
    article: {
      title: "Autoimmune Disease in Women — NCBI",
      source: "NCBI",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3328995/",
    },
  },
];

export const OUT_OF_SCOPE =
  "मैं केवल महिला स्वास्थ्य विषयों पर WHO, FOGSI, ICMR, और ACOG द्वारा सत्यापित जानकारी दे सकती हूँ। कृपया महिला स्वास्थ्य से संबंधित प्रश्न पूछें।" +
  DISCLAIMER_HI;

export function isBlockerResponse(answer: string): boolean {
  return (
    answer.includes("मैं केवल महिला स्वास्थ्य") ||
    answer.includes("इस बारे में मेरे पास अभी सत्यापित जानकारी नहीं") ||
    !answer
  );
}

const DEFAULT =
  "इस बारे में मेरे पास अभी सत्यापित जानकारी नहीं है — लेकिन आप पूछती रहिए। आप पीरियड दर्द, PMOS, एनीमिया, थायराइड, रजोनिवृत्ति, गर्भावस्था, या यौन स्वास्थ्य से जुड़े सवाल पूछ सकती हैं — इन पर सखी के पास WHO और FOGSI से सत्यापित जानकारी है।" +
  DISCLAIMER_HI;

const SERVICE_ERROR =
  "अभी सखी को जवाब देने में थोड़ी दिक्कत हो रही है। कृपया कुछ सेकंड बाद फिर कोशिश करें।" +
  DISCLAIMER_HI;

const MALE_IDENTIFIER_RESPONSE =
  "सखी विशेष रूप से महिलाओं के स्वास्थ्य के लिए बनाई गई है — पीरियड, PMOS, हॉर्मोन, और स्त्री स्वास्थ्य से जुड़े विषयों पर। अगर आपके जीवन में कोई महिला है जिन्हें इन विषयों पर जानकारी चाहिए, तो आप उनके लिए सखी का उपयोग कर सकते हैं।";

const MALE_IDENTIFIERS = [
  "main mard hoon",
  "main admi hoon",
  "main admi hun",
  "main aadmi hoon",
  "main aadmi hun",
  "main ladka hoon",
  "main purush hoon",
  "main boy hoon",
  "main male hoon",
  "मैं आदमी हूँ",
  "mein admi hun",
  "mein aadmi hun",
  "i am male",
  "i am a man",
  "i am a boy",
  "i'm male",
  "i'm a man",
  "मैं पुरुष हूँ",
  "मैं लड़का हूँ",
  "मैं मर्द हूँ",
  "main purush hun",
  "main mard hun",
  "mujhe period nahi hota",
  "mujhe period nahi aata",
  "hum mard hain",
  "ham purush hain",
  "bhai hoon",
  "main bhai hoon",
  "main uncle hoon",
  "main baap hoon",
  "main papa hoon",
  "main husband hoon",
  "main pati hoon",
  "मैं पति हूँ",
  "मैं पापा हूँ",
  "मैं भाई हूँ",
];

export const MALE_RESPONSE =
  "सखी विशेष रूप से महिलाओं के स्वास्थ्य के लिए बनाई गई है — पीरियड, PMOS, हॉर्मोन, और स्त्री स्वास्थ्य से जुड़े विषयों पर। अगर आपके जीवन में कोई महिला है जिन्हें इन विषयों पर जानकारी चाहिए, तो आप उनके लिए सखी का उपयोग कर सकते हैं।";

export function isMaleIdentifier(q: string): boolean {
  const ql = q.toLowerCase().trim();
  return MALE_IDENTIFIERS.some((p) => ql.includes(p));
}

const OFF_TOPIC_WORDS = [
  "मौसम",
  "weather",
  "recipe",
  "khana banana",
  "खाना बनाना",
  "cricket",
  "ipl",
  "football",
  "match",
  "news",
  "samachar",
  "समाचार",
  "राजनीति",
  "politics",
  "election",
  "chunav",
  "share market",
  "stock",
  "mutual fund",
  "sensex",
  "nifty",
  "पैसा invest",
  "loan",
  "emi",
  "tax",
  "shaadi",
  "marriage",
  "divorce",
  "relationship",
  "job",
  "naukri",
  "career",
  "resume",
  "interview",
  "movie",
  "film",
  "web series",
  "netflix",
  "astrology",
  "rashifal",
  "horoscope",
  "travel",
  "flight",
  "hotel",
  "coding",
  "software",
  "technology",
];

// ── Escalation responses (Section 6 of guardrails spec) ──────────────────────

const CRISIS_RESPONSE =
  "आपने जो share किया वो मेरे लिए बहुत ज़रूरी है। अभी सबसे पहले — कृपया iCall helpline पर call करें: 9152987821 (सोमवार–शनिवार, सुबह 8 से रात 10 बजे)। अगर आप तुरंत किसी से बात करना चाहती हैं तो Vandrevala Foundation का नंबर 1860-2662-345 है जो 24×7 उपलब्ध है। आप अकेली नहीं हैं — मदद लेना ताक़त की निशानी है। 💜";

const ABUSE_RESPONSE =
  "आपने जो बताया उसके लिए बहुत हिम्मत चाहिए — और आपने सही किया। आप safe हैं यहाँ। अगर आपको अभी मदद चाहिए, तो राष्ट्रीय महिला हेल्पलाइन पर call करें: 181 (24×7, निःशुल्क)। आप जितना चाहें उतना share करें — कोई दबाव नहीं है। 💜";

const REDFLAG_RESPONSE =
  "आपने जो बताया वो serious है और इसमें देरी नहीं करनी चाहिए। कृपया अभी किसी नज़दीकी डॉक्टर या अस्पताल में जाएं — या किसी को साथ जाने के लिए कहें। आपकी सेहत सबसे पहले है। 💜";

const DIAGNOSIS_REQUEST_RESPONSE =
  "सखी आपकी स्वास्थ्य सहेली है — diagnosis या दवा बताना मेरे दायरे में नहीं है, और यह सही भी नहीं होगा बिना आपकी पूरी जाँच के। इसके लिए एक qualified gynecologist से मिलना ज़रूरी है। क्या मैं इस विषय पर verified जानकारी ढूँढने में मदद करूँ?";

const CRISIS_TRIGGERS = [
  "marna chahti",
  "marna chahti hoon",
  "mar jaun",
  "mar jaana chahti",
  "zindagi khatam",
  "jeena nahi chahti",
  "suicide",
  "self harm",
  "khud ko takleef",
  "मरना चाहती",
  "मर जाऊँ",
  "जीना नहीं",
  "आत्महत्या",
  "ज़िंदगी खत्म",
  "khud ko hurt",
  "apne aap ko chot",
  "नस काटना",
  "nas katna",
];

const ABUSE_TRIGGERS = [
  "mujhe maar",
  "pita hai",
  "maar raha hai",
  "maarta hai",
  "dahej",
  "ghar se nikala",
  "jalaya",
  "dhamki",
  "darr rahi hoon",
  "ghabraa rahi",
  "मुझे मारा",
  "मारता है",
  "पीटता है",
  "दहेज",
  "घर से निकाला",
  "domestic violence",
  "abuse",
  "torture",
  "प्रताड़ना",
];

const REDFLAG_SYMPTOM_TRIGGERS = [
  "bahut zyada bleeding chakkar",
  "heavy bleeding unconscious",
  "khoon nahi ruk raha",
  "bleeding nahi ruk rahi",
  "bahut zyada dard behoshi",
  "severe pain faint",
  "बहुत ज़्यादा खून चक्कर",
  "खून नहीं रुक रहा",
  "बेहोशी",
  "बहुत तेज़ दर्द बेहोशी",
];

const DIAGNOSIS_TRIGGERS = [
  "mujhe kya bimari hai",
  "kya mujhe x hai",
  "mere test results",
  "kya yeh cancer hai",
  "kaunsi dawa lun",
  "kaunsi tablet",
  "kaun si medicine",
  "dose kitni",
  "kitni mg",
  "मुझे क्या बीमारी है",
  "कौन सी दवा",
  "कितनी mg",
  "dose बताओ",
];

function isEscalation(q: string): "crisis" | "abuse" | "redflag" | "diagnosis" | null {
  const ql = q.toLowerCase();
  if (CRISIS_TRIGGERS.some((t) => ql.includes(t))) return "crisis";
  if (ABUSE_TRIGGERS.some((t) => ql.includes(t))) return "abuse";
  if (REDFLAG_SYMPTOM_TRIGGERS.some((t) => ql.includes(t))) return "redflag";
  if (DIAGNOSIS_TRIGGERS.some((t) => ql.includes(t))) return "diagnosis";
  return null;
}

// All words in the keyword must appear in the query — order and filler words don't matter
function matchesKeyword(q: string, kw: string): boolean {
  return kw
    .toLowerCase()
    .split(/\s+/)
    .every((word) => q.includes(word));
}

function findResponse(
  question: string,
  lang: "hi" | "en" = "hi",
): { answer: string; video?: Video; article?: Article } {
  const q = question.toLowerCase();
  if (OFF_TOPIC_WORDS.some((w) => new RegExp(`(?<![a-z])${w}(?![a-z])`, "i").test(q)))
    return { answer: OUT_OF_SCOPE };
  for (const r of RESPONSES) {
    if (r.keywords.some((kw) => matchesKeyword(q, kw))) {
      return sourcedResult(r, lang);
    }
  }
  return { answer: DEFAULT };
}

function sourcedResult(
  r: (typeof RESPONSES)[number],
  lang: "hi" | "en" = "hi",
): {
  answer: string;
  video?: Video;
  article?: Article;
} {
  const video = r.video?.embedId ? r.video : undefined;
  const article = !video && r.article ? { ...r.article, summary: r.answer } : undefined;
  const disclaimer = lang === "en" ? DISCLAIMER_EN : DISCLAIMER_HI;
  return { answer: r.answer + disclaimer, video, article };
}

const SAKHI_SYSTEM_EN = `You are Doctor Friend — a warm, empathetic women's health companion on JioBharatIQ. You speak like a knowledgeable elder sister — supportive, non-judgmental, never preachy.

SCOPE — respond ONLY to these topics:
periods, menstrual health, PMOS, hormones, pregnancy, fertility, postpartum, menopause, anaemia, thyroid, vaginal health, breast health, contraception, nutrition for women, mental health related to hormones/periods, skin/hair related to hormones, pelvic health, sexual health, puberty, women's sleep issues, exercise during periods.

GUARDRAILS — if any other topic comes up (politics, weather, recipes, relationships, career, cricket, finance, general knowledge, tech, entertainment — ANYTHING not in the list above), say ONLY this one line:
"I can only help with women's health questions — like periods, hormones, pregnancy, or nutrition. Feel free to ask any health question! 💜"

ANSWER RULES:
- ALWAYS respond in clear, simple English only.
- Always write PMOS (never PCOS).
- Always use "you" — warm and direct.
- Structure every answer: first validate (acknowledge how they feel) → then inform → then one actionable step.
- Only ONE question per turn — never ask two at once.
- Keep answers concise and warm — 3-5 sentences.
- NEVER diagnose ("you have X" — never say this). Use probabilistic language: "this can sometimes indicate…", "many women experience…"
- NEVER mention drug names, tablet names, or dosages. If asked, refer to a doctor.
- No fabricated statistics — only FOGSI/ICMR/WHO verified numbers. If unsure, skip the number.
- Never add a disclaimer — it comes from the system.
- Never treat periods, sex, or mental health as taboo or shameful.`;

const SAKHI_SYSTEM = `Tum Sakhi ho — ek samajhdaar, empathetic mahila health companion jo JioBharatIQ par kaam karti hai. Tum ek jaankar badi behan ki tarah baat karti ho — warm, non-judgemental, kabhi preachy nahi.

SCOPE — tum SIRF in topics par jawab deti ho:
periods, menstrual health, PMOS, hormones, pregnancy, fertility, postpartum, menopause, anaemia, thyroid, vaginal health, breast health, contraception, nutrition for women, mental health related to hormones/periods, skin/hair related to hormones, pelvic health, sexual health, puberty, women's sleep issues, exercise during periods.

GUARDRAILS — agar koi bhi aur topic aaye (politics, weather, recipes, relationships, marriage, career, cricket, finance, general knowledge, tech, entertainment — KUCH BHI jo upar list mein nahi hai), tum SIRF yeh ek line bolna:
"मैं केवल महिला स्वास्थ्य से जुड़े सवालों में मदद कर सकती हूँ — जैसे पीरियड, हॉर्मोन, गर्भावस्था, या पोषण। कोई स्वास्थ्य सवाल हो तो ज़रूर पूछें! 💜"

ANSWER RULES:
- HAMESHA SIRF Hindi Devanagari script mein jawab do — Roman/English script BILKUL mat use karo. Sirf numbers aur medical terms (jaise PMOS, WHO, TSH, HbA1c) Roman mein likh sakte ho.
- PCOS ko hamesha PMOS likho — kabhi PCOS mat likho.
- Hamesha "aap" use karo — kabhi "tu" ya "tum" mat bolna.
- Hamesha female verb forms use karo: "jaanti hoon", "samajhti hoon", "kehna chahungi".
- Har jawab ka structure: pehle validate (feel acknowledge karo) → phir inform → phir ek actionable step.
- EK turn mein sirf EK sawaal — kabhi ek saath do sawaal mat poocho.
- Answers concise aur warm rakhna — 3-5 sentences.
- KABHI diagnosis mat do ("aapko X hai" — yeh BILKUL mat bolna). Probabilistic language use karo: "yeh kabhi kabhi indicate kar sakta hai…", "kaafi mahilaon mein aisa hota hai…"
- KABHI koi drug name, tablet name, ya dosage mat batao. Agar poocha jaaye to doctor referral do.
- Koi fabricated statistics ya studies mat banao — sirf FOGSI/ICMR/WHO se verified numbers use karo. Agar sure na ho to number hi mat do.
- Kabhi disclaimer mat lagao — woh system se aata hai.
- Periods, sex, aur mental health ko kabhi taboo ya sharmindagi se mat joṛo.`;

async function llmAnswer(question: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 400,
      messages: [
        { role: "system", content: SAKHI_SYSTEM },
        { role: "user", content: question },
      ],
    }),
  });
  if (!res.ok) throw new Error("Groq error");
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  return text ? text + DISCLAIMER_HI : OUT_OF_SCOPE;
}

export type SakhiResponse = { answer: string; video?: Video; article?: Article; isLlm?: boolean };
export type SakhiTurn = { role: "user" | "assistant"; content: string };

const CLARIFICATION_PHRASES = [
  "samjhi nahi",
  "samjha nahi",
  "samajh nahi",
  "samajh nahi aaya",
  "samajh nahi aayi",
  "dobara batao",
  "phir se batao",
  "phir se samjhao",
  "dobara samjhao",
  "simple mein batao",
  "aasaan bhasha mein",
  "easy mein batao",
  "kya matlab",
  "matlab kya",
  "iska matlab",
  "ye kya hai",
  "aur batao",
  "thoda aur",
  "explain karo",
  "explain karo please",
  "समझी नहीं",
  "समझा नहीं",
  "दोबारा बताओ",
  "आसान भाषा में",
];

function isClarificationQuery(q: string): boolean {
  const ql = q.toLowerCase();
  return CLARIFICATION_PHRASES.some((p) => ql.includes(p));
}

const VAGUE_FOLLOWUP_PHRASES = [
  "aisa kyun",
  "aisa kyu",
  "ऐसा क्यों",
  "ऐसा क्यूँ",
  "kyun hota hai",
  "kyun hoti hai",
  "kyu hota hai",
  "क्यों होता है",
  "क्यों होती है",
  "aur kya",
  "aur kuch",
  "aur batao",
  "aur samjhao",
  "theek hoga",
  "theek hogi",
  "kab theek",
  "kab better",
  "kya kare",
  "kya karun",
  "kya karengi",
  "kya karna chahiye",
  "kaise theek",
  "kaise better",
  "kaise kam hoga",
  "kitna time",
  "kitne din",
  "kitne time mein",
];

function isVagueFollowup(q: string): boolean {
  const ql = q.toLowerCase().trim();
  if (ql.length < 30 && VAGUE_FOLLOWUP_PHRASES.some((p) => ql.includes(p))) {
    const hasHealthKeyword = [
      "period",
      "pcos",
      "thyroid",
      "anemia",
      "pregnancy",
      "baccha",
      "garbh",
      "पीरियड",
      "पीसीओएस",
      "थायरॉइड",
      "एनीमिया",
      "गर्भ",
    ].some((k) => ql.includes(k));
    return !hasHealthKeyword;
  }
  return false;
}

// Build a query string from recent USER turns only — avoids noise from Sakhi's long responses
function buildContextQuery(history: SakhiTurn[]): string {
  return history
    .slice(-10)
    .filter((t) => t.role === "user")
    .map((t) => t.content)
    .join(" ")
    .toLowerCase();
}

export async function askSakhi(
  question: string,
  history: SakhiTurn[] = [],
  lang: "hi" | "en" = "hi",
): Promise<SakhiResponse> {
  const systemPrompt = lang === "en" ? SAKHI_SYSTEM_EN : SAKHI_SYSTEM;
  if (!question.trim())
    return { answer: lang === "en" ? "No question received." : "कोई प्रश्न नहीं मिला।" };

  if (isMaleIdentifier(question)) return { answer: MALE_IDENTIFIER_RESPONSE };

  // Escalation checks — these override ALL other routing (Section 6 of guardrails spec)
  const escalation = isEscalation(question);
  if (escalation === "crisis") return { answer: CRISIS_RESPONSE };
  if (escalation === "abuse") return { answer: ABUSE_RESPONSE };
  if (escalation === "redflag") return { answer: REDFLAG_RESPONSE };
  if (escalation === "diagnosis") return { answer: DIAGNOSIS_REQUEST_RESPONSE };

  // If user asks for re-explanation and there's history, go straight to LLM
  if (isClarificationQuery(question) && history.length > 0) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) return { answer: OUT_OF_SCOPE };
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content:
                systemPrompt +
                (lang === "en"
                  ? "\n\nThe user didn't understand the last answer. Explain the same thing again, simpler and shorter in English. 2-3 sentences. Don't start a new topic."
                  : "\n\nUser ne pichla jawab nahi samjha. Wahi baat dobara aur simple, short Hindi mein samjhao. 2-3 sentences mein. Koi naya topic mat shuru karo."),
            },
            ...history.slice(-6),
            { role: "user", content: question },
          ],
        }),
      });
      if (!res.ok) return { answer: SERVICE_ERROR };
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      return {
        answer: text ? text + (lang === "en" ? DISCLAIMER_EN : DISCLAIMER_HI) : SERVICE_ERROR,
        isLlm: !!text,
      };
    } catch {
      return { answer: SERVICE_ERROR };
    }
  }

  // Vague contextual follow-up — look up topic from user's prior messages and serve matched content
  if (isVagueFollowup(question) && history.length > 0) {
    const contextQuery = buildContextQuery(history);
    const contextResult = findResponse(contextQuery, lang);
    if (contextResult.answer !== DEFAULT) return contextResult;
    // No topic found in history — ask user to be more specific; never send vague query to LLM
    return {
      answer:
        lang === "en"
          ? "Which topic would you like to know more about? For example — period pain, PMOS, stress, anaemia, thyroid, or sleep?"
          : "आप किस विषय के बारे में और जानना चाहती हैं? जैसे — पीरियड दर्द, PMOS, तनाव, एनीमिया, थायराइड, या नींद?",
    };
  }

  const result = findResponse(question, lang);
  if (result.answer !== DEFAULT) return result;
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) return { answer: OUT_OF_SCOPE };
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-8),
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) return { answer: SERVICE_ERROR };
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    return {
      answer: text ? text + (lang === "en" ? DISCLAIMER_EN : DISCLAIMER_HI) : SERVICE_ERROR,
      isLlm: !!text,
    };
  } catch {
    return { answer: SERVICE_ERROR };
  }
}
