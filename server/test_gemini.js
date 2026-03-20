require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const systemInstruction = `You are a helpful and polite AI assistant.`;

  const toolDeclaration = {
    functionDeclarations: [
      {
        name: "navigate_to_section",
        description: "Navigates the user's screen to a specific section.",
        parameters: {
          type: "OBJECT",
          properties: {
            sectionId: {
              type: "STRING",
              description: "The HTML id of the section.",
            },
          },
          required: ["sectionId"],
        },
      },
      {
        name: "open_link",
        description: "Opens a specific link for the user.",
        parameters: {
          type: "OBJECT",
          properties: {
            url: {
              type: "STRING",
              description: "The absolute URL to open.",
            },
          },
          required: ["url"],
        },
      }
    ],
  };

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: "helo",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        tools: [toolDeclaration],
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        console.log("Function Call:", chunk.functionCalls);
      } else if (chunk.text) {
        console.log("Text:", chunk.text);
      }
    }
    console.log("Success");
  } catch (error) {
    console.error("Error caught:", error);
  }
}

test();
