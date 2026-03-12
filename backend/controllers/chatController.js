const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are HealthSync AI Assistant, a helpful health information companion. 

IMPORTANT RULES:
- You provide EDUCATIONAL INFORMATION ONLY — not medical advice or diagnosis
- Always remind users to consult healthcare professionals for personal medical decisions
- Be warm, supportive, and clear
- Focus on: medications (general info), nutrition, wellness, women's health, menopause, healthy habits
- Keep responses concise (under 200 words) and easy to understand
- Never diagnose conditions or prescribe treatments
- If someone describes an emergency, direct them to emergency services immediately`;

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 300,
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    // Fallback if OpenAI fails
    res.json({ reply: "I'm here to help with health information. For personalized medical advice, please consult your healthcare provider. Is there general health information I can help you with?" });
  }
};
