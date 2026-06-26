import { NextRequest } from "next/server";

// ─── Prototype mock — WHO/FOGSI/ICMR/ACOG verified content ───────────────────

const DISCLAIMER =
  "\n\n⚠️ यह जानकारी केवल शैक्षिक उद्देश्य के लिए है। कृपया किसी विशेषज्ञ डॉक्टर से अवश्य मिलें।";

const RESPONSES: { keywords: string[]; answer: string }[] = [
  // ── Period pain & cramps ──────────────────────────────────────────────────
  {
    keywords: [
      "दर्द",
      "ऐंठन",
      "मरोड़",
      "period pain",
      "cramp",
      "dysmenorrhoea",
      "पेट दर्द",
      "कमर दर्द",
      "back pain during period",
      "पीठ दर्द",
      "endometriosis",
      "एंडोमेट्रियोसिस",
      "adenomyosis",
      "एडेनोमायोसिस",
      "fibroid",
      "फाइब्रॉएड",
      "गर्भाशय में दर्द",
    ],
    answer:
      "FOGSI और WHO के अनुसार, पीरियड के पहले 1-2 दिन हल्का दर्द सामान्य है। लेकिन यदि दर्द इतना तेज़ हो कि रोज़मर्रा के काम रुक जाएं, तो यह Endometriosis या Adenomyosis का संकेत हो सकता है। ACOG की गाइडलाइन कहती है कि ऐसे दर्द को 'सामान्य' मानकर सहना नहीं चाहिए — इसका उपचार संभव है।",
  },

  // ── Irregular periods ─────────────────────────────────────────────────────
  {
    keywords: [
      "अनियमित",
      "irregular",
      "पीरियड नहीं",
      "देर से",
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
    ],
    answer:
      "ICMR के अनुसार, 21 से 35 दिनों के बीच का चक्र सामान्य माना जाता है। इससे अधिक अनियमितता थायराइड असंतुलन, PCOS, या अत्यधिक तनाव के कारण हो सकती है। WHO की सिफारिश है कि यदि 3 महीने से अधिक समय से पीरियड अनियमित हो, तो स्त्री रोग विशेषज्ञ से जांच कराएं।",
  },

  // ── Heavy/light bleeding ──────────────────────────────────────────────────
  {
    keywords: [
      "ज़्यादा खून",
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
    ],
    answer:
      "FOGSI के अनुसार, यदि पीरियड में हर 2 घंटे में पैड बदलनी पड़े या 7 दिन से अधिक चले, तो यह Heavy Menstrual Bleeding (HMB) है। इसके कारण फाइब्रॉएड, थायराइड, या खून जमाने की समस्या हो सकती है। ACOG की गाइडलाइन है कि CBC और अल्ट्रासाउंड जांच से कारण का पता लगाया जाए।",
  },

  // ── PCOS / hormones ───────────────────────────────────────────────────────
  {
    keywords: [
      "pcos",
      "pcod",
      "पीसीओएस",
      "पीसीओडी",
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
      "acne",
      "पिंपल",
      "testosterone",
      "estrogen",
      "progesterone",
      "lh",
      "fsh",
      "androgen",
      "इंसुलिन",
      "insulin resistance",
    ],
    answer:
      "FOGSI और ACOG के अनुसार, PCOS भारत में 10-15% महिलाओं को प्रभावित करता है। इसमें अनियमित पीरियड, वजन बढ़ना, और चेहरे पर अनचाहे बाल आम लक्षण हैं। WHO की गाइडलाइन कहती है कि नियमित व्यायाम, संतुलित आहार, और चिकित्सकीय देखभाल से PCOS को प्रभावी रूप से नियंत्रित किया जा सकता है।",
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
      "weakness",
      "थकान",
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
    ],
    answer:
      "भूख न लगना, थकान, और चक्कर आना — ये एनीमिया (खून की कमी) या थायराइड असंतुलन के सबसे आम संकेत हैं। WHO के अनुसार, भारत में 57% महिलाओं में आयरन की कमी है। ICMR की सिफारिश है कि CBC (Complete Blood Count) और TSH जांच से कारण का पता लगाया जा सकता है। इन लक्षणों को नज़रअंदाज़ न करें।",
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
    ],
    answer:
      "WHO के अनुसार, भारत में 57% महिलाओं में एनीमिया है — मुख्य कारण आयरन की कमी है। ICMR की सिफारिश है कि महिलाओं को प्रतिदिन 29mg आयरन की आवश्यकता है। हरी पत्तेदार सब्ज़ियां, दालें, और विटामिन C के साथ सेवन अवशोषण बढ़ाता है। CBC रक्त परीक्षण से निदान की पुष्टि होती है।",
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
    ],
    answer:
      "WHO और ICMR के अनुसार, थायराइड असंतुलन महिलाओं में पुरुषों की तुलना में 5-8 गुना अधिक पाया जाता है। Hypothyroidism से पीरियड भारी और अनियमित हो सकते हैं, वजन बढ़ सकता है और थकान होती है। सामान्य TSH रेंज 0.4-4.0 mIU/L मानी जाती है। वार्षिक TSH जांच की सलाह दी जाती है।",
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
    ],
    answer:
      "WHO के अनुसार, रजोनिवृत्ति आमतौर पर 45-55 वर्ष की उम्र में होती है। ACOG की गाइडलाइन के अनुसार, गर्म लहरें, नींद न आना, और मूड बदलाव Estrogen के घटने से होते हैं। Hormone Replacement Therapy (HRT) सहित कई उपचार विकल्प उपलब्ध हैं — डॉक्टर से परामर्श लें।",
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
      "ivf",
      "fertility",
      "बाँझपन",
      "infertility",
      "conceive",
      "गर्भधारण",
    ],
    answer:
      "WHO की ANC गाइडलाइन के अनुसार, गर्भावस्था में कम से कम 8 बार प्रसव-पूर्व जांच की सिफारिश की जाती है। FOGSI के अनुसार, फोलिक एसिड, आयरन, और कैल्शियम के नियमित सेवन से माँ और बच्चे दोनों का स्वास्थ्य बेहतर रहता है। गर्भधारण में कठिनाई हो तो स्त्री रोग विशेषज्ञ से जल्द परामर्श लें।",
  },

  // ── Postpartum ────────────────────────────────────────────────────────────
  {
    keywords: [
      "प्रसव के बाद",
      "postpartum",
      "delivery के बाद",
      "बच्चे के बाद",
      "breastfeeding",
      "स्तनपान",
      "दूध",
      "लोचिया",
      "lochia",
      "postpartum depression",
      "बच्चे के बाद उदासी",
      "baby blues",
      "नवजात",
      "newborn",
    ],
    answer:
      "FOGSI और WHO के अनुसार, प्रसव के बाद 4-6 हफ्ते तक हल्का मूड बदलाव (baby blues) सामान्य है। लेकिन यदि उदासी, रोना, या बच्चे से दूरी 2 हफ्ते से अधिक रहे, तो यह Postpartum Depression हो सकता है — जो इलाज योग्य है। ACOG की सिफारिश है कि स्तनपान कराने वाली माँ को प्रतिदिन अतिरिक्त 500 कैलोरी और आयरन की ज़रूरत होती है।",
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
    ],
    answer:
      "WHO और FOGSI के अनुसार, हल्का पारदर्शी या सफेद स्राव सामान्य है। लेकिन यदि स्राव पीला, हरा, या बदबूदार हो, या खुजली और जलन हो, तो यह Bacterial Vaginosis या Yeast Infection हो सकता है। UTI (पेशाब में संक्रमण) में जलन और बार-बार पेशाब आना आम लक्षण हैं। दोनों का इलाज सरल है — स्त्री रोग विशेषज्ञ से परामर्श लें।",
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
    ],
    answer:
      "WHO और ACOG के अनुसार, 40 वर्ष की आयु के बाद प्रतिवर्ष मैमोग्राफी की सलाह दी जाती है। FOGSI की गाइडलाइन कहती है कि मासिक स्व-परीक्षण महत्वपूर्ण है — कोई भी नई गांठ, त्वचा में बदलाव, या असामान्य स्राव की तुरंत जांच करानी चाहिए। स्तन दर्द अक्सर हॉर्मोनल होता है और सामान्य हो सकता है।",
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
    ],
    answer:
      "WHO की Medical Eligibility Criteria के अनुसार, गर्भनिरोधक के कई सुरक्षित विकल्प हैं — गोलियां, कॉपर-T, हॉर्मोनल IUD, और कंडोम। FOGSI का सुझाव है कि सही विकल्प आपकी उम्र, स्वास्थ्य स्थिति, और भविष्य की योजनाओं पर निर्भर करता है। Emergency contraception (I-Pill) असुरक्षित संबंध के 72 घंटे के भीतर ली जा सकती है।",
  },

  // ── Mental health / mood / stress ─────────────────────────────────────────
  {
    keywords: [
      "मूड",
      "mood",
      "उदासी",
      "depression",
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
      "अकेलापन",
      "loneliness",
    ],
    answer:
      "ACOG और WHO के अनुसार, पीरियड से 1-2 हफ्ते पहले मूड बदलाव, चिड़चिड़ापन, और उदासी PMS (Premenstrual Syndrome) के लक्षण हैं — यह Estrogen और Progesterone के उतार-चढ़ाव से होता है। यदि ये लक्षण बहुत गंभीर हों तो यह PMDD हो सकता है जिसका इलाज संभव है। नियमित व्यायाम, पर्याप्त नींद, और काउंसलिंग से राहत मिलती है।",
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
    ],
    answer:
      "FOGSI के अनुसार, महिलाओं में बाल झड़ने के पीछे अक्सर आयरन की कमी, थायराइड असंतुलन, या PCOS होता है। WHO की गाइडलाइन कहती है कि अत्यधिक बाल झड़ने पर CBC, TSH, और हॉर्मोन पैनल जांच करानी चाहिए। गर्दन और बगल पर काले धब्बे (Acanthosis Nigricans) इंसुलिन प्रतिरोध का संकेत हो सकते हैं — यह PCOS में आम है।",
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
    ],
    answer:
      "WHO और FOGSI के अनुसार, पेल्विक दर्द, सूजन, या दबाव महसूस होना Ovarian Cyst, Fibroid, या Endometriosis का संकेत हो सकता है। ACOG की सिफारिश है कि 21 वर्ष की आयु से नियमित Pap Smear कराएं — यह सर्वाइकल कैंसर की रोकथाम का सबसे प्रभावी तरीका है। HPV वैक्सीन 9-26 वर्ष की उम्र में सबसे प्रभावी होती है।",
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
    ],
    answer:
      "ICMR की डाइटरी गाइडलाइन के अनुसार, महिलाओं को प्रतिदिन 600mg कैल्शियम, 29mg आयरन, 400mcg फोलिक एसिड, और पर्याप्त विटामिन D की आवश्यकता है। WHO सिफारिश करता है कि रंगीन सब्ज़ियां, दालें, और डेयरी उत्पाद महिलाओं के हॉर्मोन संतुलन में सहायक हैं। विटामिन D की कमी भारत में बहुत आम है — धूप और जांच दोनों ज़रूरी हैं।",
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
    ],
    answer:
      "WHO के अनुसार, यौन स्वास्थ्य समग्र स्वास्थ्य का अभिन्न हिस्सा है। संभोग के दौरान दर्द (Dyspareunia) के कारण रजोनिवृत्ति से योनि सूखापन, Vaginismus, या Endometriosis हो सकते हैं — ये सभी इलाज योग्य हैं। FOGSI कहती है कि यौन स्वास्थ्य से जुड़ी किसी भी चिंता को डॉक्टर से बेझिझक साझा करें।",
  },
];

const OUT_OF_SCOPE =
  "मैं केवल महिला स्वास्थ्य विषयों पर WHO, FOGSI, ICMR, और ACOG द्वारा सत्यापित जानकारी दे सकती हूँ। कृपया महिला स्वास्थ्य से संबंधित प्रश्न पूछें।" +
  DISCLAIMER;

const DEFAULT =
  "इस विषय पर हमारे सत्यापित डेटाबेस में अभी जानकारी उपलब्ध नहीं है। आप पीरियड दर्द, PCOS, एनीमिया, थायराइड, रजोनिवृत्ति, गर्भावस्था, या यौन स्वास्थ्य से जुड़े सवाल पूछ सकती हैं — इन पर सखी के पास WHO और FOGSI से सत्यापित जानकारी है।" +
  DISCLAIMER;

const OFF_TOPIC_WORDS = [
  "मौसम",
  "weather",
  "recipe",
  "खाना बनाना",
  "cricket",
  "news",
  "राजनीति",
  "politics",
  "share market",
  "stock",
  "पैसा invest",
  "loan",
];

function findResponse(question: string): string {
  const q = question.toLowerCase();

  if (OFF_TOPIC_WORDS.some((w) => q.includes(w))) return OUT_OF_SCOPE;

  for (const r of RESPONSES) {
    if (r.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return r.answer + DISCLAIMER;
    }
  }

  return DEFAULT;
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return Response.json({ error: "कोई प्रश्न नहीं मिला।" }, { status: 400 });
    }
    return Response.json({ answer: findResponse(question) });
  } catch {
    return Response.json(
      { error: "सखी अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।" },
      { status: 500 },
    );
  }
}
