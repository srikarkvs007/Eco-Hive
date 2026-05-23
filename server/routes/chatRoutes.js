const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({}); // Automatically picks up GEMINI_API_KEY from environment

router.post('/', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: 'Chatbot is currently offline (API Key missing).' });
        }

        const { message, history } = req.body;

        // Construct the context prompt
        let prompt = "You are a helpful customer support assistant for Eco-Hive, a premium eco-friendly e-commerce store. Keep your responses concise, friendly, and professional.\n\n";
        
        if (history && history.length > 0) {
            prompt += "Previous Chat History:\n";
            history.forEach(msg => {
                prompt += `${msg.sender === 'user' ? 'Customer' : 'Assistant'}: ${msg.text}\n`;
            });
        }
        
        prompt += `Customer: ${message}\nAssistant:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        res.json({ reply: response.text });
    } catch (err) {
        console.error("Chatbot Error:", err);
        res.status(500).json({ reply: "I'm sorry, I am having trouble connecting to my servers right now." });
    }
});

module.exports = router;
