require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const contextData = JSON.stringify({
    about: "Test about",
  });
  const systemInstruction = `You are a helpful and polite AI assistant for a professional portfolio website. 
Your sole purpose is to answer questions about the portfolio owner using ONLY the provided portfolio data.
If a user asks a question that cannot be answered using the provided portfolio data, you MUST politely say sorry and state that you are unable to provide an answer as it is outside the scope of this portfolio.
Do not make up facts. Keep answers concise, natural, and friendly.
Portfolio Data:
${contextData}
`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: "helo",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        console.log("Text:", chunk.text);
      }
    }
    console.log("Success");
  } catch (error) {
    require('fs').writeFileSync('inner_error.txt', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("Error logged to inner_error.txt");
  }
}

test();
