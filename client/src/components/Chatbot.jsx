import React, { useEffect, useRef, useState } from "react";
import "./Chatbot.css";
import { fetchWithApiFallback } from "../api/api";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const PORTFOLIO_TOUR_COMMAND = "give me portfolio tour";
const PORTFOLIO_TOUR_SECTION_IDS = ["about", "skills", "projects", "experience", "contact"];
const PORTFOLIO_TOUR_MESSAGE = `Welcome to Shreeyash portfolio.

Sections:
About Me
Skills
Projects
Experience
Contact`;
const RESUME_EXPLAINER_COMMAND = "explain your resume";
const RESUME_EXPLAINER_MESSAGE = `Here is a quick explanation of my resume:

Skills:
I work with core software development and AI/ML technologies shown in my portfolio skills section.

Projects:
I have built practical projects that demonstrate full-stack development, problem-solving, and deployment experience.

Internship:
My internship experience is listed in the Experience section, where I describe my role, responsibilities, and impact.

Achievements:
I have included certifications and key accomplishments in the Achievements section.`;
const RESUME_ANALYZER_COMMAND = "ai resume analyzer";
const RESUME_ANALYZER_PROMPT_MESSAGE =
  "Paste the full job description, and I will analyze why I match with a score, relevant skills, and relevant projects.";

const SUGGESTED_QUESTIONS = [
  { id: "projects", label: "Ask about projects", type: "ask", value: "Tell me about your projects." },
  { id: "skills", label: "Ask about skills", type: "ask", value: "What skills do you have?" },
  { id: "resume-analyzer", label: "AI Resume Analyzer", type: "resume-analyzer" },
  { id: "resume", label: "Download resume", type: "resume" },
  { id: "contact", label: "Contact Shreeyash", type: "contact" },
];

const Chatbot = () => {
  const MIN_CHAT_WIDTH = 320;
  const MAX_CHAT_WIDTH = 620;
  const MIN_CHAT_HEIGHT = 420;
  const MAX_CHAT_HEIGHT = 780;
  const DEFAULT_CHAT_WIDTH = 380;
  const DEFAULT_CHAT_HEIGHT = 560;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm Shreeyash's AI Assistant. Ask me anything about his portfolio!" },
  ]);
  const [input, setInput] = useState("");
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isResumeAnalyzerMode, setIsResumeAnalyzerMode] = useState(false);
  const [chatSize, setChatSize] = useState({
    width: DEFAULT_CHAT_WIDTH,
    height: DEFAULT_CHAT_HEIGHT,
  });
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);
  const tourTimeoutsRef = useRef([]);
  const abortControllerRef = useRef(null);
  const stopTypingRef = useRef(null);
  const resizeRef = useRef({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: DEFAULT_CHAT_WIDTH,
    startHeight: DEFAULT_CHAT_HEIGHT,
  });

  useEffect(() => {
    if (!SpeechRecognition) return;

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = "en-US";

    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript, true);
    };

    recognition.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.current.onend = () => {
      setIsListening(false);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => () => {
    tourTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    tourTimeoutsRef.current = [];
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (stopTypingRef.current) {
      stopTypingRef.current();
      stopTypingRef.current = null;
    }
  }, []);

  const toggleChat = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!resizeRef.current.isResizing) return;

      const widthDelta = resizeRef.current.startX - event.clientX;
      const heightDelta = resizeRef.current.startY - event.clientY;

      const nextWidth = Math.min(
        MAX_CHAT_WIDTH,
        Math.max(MIN_CHAT_WIDTH, resizeRef.current.startWidth + widthDelta)
      );
      const nextHeight = Math.min(
        MAX_CHAT_HEIGHT,
        Math.max(MIN_CHAT_HEIGHT, resizeRef.current.startHeight + heightDelta)
      );

      setChatSize({ width: nextWidth, height: nextHeight });
    };

    const stopResize = () => {
      resizeRef.current.isResizing = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  const startResize = (event) => {
    if (window.innerWidth <= 768) return;
    resizeRef.current = {
      isResizing: true,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: chatSize.width,
      startHeight: chatSize.height,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "nwse-resize";
  };

  const clearPortfolioTour = () => {
    tourTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    tourTimeoutsRef.current = [];
  };

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return false;
    sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, null, `#${sectionId}`);
    return true;
  };

  const startPortfolioTour = () => {
    clearPortfolioTour();
    const stepDelayMs = 2600;

    PORTFOLIO_TOUR_SECTION_IDS.forEach((sectionId, index) => {
      const timeoutId = setTimeout(() => {
        scrollToSection(sectionId);
      }, index * stepDelayMs);
      tourTimeoutsRef.current.push(timeoutId);
    });
  };

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const toggleInterviewMode = () => {
    const nextMode = !isInterviewMode;
    setIsInterviewMode(nextMode);
    addMessage(
      "ai",
      nextMode
        ? "Interview mode is now active. Ask technical questions, project questions, or ML questions, and I will answer as Shreeyash."
        : "Interview mode is now off."
    );
  };

  const openResumeFromHero = () => {
    const links = Array.from(document.querySelectorAll("section#home a[href]"));
    const resumeLink = links.find((link) =>
      link.textContent?.trim().toLowerCase().includes("download resume")
    );

    if (resumeLink?.href) {
      window.open(resumeLink.href, "_blank", "noopener,noreferrer");
      return true;
    }
    return false;
  };

  const handleSuggestedQuestionClick = (suggestion) => {
    if (isLoading || cooldownSeconds > 0) return;

    if (suggestion.type === "ask") {
      handleSend(suggestion.value);
      return;
    }

    if (suggestion.type === "resume") {
      addMessage("user", suggestion.label);
      if (openResumeFromHero()) {
        addMessage("ai", "Opening resume for you.");
      } else {
        addMessage("ai", "Resume link is not available right now.");
      }
      return;
    }

    if (suggestion.type === "resume-analyzer") {
      addMessage("user", suggestion.label);
      setIsResumeAnalyzerMode(true);
      addMessage("ai", RESUME_ANALYZER_PROMPT_MESSAGE);
      return;
    }

    if (suggestion.type === "contact") {
      addMessage("user", suggestion.label);
      if (scrollToSection("contact")) {
        addMessage("ai", "Taking you to the Contact section.");
      } else {
        addMessage("ai", "I couldn't find the Contact section right now.");
      }
    }
  };

  const handleSend = async (textToSend, isVoiceInput = false) => {
    if (isLoading || cooldownSeconds > 0) return;

    const text = typeof textToSend === "string" ? textToSend : input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    if (text.trim().toLowerCase() === PORTFOLIO_TOUR_COMMAND) {
      setMessages((prev) => [...prev, { sender: "ai", text: "" }]);
      await typeOutMessage(PORTFOLIO_TOUR_MESSAGE, isVoiceInput);
      startPortfolioTour();
      return;
    }

    if (text.trim().toLowerCase() === RESUME_EXPLAINER_COMMAND) {
      setMessages((prev) => [...prev, { sender: "ai", text: "" }]);
      await typeOutMessage(RESUME_EXPLAINER_MESSAGE, isVoiceInput);
      return;
    }

    if (text.trim().toLowerCase() === RESUME_ANALYZER_COMMAND) {
      setIsResumeAnalyzerMode(true);
      setMessages((prev) => [...prev, { sender: "ai", text: "" }]);
      await typeOutMessage(RESUME_ANALYZER_PROMPT_MESSAGE, isVoiceInput);
      return;
    }

    const shouldRunResumeAnalysis = isResumeAnalyzerMode;
    const outboundMessage = shouldRunResumeAnalysis
      ? `You are evaluating candidate fit for a recruiter based only on the provided portfolio context.
Job Description:
${text}

Return your answer in exactly this format:
Match Score: <number from 0 to 100>%

Relevant Skills:
- <skill 1>
- <skill 2>
- <skill 3>
- <skill 4>

Relevant Projects:
- <project 1>
- <project 2>

Why I Match:
- <short reason 1>
- <short reason 2>
- <short reason 3>

Rules:
- Use only skills and projects present in the portfolio data.
- If a required skill is missing in the portfolio, mention it under "Why I Match" as a gap.
- Keep the response concise and recruiter-friendly.`
      : text;

    setIsLoading(true);
    abortControllerRef.current = new AbortController();
    if (shouldRunResumeAnalysis) {
      setIsResumeAnalyzerMode(false);
    }

    try {
      const response = await fetchWithApiFallback("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: outboundMessage,
          interviewMode: shouldRunResumeAnalysis ? true : isInterviewMode,
        }),
      });

      if (!response.ok) {
        let serverErrorMsg = "Sorry, I am unable to provide an answer at the moment.";
        try {
          const data = await response.json();
          if (data.retryAfterSeconds && Number(data.retryAfterSeconds) > 0) {
            setCooldownSeconds(Number(data.retryAfterSeconds));
          }
          if (data.error) serverErrorMsg = data.error;
        } catch {
          // ignore JSON parse failures
        }
        throw new Error(serverErrorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullReply = "";

      setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        let modifiedChunk = chunk;

        const navRegex = /\[ACTION:navigate_to_section:([^\]]+)\]/g;
        let navMatch;
        while ((navMatch = navRegex.exec(modifiedChunk)) !== null) {
          const sectionId = navMatch[1];
          try {
            scrollToSection(sectionId);
          } catch (e) {
            console.error("Failed to navigate to section:", e);
          }
        }
        modifiedChunk = modifiedChunk.replace(navRegex, "");

        const linkRegex = /\[ACTION:open_link:([^\]]+)\]/g;
        let linkMatch;
        while ((linkMatch = linkRegex.exec(modifiedChunk)) !== null) {
          const url = linkMatch[1];
          try {
            window.open(url, "_blank", "noopener,noreferrer");
          } catch (e) {
            console.error("Failed to open link:", e);
          }
        }
        modifiedChunk = modifiedChunk.replace(linkRegex, "");
        fullReply += modifiedChunk;
      }

      await typeOutMessage(fullReply, isVoiceInput);
    } catch (error) {
      if (error?.name === "AbortError") {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg?.sender === "ai" && !lastMsg.text.trim()) {
            lastMsg.text = "Response stopped.";
          }
          return newMessages;
        });
        return;
      }

      console.error("Error communicating with AI", error);
      const errorMsg =
        error.message &&
        error.message.includes("failed to fetch") === false &&
        error.message.includes("Network response") === false
          ? error.message
          : "Sorry, I am unable to provide an answer at the moment.";

      setMessages((prev) => {
        const newMessages = [...prev];
        if (
          newMessages.length > 0 &&
          newMessages[newMessages.length - 1].sender === "ai" &&
          newMessages[newMessages.length - 1].text === ""
        ) {
          newMessages[newMessages.length - 1].text = errorMsg;
          return newMessages;
        }
        return [...prev, { sender: "ai", text: errorMsg }];
      });

      if (isVoiceInput === true) {
        speakText(errorMsg);
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (stopTypingRef.current) {
      stopTypingRef.current();
      stopTypingRef.current = null;
    }
    setIsLoading(false);
  };

  const typeOutMessage = (text, isVoiceInput) =>
    new Promise((resolve) => {
      let currentIndex = 0;
      const charsPerSecond = isVoiceInput ? 13 : 50;
      const typingIntervalMs = 1000 / charsPerSecond;

      if (isVoiceInput) speakText(text);

      let intervalId;
      const stopTyping = () => {
        clearInterval(intervalId);
        stopTypingRef.current = null;
        resolve();
      };
      stopTypingRef.current = stopTyping;

      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg?.sender === "ai") {
              lastMsg.text = text.substring(0, currentIndex + 1);
            }
            return newMessages;
          });
          currentIndex += 1;
        } else {
          stopTyping();
        }
      }, typingIntervalMs);
    });

  const startListening = () => {
    if (!recognition.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (isLoading || cooldownSeconds > 0) return;
    setIsListening(true);
    recognition.current.start();
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indianVoice =
      voices.find((v) => v.lang === "en-IN" && v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang === "en-IN" || v.name.toLowerCase().includes("india"));

    if (indianVoice) {
      utterance.voice = indianVoice;
    } else {
      utterance.lang = "en-IN";
    }

    window.speechSynthesis.speak(utterance);
  };

  const shouldShowSuggestions = !messages.some((msg) => msg.sender === "user");

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div
          className="chatbot-window"
          style={{ width: `${chatSize.width}px`, height: `${chatSize.height}px` }}
        >
          <div className="chatbot-header">
            <div className="chatbot-header-main">
              <h4>Shreeyash's AI Assistant</h4>
              <button
                type="button"
                className={`interview-toggle-btn ${isInterviewMode ? "active" : ""}`}
                onClick={toggleInterviewMode}
              >
                Interview {isInterviewMode ? "On" : "Off"}
              </button>
            </div>
            <button onClick={toggleChat} className="close-btn">
              &times;
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message ai loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {shouldShowSuggestions ? (
            <div className="chatbot-suggestions">
              {SUGGESTED_QUESTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="suggestion-btn"
                  onClick={() => handleSuggestedQuestionClick(item)}
                  disabled={isLoading || cooldownSeconds > 0}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="chatbot-inputbox">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                cooldownSeconds > 0
                  ? `Wait ${cooldownSeconds}s before next request...`
                  : isResumeAnalyzerMode
                    ? "Paste the job description..."
                  : isInterviewMode
                    ? "Ask an interview question..."
                    : "Ask a question..."
              }
              disabled={isListening || isLoading || cooldownSeconds > 0}
            />

            <button
              onClick={startListening}
              className={`mic-btn ${isListening ? "listening" : ""}`}
              title="Voice Input"
              aria-label="Voice Input"
              disabled={isLoading || cooldownSeconds > 0}
            >
              <span aria-hidden="true">🎤</span>
            </button>
            <button
              onClick={isLoading ? handleStopResponse : handleSend}
              className="send-btn"
              title={isLoading ? "Stop" : "Send"}
              aria-label={isLoading ? "Stop" : "Send"}
              disabled={cooldownSeconds > 0}
            >
              <span aria-hidden="true">{isLoading ? "[]" : "->"}</span>
            </button>
          </div>
          <div
            className="chatbot-resize-handle"
            onMouseDown={startResize}
            title="Resize chatbot"
            aria-hidden="true"
          />
        </div>
      )}

      {!isOpen && (
        <button onClick={toggleChat} className="chatbot-fab">
          Chat
        </button>
      )}
    </div>
  );
};

export default Chatbot;

