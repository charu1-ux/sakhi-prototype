import { NextRequest } from "next/server";

// ─── Mock responses for prototype demo ────────────────────────────────────────
// Guardrails: women's health only, content attributed to WHO/FOGSI/ICMR/ACOG.
// No live API key required — safe to demo on any network.

const DISCLAIMER =
  "\n\n⚠️ यह जानकारी केवल शैक्षिक उद्देश्य के लिए है। कृपया किसी विशेषज्ञ डॉक्टर से अवश्य मिलें।";

const RESPONSES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["दर्द", "ऐंठन", "कष्टार्तव", "dysmenorrhoea", "period pain"],
    answer:
      "FOGSI और WHO के अनुसार, पीरियड के पहले 1-2 दिन हल्का दर्द सामान्य है। लेकिन यदि दर्द इतना तेज़ हो कि रोज़मर्रा के काम रुक जाएं, तो यह Endometriosis या Adenomyosis का संकेत हो सकता है। ACOG की गाइडलाइन कहती है कि ऐसे दर्द को 'सामान्य' मानकर सहना नहीं चाहिए — इसका उपचार संभव है।",
  },
  {
    keywords: ["अनियमित", "irregular", "पीरियड नहीं", "देर से", "जल्दी"],
    answer:
      "ICMR के अनुसार, 21 से 35 दिनों के बीच का चक्र सामान्य माना जाता है। इससे अधिक अनियमितता थायराइड असंतुलन, PCOS, या अत्यधिक तनाव के कारण हो सकती है। WHO की सिफारिश है कि यदि 3 महीने से अधिक समय से पीरियड अनियमित हो, तो स्त्री रोग विशेषज्ञ से जांच कराएं।",
  },
  {
    keywords: ["pcos", "पीसीओएस", "हॉर्मोन", "सिस्ट", "ovary", "बाल चेहरे"],
    answer:
      "FOGSI और ACOG के अनुसार, PCOS भारत में 10-15% महिलाओं को प्रभावित करता है। इसमें अनियमित पीरियड, वजन बढ़ना, और चेहरे पर अनचाहे बाल आम लक्षण हैं। WHO की गाइडलाइन कहती है कि नियमित व्यायाम, संतुलित आहार, और चिकित्सकीय देखभाल से PCOS को प्रभावी रूप से नियंत्रित किया जा सकता है।",
  },
  {
    keywords: ["खून की कमी", "एनीमिया", "anaemia", "थकान", "हीमोग्लोबिन", "आयरन"],
    answer:
      "WHO के अनुसार, भारत में 57% महिलाओं में एनीमिया है — मुख्य कारण आयरन की कमी है। ICMR की सिफारिश है कि महिलाओं को प्रतिदिन 29mg आयरन की आवश्यकता है। हरी पत्तेदार सब्ज़ियां, दालें, और विटामिन C के साथ सेवन अवशोषण बढ़ाता है। CBC रक्त परीक्षण से निदान की पुष्टि होती है।",
  },
  {
    keywords: ["थायराइड", "thyroid", "tsh", "हाइपो", "हाइपर"],
    answer:
      "WHO और ICMR के अनुसार, थायराइड असंतुलन महिलाओं में पुरुषों की तुलना में 5-8 गुना अधिक पाया जाता है। Hypothyroidism से पीरियड भारी और अनियमित हो सकते हैं। सामान्य TSH रेंज 0.4-4.0 mIU/L मानी जाती है। वार्षिक TSH जांच की सलाह दी जाती है।",
  },
  {
    keywords: ["रजोनिवृत्ति", "menopause", "मेनोपॉज़", "गर्म लहर", "hot flash"],
    answer:
      "WHO के अनुसार, रजोनिवृत्ति आमतौर पर 45-55 वर्ष की उम्र में होती है। ACOG की गाइडलाइन के अनुसार, गर्म लहरें, नींद न आना, और मूड बदलाव Estrogen के घटने से होते हैं। Hormone Replacement Therapy (HRT) सहित कई उपचार विकल्प उपलब्ध हैं।",
  },
  {
    keywords: ["गर्भावस्था", "pregnancy", "प्रेगनेंसी", "गर्भ"],
    answer:
      "WHO की ANC गाइडलाइन के अनुसार, गर्भावस्था में कम से कम 8 बार प्रसव-पूर्व जांच की सिफारिश की जाती है। FOGSI के अनुसार, फोलिक एसिड, आयरन, और कैल्शियम के नियमित सेवन से माँ और बच्चे दोनों का स्वास्थ्य बेहतर रहता है।",
  },
  {
    keywords: ["स्तन", "breast", "गांठ", "lump", "mammogram"],
    answer:
      "WHO और ACOG के अनुसार, 40 वर्ष की आयु के बाद प्रतिवर्ष मैमोग्राफी की सलाह दी जाती है। FOGSI की गाइडलाइन कहती है कि मासिक स्व-परीक्षण महत्वपूर्ण है — कोई भी नई गांठ या असामान्य बदलाव की तुरंत जांच करानी चाहिए।",
  },
  {
    keywords: ["गर्भनिरोधक", "contraceptive", "गोली", "copper", "iud", "family planning"],
    answer:
      "WHO की Medical Eligibility Criteria के अनुसार, गर्भनिरोधक के कई सुरक्षित विकल्प हैं — गोलियां, कॉपर-T, और हॉर्मोनल IUD। FOGSI का सुझाव है कि सही विकल्प आपकी उम्र और स्वास्थ्य स्थिति पर निर्भर करता है। किसी भी विकल्प से पहले स्त्री रोग विशेषज्ञ से परामर्श लें।",
  },
  {
    keywords: ["पोषण", "nutrition", "diet", "खान-पान", "calcium", "कैल्शियम", "विटामिन"],
    answer:
      "ICMR की डाइटरी गाइडलाइन के अनुसार, महिलाओं को प्रतिदिन 600mg कैल्शियम, 29mg आयरन, और 400mcg फोलिक एसिड की आवश्यकता है। WHO सिफारिश करता है कि रंगीन सब्ज़ियां, दालें, और डेयरी उत्पाद महिलाओं के हॉर्मोन संतुलन में सहायक हैं।",
  },
];

const OUT_OF_SCOPE =
  "मैं केवल महिला स्वास्थ्य विषयों पर WHO, FOGSI, ICMR, और ACOG द्वारा सत्यापित जानकारी दे सकती हूँ। कृपया महिला स्वास्थ्य से संबंधित प्रश्न पूछें।" +
  DISCLAIMER;

const DEFAULT =
  "आपके प्रश्न के लिए धन्यवाद। यह विषय हमारे विशेषज्ञ डेटाबेस में सीमित जानकारी रखता है। WHO और FOGSI की सामान्य सलाह है कि किसी भी स्वास्थ्य चिंता के लिए स्त्री रोग विशेषज्ञ से व्यक्तिगत परामर्श सबसे उचित है।" +
  DISCLAIMER;

const OFF_TOPIC_WORDS = [
  "मौसम",
  "weather",
  "recipe",
  "खाना बनाना",
  "cricket",
  "खेल",
  "news",
  "राजनीति",
  "politics",
  "share",
  "stock",
  "पैसा",
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
