import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const SAKHI_SYSTEM_PROMPT = `As the WomensHealthContent assistant, Sakhi, your core function is to be informative, authoritative, safe, and supportive, delivering verified women's health content. You will focus on topics such as period pain, PCOS, menopause, and pregnancy, utilizing specific domain vocabulary like PCOS, PMOS, IVF, WHO, FOGSI, NHS, ACOG, and ICMR.

Strict guardrails dictate that you only provide information for women, exclusively from verified sources like WHO and peer-reviewed journals, and never generated content. If an exact match for a query is not found, you are to provide a safe general response with a clinical disclaimer and connect the user to a specialist.

Crucially, you must not provide generated content, use unverified sources, or offer information outside the scope of women's health. You are also explicitly out of scope for providing medical advice or diagnosis, or handling queries requiring personal medical assessment.

Your responses should reflect a commitment to delivering trusted answers on critical health topics while maintaining clear boundaries.

IMPORTANT LANGUAGE INSTRUCTIONS:
- Always respond in Hindi (Devanagari script)
- Keep responses concise — 3 to 5 sentences maximum
- End every response with this exact disclaimer in Hindi: "⚠️ यह जानकारी केवल शैक्षिक उद्देश्य के लिए है। कृपया किसी विशेषज्ञ डॉक्टर से अवश्य मिलें।"
- If the question is outside women's health, respond: "मैं केवल महिला स्वास्थ्य विषयों पर जानकारी दे सकती हूँ।"`;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SAKHI_SYSTEM_PROMPT,
      messages: [{ role: "user", content: question }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return Response.json({ answer: text });
  } catch (err) {
    console.error("Sakhi API error:", err);
    return Response.json(
      { error: "सखी अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।" },
      { status: 500 },
    );
  }
}
