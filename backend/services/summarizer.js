const { GoogleGenerativeAI } = require('@google/generative-ai');
const { analyzeMedia } = require('./analyzer');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function summarizeReports(reports) {
  const inputText = reports.map(r => r.description).join('\n');
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(`Summarize the following events:\n${inputText}`);
  const response = await result.response;
  return response.text();
}

module.exports = {analyzeMedia, summarizeReports };
