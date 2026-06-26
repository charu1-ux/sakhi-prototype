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
    ],
    answer:
      "WHO के अनुसार, लड़कियों में पहला पीरियड (Menarche) आमतौर पर 11-15 वर्ष की उम्र में आता है। FOGSI की गाइडलाइन कहती है कि पहले 1-2 साल अनियमित पीरियड सामान्य है — शरीर हॉर्मोन संतुलन बना रहा होता है। यदि 15 वर्ष तक पीरियड न आए या बहुत तेज़ दर्द हो, तो स्त्री रोग विशेषज्ञ से मिलें।",
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
    ],
    answer:
      "ACOG के अनुसार, पीरियड से पहले या दौरान सिरदर्द Estrogen के अचानक घटने से होता है — इसे Menstrual Migraine कहते हैं। WHO की गाइडलाइन कहती है कि यह 20-30% महिलाओं को प्रभावित करता है। पर्याप्त पानी, नियमित नींद, और तनाव कम करने से राहत मिलती है। बार-बार गंभीर माइग्रेन हो तो न्यूरोलॉजिस्ट से परामर्श लें।",
  },

  // ── Bloating / gas / digestive issues ────────────────────────────────────
  {
    keywords: [
      "bloating",
      "सूजन",
      "पेट फूलना",
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
    ],
    answer:
      "FOGSI के अनुसार, पीरियड से पहले पेट फूलना और गैस Progesterone के कारण होती है — यह बहुत आम है। WHO की गाइडलाइन कहती है कि महिलाओं में IBS (Irritable Bowel Syndrome) पुरुषों की तुलना में दोगुना पाया जाता है और यह हॉर्मोन से जुड़ा है। नमक कम करें, पानी अधिक पिएं, और प्रोसेस्ड फ़ूड से बचें।",
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
    ],
    answer:
      "ICMR के अनुसार, भारत में शाकाहारी महिलाओं में Vitamin B12 की कमी बहुत आम है क्योंकि B12 मुख्यतः पशु उत्पादों में पाया जाता है। WHO की गाइडलाइन कहती है कि B12 की कमी से थकान, हाथ-पैरों में झनझनाहट, और याददाश्त कमज़ोर होना हो सकता है। गर्भावस्था में B12 की कमी बच्चे के नर्वस सिस्टम को प्रभावित कर सकती है — नियमित जांच ज़रूरी है।",
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
    ],
    answer:
      "WHO के अनुसार, Gestational Diabetes (गर्भावस्था में मधुमेह) 5-10% गर्भवती महिलाओं में होती है और बच्चे के जन्म के बाद अक्सर ठीक हो जाती है। FOGSI की सिफारिश है कि 24-28 सप्ताह पर GTT (Glucose Tolerance Test) ज़रूर कराएं। PCOS वाली महिलाओं में Type 2 Diabetes का खतरा अधिक होता है — वार्षिक HbA1c जांच करें।",
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
    ],
    answer:
      "ACOG और FOGSI के अनुसार, प्रसव के बाद या रजोनिवृत्ति में Pelvic Floor कमज़ोर होने से हँसने, खाँसने पर पेशाब लीक हो सकता है — यह बहुत आम है पर इसके बारे में बात नहीं होती। Kegel exercises से 70% महिलाओं को राहत मिलती है। गंभीर मामलों में Physiotherapy या सर्जरी का विकल्प उपलब्ध है।",
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
    ],
    answer:
      "WHO और UNICEF की गाइडलाइन कहती है कि Sanitary Pad, Tampon, और Menstrual Cup — सभी सुरक्षित विकल्प हैं। Pad हर 4-6 घंटे में बदलें — ज़्यादा देर रखने से संक्रमण और रैश हो सकता है। Menstrual Cup 8-12 घंटे तक उपयोग किया जा सकता है और पर्यावरण के लिए बेहतर है। साफ, सूती अंडरवियर पहनें।",
  },

  // ── Sleep / insomnia ──────────────────────────────────────────────────────
  {
    keywords: [
      "नींद नहीं",
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
    ],
    answer:
      "ACOG के अनुसार, महिलाओं में नींद की समस्या पुरुषों की तुलना में 40% अधिक होती है — इसका मुख्य कारण हॉर्मोन उतार-चढ़ाव, PMS, गर्भावस्था, और रजोनिवृत्ति है। WHO की सिफारिश है कि महिलाओं को प्रतिदिन 7-9 घंटे की नींद ज़रूरी है। सोने से 1 घंटे पहले स्क्रीन बंद करें, एक निश्चित समय पर सोएं, और कैफीन से बचें।",
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
    ],
    answer:
      "WHO की गाइडलाइन के अनुसार, पीरियड के दौरान हल्का व्यायाम — जैसे चलना, योग, और स्ट्रेचिंग — दर्द और थकान में राहत देता है। ACOG कहती है कि महिलाओं को प्रति सप्ताह कम से कम 150 मिनट मध्यम तीव्रता का व्यायाम करना चाहिए। PCOS और PMS दोनों में नियमित व्यायाम हॉर्मोन संतुलन में सबसे प्रभावी गैर-दवा उपाय है।",
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
    ],
    answer:
      "WHO और ACOG के अनुसार, अत्यधिक तनाव, अचानक वजन घटना, लंबी यात्रा, या नींद न आना — ये सब Cortisol बढ़ाते हैं जो Estrogen और Progesterone को प्रभावित करता है और पीरियड में देरी ला सकता है। यह शरीर की सामान्य प्रतिक्रिया है। यदि 2-3 महीने से अधिक हो तो जांच ज़रूरी है।",
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
    ],
    answer:
      "WHO के अनुसार, Autoimmune बीमारियाँ पुरुषों की तुलना में महिलाओं में 3 गुना अधिक होती हैं — इसका कारण Estrogen का प्रतिरक्षा तंत्र पर प्रभाव माना जाता है। Hashimoto's Thyroiditis (थायराइड की सूजन), Rheumatoid Arthritis, और Lupus महिलाओं में सबसे आम हैं। नियमित जांच और स्त्री रोग विशेषज्ञ व रुमेटोलॉजिस्ट की टीम से देखभाल ज़रूरी है।",
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
