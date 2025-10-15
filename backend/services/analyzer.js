const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function analyzeMedia(text, imageUrl) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const imageBuffer = await fetch(imageUrl).then(res => res.arrayBuffer());
  const imageBase64 = Buffer.from(imageBuffer).toString('base64');

  const result = await model.generateContent([
    { text: `Analyze this event and provide category, location (lat,lng), summary, and sentiment.` },
    { text: text },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
  ]);

  const response = await result.response;
  const resultText = await response.text();

  // NOTE: This parsing is placeholder — parse actual values if needed
  return {
    category: "Flood",
    location: { lat: 12.9, lng: 77.6 },
    summary: resultText,
    sentiment: "Negative"
  };
}

module.exports = { analyzeMedia };
