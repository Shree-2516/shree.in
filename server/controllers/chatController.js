const { GoogleGenAI } = require("@google/genai");
const Portfolio = require("../models/Portfolio"); // assuming this is the model

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const HF_MODEL = "mistralai/Mistral-7B-Instruct";
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODELS_URL = "https://router.huggingface.co/v1/models";
let cachedHfFallbackModel = null;

const parseRetryAfterSeconds = (error) => {
  const message = String(error?.message || "");

  const detailMatch = message.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (detailMatch) return Number(detailMatch[1]);

  const textMatch = message.match(/Please retry in\s+([\d.]+)s/i);
  if (textMatch) return Math.max(1, Math.ceil(Number(textMatch[1])));

  return 0;
};

const isDailyQuotaExceeded = (error) => {
  const message = String(error?.message || "");
  return (
    message.includes("GenerateRequestsPerDayPerProjectPerModel-FreeTier") ||
    message.includes("requests/day")
  );
};

const buildPromptContext = (portfolioData) =>
  JSON.stringify({
    name: portfolioData.name,
    about: portfolioData.about,
    skills: portfolioData.skills,
    experience: portfolioData.experience,
    experiences: portfolioData.experiences,
    education: portfolioData.education,
    educations: portfolioData.educations,
    achievements: portfolioData.achievements,
    achievementsList: portfolioData.achievementsList,
    github: portfolioData.github,
    linkedin: portfolioData.linkedin,
    contactEmail: portfolioData.contactEmail,
    projects: portfolioData.projects?.map((p) => ({
      title: p.title,
      description: p.description,
      link: p.link,
      technologies: p.technologies,
    })),
  });

const buildSystemInstruction = (contextData, ownerName, interviewMode = false) => `You are a helpful and polite AI assistant for a professional portfolio website. 
Your core purpose is to answer questions about the portfolio owner using the provided portfolio data as primary context.
Speak in first person as the portfolio owner (for example: "My name is ...", "I worked on ...").
The portfolio owner's name is "${ownerName || "Unknown"}". If user asks your name, introduce yourself using this name.
When the user asks a concept related to technologies, tools, methods, or topics that appear in the portfolio (for example YOLOv8, React, Node.js, CNN, APIs), you MAY give a short and accurate general explanation, then connect it back to how it was used in the portfolio.
Never invent personal facts, achievements, timelines, metrics, or project details that are not present in the portfolio data.
If a question is unrelated to the portfolio/resume context, politely say sorry and mention that you can only help with resume/portfolio-related queries.
Keep answers concise, natural, and friendly. If asked about experience, check the experience section.
For concept explanations, keep it brief (2-5 sentences unless asked for more detail).
If directly asked "how many years of experience do you have?", calculate or retrieve it from the experience data and present it clearly.
${interviewMode
  ? `Interview mode is ON.
The user is acting as a recruiter.
Answer as if you are Shreeyash in an interview.
Expect and handle technical questions, project questions, and ML questions.
Keep answers crisp, practical, and confident, with concrete examples from portfolio projects/experience where possible.
If the recruiter asks follow-up questions, continue the interview naturally.`
  : ""}
If the user asks to "open" or "show" a specific link (like github, linkedin, or email), you MUST include the exact string [ACTION:open_link:URL_HERE] in your response, replacing URL_HERE with the full URL from the portfolio data. For emails use mailto: format.
If the user asks to see a specific section of the portfolio (like projects, skills, experience, education, contact, or about), you MUST include the exact string [ACTION:navigate_to_section:SECTION_ID_HERE] in your response, replacing SECTION_ID_HERE with the exact section id (e.g., 'projects', 'skills', 'experience', 'contact').
Portfolio Data:
${contextData}
`;

const getProviderPreference = () => {
  const raw = String(process.env.AI_PROVIDER || "auto").toLowerCase().trim();
  if (raw === "gemini" || raw === "huggingface" || raw === "auto") return raw;
  return "auto";
};

const extractHuggingFaceText = (result) => {
  if (Array.isArray(result) && result.length > 0) {
    if (typeof result[0] === "string") return result[0];
    if (typeof result[0]?.generated_text === "string") return result[0].generated_text;
  }

  if (Array.isArray(result?.choices) && result.choices.length > 0) {
    const message = result.choices[0]?.message || {};
    if (typeof message.content === "string" && message.content.trim()) {
      return message.content.trim();
    }
    if (Array.isArray(message.content)) {
      const textParts = message.content
        .filter((part) => part?.type === "text" && typeof part?.text === "string")
        .map((part) => part.text);
      if (textParts.length > 0) return textParts.join("\n").trim();
    }
    if (typeof message.reasoning === "string" && message.reasoning.trim()) {
      return message.reasoning.trim();
    }
  }

  if (typeof result?.generated_text === "string") return result.generated_text;
  return "";
};

const parseJsonSafe = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

const isHfModelUnavailable = (status, message = "") =>
  status === 404 ||
  (status === 400 &&
    (message.includes("does not exist") ||
      message.includes("model_not_found") ||
      message.includes("not found")));

const selectBestHfModel = (models = []) => {
  if (!models.length) return null;

  if (models.includes(HF_MODEL)) return HF_MODEL;

  const similarMistral = models.find(
    (id) =>
      id.toLowerCase().includes("mistral") &&
      id.toLowerCase().includes("instruct") &&
      id.toLowerCase().includes("7b")
  );
  if (similarMistral) return similarMistral;

  const preferredModels = [
    "meta-llama/Llama-3.1-8B-Instruct",
    "Qwen/Qwen2.5-7B-Instruct",
    "meta-llama/Meta-Llama-3-8B-Instruct",
  ];

  for (const preferred of preferredModels) {
    if (models.includes(preferred)) return preferred;
  }

  const instructLike = models.find((id) =>
    /(instruct|chat|-it$|assistant)/i.test(id)
  );
  if (instructLike) return instructLike;

  return models[0];
};

const getHfFallbackModel = async () => {
  if (cachedHfFallbackModel) return cachedHfFallbackModel;

  const response = await fetch(HF_MODELS_URL, {
    headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const errMsg =
      data?.error?.message || data?.error || `Failed to fetch HF model list (${response.status})`;
    const err = new Error(errMsg);
    err.status = response.status;
    throw err;
  }

  const ids = Array.isArray(data?.data) ? data.data.map((m) => m.id).filter(Boolean) : [];
  const selected = selectBestHfModel(ids);

  if (!selected) {
    throw new Error("No HuggingFace router models available for this API key.");
  }

  cachedHfFallbackModel = selected;
  return selected;
};

const callHfChatCompletions = async ({ model, systemInstruction, message }) => {
  const response = await fetch(HF_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: message },
      ],
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const errMsg =
      data?.error?.message || data?.error || `HuggingFace API failed with status ${response.status}`;
    const err = new Error(errMsg);
    err.status = response.status;
    err.model = model;
    throw err;
  }

  const generated = extractHuggingFaceText(data);
  if (!generated || !generated.trim()) {
    const err = new Error("HuggingFace returned an empty response.");
    err.status = 502;
    err.model = model;
    throw err;
  }

  return generated;
};

const streamFromGemini = async ({ message, systemInstruction }) => {
  const toolDeclaration = {
    functionDeclarations: [
      {
        name: "navigate_to_section",
        description: "Navigates the user's screen to a specific section of the portfolio (e.g., when they ask to see projects, skills, experience, education, contact, achievements, or about).",
        parameters: {
          type: "OBJECT",
          properties: {
            sectionId: {
              type: "STRING",
              description: "The HTML id of the section. Valid values are: 'home', 'about', 'skills', 'projects', 'experience', 'education', 'achievements', 'contact'.",
            },
          },
          required: ["sectionId"],
        },
      },
      {
        name: "open_link",
        description: "Opens a specific link for the user, such as their GitHub, LinkedIn, or Email.",
        parameters: {
          type: "OBJECT",
          properties: {
            url: {
              type: "STRING",
              description: "The absolute URL to open. For emails, use mailto: format.",
            },
          },
          required: ["url"],
        },
      },
    ],
  };

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: message,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2, // Keep it deterministic and factual
      // tools: [toolDeclaration], // Temporarily commenting out Tools to avoid 429 Rate Limits from the free tier Google AI Studio accounts
    },
  });

  const chunks = [];
  for await (const chunk of responseStream) {
    if (chunk.functionCalls && chunk.functionCalls.length > 0) {
      for (const call of chunk.functionCalls) {
        if (call.name === "navigate_to_section") {
          const args = call.args;
          chunks.push(`__ACTION:navigate_to_section:${JSON.stringify(args)}__\n`);
        } else if (call.name === "open_link") {
          const args = call.args;
          chunks.push(`__ACTION:open_link:${JSON.stringify(args)}__\n`);
        }
      }
    } else if (chunk.text) {
      chunks.push(chunk.text);
    }
  }

  return chunks;
};

const streamFromHuggingFace = async ({ message, systemInstruction }) => {
  if (!process.env.HF_API_KEY) {
    throw new Error("HF_API_KEY is missing");
  }

  const primaryModel = HF_MODEL;
  let generated;

  try {
    generated = await callHfChatCompletions({ model: primaryModel, systemInstruction, message });
  } catch (primaryError) {
    const primaryMsg = String(primaryError?.message || "");
    if (!isHfModelUnavailable(primaryError?.status, primaryMsg)) {
      throw primaryError;
    }

    const fallbackModel = await getHfFallbackModel();
    if (fallbackModel === primaryModel) {
      throw primaryError;
    }

    console.log(`[AI] HuggingFace model unavailable (${primaryModel}) -> switching to ${fallbackModel}`);
    generated = await callHfChatCompletions({
      model: fallbackModel,
      systemInstruction,
      message,
    });
  }

  return [generated];
};

const writeChunksToResponse = (res, chunks) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  for (const chunk of chunks) {
    res.write(chunk);
  }

  res.end();
};

const handleChat = async (req, res) => {
  try {
    const { message, interviewMode } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch portfolio data to provide context
    const portfolioData = await Portfolio.findOne();
    if (!portfolioData) {
      return res.status(500).json({ error: "Portfolio data not found for context." });
    }

    const contextData = buildPromptContext(portfolioData);
    const systemInstruction = buildSystemInstruction(
      contextData,
      portfolioData.name,
      Boolean(interviewMode)
    );
    const provider = getProviderPreference();

    if (provider === "gemini") {
      console.log("[AI] Using Gemini");
      const geminiChunks = await streamFromGemini({ message, systemInstruction });
      return writeChunksToResponse(res, geminiChunks);
    }

    if (provider === "huggingface") {
      console.log("[AI] Using HuggingFace");
      const hfChunks = await streamFromHuggingFace({ message, systemInstruction });
      return writeChunksToResponse(res, hfChunks);
    }

    console.log("[AI] Using Gemini");
    try {
      const geminiChunks = await streamFromGemini({ message, systemInstruction });
      return writeChunksToResponse(res, geminiChunks);
    } catch (geminiError) {
      console.log("[AI] Gemini failed -> switching to HuggingFace");
      try {
        const hfChunks = await streamFromHuggingFace({ message, systemInstruction });
        return writeChunksToResponse(res, hfChunks);
      } catch (hfError) {
        console.error("HuggingFace fallback error:", hfError);
        throw hfError;
      }
    }
  } catch (error) {
    console.error("Chat API error:", error);
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      const retryAfterSeconds = parseRetryAfterSeconds(error);
      const dailyQuotaExceeded = isDailyQuotaExceeded(error);

      if (retryAfterSeconds > 0) {
        res.setHeader("Retry-After", String(retryAfterSeconds));
      }

      if (dailyQuotaExceeded) {
        return res.status(429).json({
          error: "Daily Gemini free-tier limit reached. Try again later or use a paid key/model.",
          retryAfterSeconds,
          dailyQuotaExceeded: true,
        });
      }

      return res.status(429).json({
        error: retryAfterSeconds > 0
          ? `Too many requests. Please wait ${retryAfterSeconds} seconds and try again.`
          : "Too many requests. Please wait a few seconds and try again.",
        retryAfterSeconds,
        dailyQuotaExceeded: false,
      });
    }
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
};

module.exports = { handleChat };
