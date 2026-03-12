const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are HealthSync AI, a knowledgeable health education assistant. You help users with general information about:
- Medication safety and general usage
- Nutrition and diet guidance
- Wellness habits and lifestyle
- Women's health topics including menstrual health and menopause
- General health and wellness questions

IMPORTANT RULES:
1. Always clarify you provide EDUCATIONAL INFORMATION ONLY, not medical advice
2. Never diagnose conditions or prescribe treatments
3. Always recommend consulting a qualified healthcare professional for personal health decisions
4. Be compassionate, clear, and helpful
5. Keep responses concise but informative
6. If asked about emergencies, immediately direct to emergency services

Begin every first response by briefly mentioning you provide educational info only.`;

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Mock response for development
      const mockResponses = [
        "I understand you're asking about health. For personalized advice, please consult a healthcare professional. I can provide general information about wellness and nutrition.",
        "That's an interesting question about your health. Remember, I'm here for educational purposes only. Always seek advice from qualified medical professionals for your specific situation.",
        "Health is important! While I can't give medical advice, I can share general knowledge about maintaining wellness. What specific topic would you like to learn more about?",
        "Thanks for your question. As an AI assistant, I focus on educational information. For medical concerns, please speak with your doctor or healthcare provider."
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return res.json({ response: randomResponse });
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({ response: response.choices[0].message.content });
  } catch (err) {
    console.error('AI Chat error:', err);
    res.status(500).json({ 
      message: 'AI service temporarily unavailable',
      fallback: "I'm temporarily unavailable. Please consult your healthcare provider for medical questions. Remember: always seek professional advice for health decisions."
    });
  }
};
