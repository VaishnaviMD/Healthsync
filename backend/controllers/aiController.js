const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Medora's AI Health Assistant. You provide educational information about:
- Medication safety and general drug information
- Nutrition and dietary guidance
- Wellness habits and lifestyle tips
- Women's health topics including menstrual health and menopause
- General health awareness

IMPORTANT RULES:
1. You MUST always clarify that your responses are for EDUCATIONAL PURPOSES ONLY and NOT medical advice.
2. ALWAYS recommend consulting a qualified healthcare professional for personal medical decisions.
3. Do NOT diagnose conditions or prescribe treatments.
4. Be empathetic, clear, and helpful.
5. Keep responses concise and easy to understand.
6. If asked about emergencies, direct users to call emergency services immediately.`;

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
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    // Fallback response when API unavailable
    res.json({ 
      response: "I'm here to help with health education! For accurate medical advice tailored to your situation, please consult your healthcare provider. I can answer general questions about medications, nutrition, wellness, and women's health. ⚠️ Remember: my responses are educational only, not medical advice."
    });
  }
};
