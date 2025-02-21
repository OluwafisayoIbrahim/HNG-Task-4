"use client";
import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../public/lib/utils";
import UserChatBubble from "./components/UserChatBubble";
import AIChatBubble from "./components/AIChatBubble";
import { SendIcon, SendIconMobile } from "./components/SendIcon";
import TopBar from "./components/TopBar";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CameraIcon from "./components/CameraIcon";
import AppStoreIcon from "./components/AppStoreIcon";

// Helper to count words
const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const formatMessageDay = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { weekday: "long" });
};

// Helper to check if two dates are the same day
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const inputAreaRef = useRef(null);
  const [lastChangedIndex, setLastChangedIndex] = useState(0);

  const languageNames = {
    en: "English",
    pt: "Portuguese",
    es: "Spanish",
    ru: "Russian",
    tr: "Turkish",
    fr: "French",
  };

  // Accessibility: Manage focus after sending messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = document.getElementById(
        `message-${messages[messages.length - 1].id}`
      );
      if (latestMessage) {
        latestMessage.focus();
      }
    }
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        textareaRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const detectLanguage = async (text) => {
    if (!("ai" in window) || !("languageDetector" in window.ai)) {
      throw new Error("Language Detection API not supported in this browser.");
    }

    try {
      const capabilities = await window.ai.languageDetector.capabilities();
      const canDetect = capabilities.capabilities;

      if (canDetect === "no") {
        throw new Error("Language detection is not available.");
      }

      const detector = await window.ai.languageDetector.create();
      const results = await detector.detect(text);

      if (!results || results.length === 0) {
        throw new Error("Could not detect language.");
      }

      return results[0].detectedLanguage;
    } catch (error) {
      throw new Error(`Language detection failed: ${error.message}`);
    }
  };

  // Helper to clean up each bullet line.
// Helper to clean up each bullet line.
// New helper: deduplicate paragraphs with word‑for‑word fuzzy matching.
const deduplicateParagraphs = (text) => {
  // Split text into sentences based on a period followed by whitespace.
  let sentences = text.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
  const result = [];
  const similarityThreshold = 0.8; // Adjust this threshold as needed.

  // Simple similarity metric: ratio of common unique words.
  const sentenceSimilarity = (s1, s2) => {
    const words1 = s1.split(/\s+/).map(w => w.toLowerCase());
    const words2 = s2.split(/\s+/).map(w => w.toLowerCase());
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    let common = 0;
    for (let word of set1) {
      if (set2.has(word)) {
        common++;
      }
    }
    const avgLength = (words1.length + words2.length) / 2;
    return common / avgLength;
  };

  for (let sentence of sentences) {
    let duplicateFound = false;
    for (let i = 0; i < result.length; i++) {
      const sim = sentenceSimilarity(result[i], sentence);
      if (sim >= similarityThreshold) {
        // Replace the existing sentence if the new one is longer.
        if (sentence.length > result[i].length) {
          result[i] = sentence;
        }
        duplicateFound = true;
        break;
      }
    }
    if (!duplicateFound) {
      result.push(sentence);
    }
  }
  return result.join(" ");
};

// Helper to clean up each bullet line.
const cleanBullet = (bullet) => {
  // Remove stray asterisks and extra whitespace.
  let cleaned = bullet.replace(/\*/g, "").trim();
  // Remove consecutive duplicate words (case-insensitive).
  cleaned = cleaned.replace(/\b(\w+)( \1\b)+/gi, "$1");
  return cleaned;
};

const deduplicateSummary = (summaryText) => {
  // Split the summary into bullet points.
  const bulletPoints = summaryText
    .split("*")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map(cleanBullet);

  // Remove exact duplicates.
  const uniqueBulletPoints = Array.from(new Set(bulletPoints));

  // Further filter out bullet points that are substrings of another bullet.
  const filteredBulletPoints = uniqueBulletPoints.filter((bullet, _, arr) => {
    const lowerBullet = bullet.toLowerCase();
    return !arr.some((otherBullet) => {
      if (otherBullet === bullet) return false;
      return otherBullet.toLowerCase().includes(lowerBullet);
    });
  });

  // Reassemble the summary with bullet points.
  return filteredBulletPoints.join("\n");
};


  const handleSend = async (e) => {
    e.preventDefault();
    setError(null);

    // Input validation
    if (!inputText.trim()) {
      setError("Please enter some text before sending.");
      textareaRef.current?.focus();
      return;
    }

    setIsProcessing(true);

    try {
      const text = inputText.trim();
      const isLong = wordCount(text) > 150;

      // Create the user message bubble (right side)
      const userMessage = {
        id: Date.now(),
        sender: "user",
        text: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");

      // Detect language
      const detectedLanguage = await detectLanguage(text);

      // AI bubble: language detection message (always sent)
      const langBubble = {
        id: Date.now() + 1,
        sender: "ai",
        text: `Language detected is ${
          languageNames[detectedLanguage] || detectedLanguage
        }`,
        timestamp: new Date().toISOString(),
        language: detectedLanguage,
        originalText: text,
      };

      setMessages((prev) => [...prev, langBubble]);

      // Decide next steps based on language and text length
      if (detectedLanguage !== "en" && detectedLanguage !== "Unknown") {
        // Non-English
        if (isLong) {
          // Auto-translate for long non-English text
          const translatingBubble = {
            id: Date.now() + 2,
            sender: "ai",
            text: "Translating to English...",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, translatingBubble]);

          try {
            const translator = await window.ai.translator.create({
              sourceLanguage: detectedLanguage,
              targetLanguage: "en",
            });
            const translation = await translator.translate(text);
            const translationBubble = {
              id: Date.now() + 3,
              sender: "ai",
              text: `${translation}`,
              timestamp: new Date().toISOString(),
              language: "en",
              originalText: translation,
            };
            // Add the translation result as a new chat bubble
            setMessages((prev) => [...prev, translationBubble]);

            // After auto-translation, offer a Summarize button in a new control bubble
            const summarizeControlBubble = {
              id: Date.now() + 4,
              sender: "ai",
              controlTypes: ["summarize"],
              originalText: translation,
              language: "en",
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, summarizeControlBubble]);
          } catch (error) {
            setError(`Translation failed: ${error.message}`);
          }
        } else {
          // For non-English short text, offer a Translate button (with language selector)
          const translateControlBubble = {
            id: Date.now() + 2,
            sender: "ai",
            controlTypes: ["translate"],
            originalText: text,
            language: detectedLanguage,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, translateControlBubble]);
        }
      } else if (detectedLanguage === "en") {
        // English text: offer control options based on word count
        if (isLong) {
          // For long English text, offer both Translate and Summarize buttons
          const controlBubble = {
            id: Date.now() + 2,
            sender: "ai",
            controlTypes: ["translate", "summarize"],
            originalText: text,
            language: "en",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, controlBubble]);
        } else {
          // For short English text, offer a Translate button
          const controlBubble = {
            id: Date.now() + 2,
            sender: "ai",
            controlTypes: ["translate"],
            originalText: text,
            language: "en",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, controlBubble]);
        }
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Message processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manual translation from a Translate control bubble.
  // The translation result will be sent in a new chat bubble (below the control bubble).
  const handleTranslate = async (
    text,
    sourceLanguage,
    targetLanguage,
    controlBubbleId
  ) => {
    try {
      // 1) Show a typing bubble instead of a static "Translating..." text
      const typingMessage = {
        id: Date.now(),
        sender: "ai",
        typing: true, // Marker to render the typing animation
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, typingMessage]);

      // 2) Perform translation
      const translator = await window.ai.translator.create({
        sourceLanguage,
        targetLanguage,
      });
      const translation = await translator.translate(text);

      // 3) Remove the typing bubble
      setMessages((prev) => prev.filter((msg) => msg.id !== typingMessage.id));

      // 4) Add the translation result as a new chat bubble
      const translationMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: `${translation}`,
        timestamp: new Date().toISOString(),
        language: targetLanguage,
        originalText: translation,
      };
      setMessages((prev) => [...prev, translationMessage]);

      // 5) If text is long enough, offer a Summarize button in a new bubble
      if (wordCount(translation) > 150) {
        const summarizeControlBubble = {
          id: Date.now() + 2,
          sender: "ai",
          controlTypes: ["summarize"],
          originalText: translation,
          language: targetLanguage,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, summarizeControlBubble]);
      }
    } catch (error) {
      setError(`Translation failed: ${error.message}`);
    }
  };

  const handleTranslationResult = (translatedText, language) => {
    const newMessage = {
      id: Date.now(),
      sender: "ai",
      text: `${translatedText}`,
      timestamp: new Date().toISOString(),
      language: language,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSummarizeResult = (summarizedText) => {
    const summaryMessage = {
      id: Date.now(),
      sender: "ai",
      text: `${summarizedText}`,
      timestamp: new Date().toISOString(),
      language: "en",
      originalText: summarizedText,
    };
    setMessages((prev) => [...prev, summaryMessage]);
  };

  // Handle manual summarization from a Summarize control bubble.
  // The summary is sent as a new chat bubble.
  const handleSummarize = async (text) => {
    try {
      if (!("ai" in window) || !("summarizer" in window.ai)) {
        throw new Error("Summarization API not supported in this browser.");
      }
      // Show typing bubble
      const typingMessage = {
        id: Date.now(),
        sender: "ai",
        typing: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, typingMessage]);
  
      const summarizer = await window.ai.summarizer.create({
        type: "key-points", // or 'plain-text'
        format: "markdown",
        length: "medium",
      });
  
      // Await the raw summary from the API.
      const summaryRaw = await summarizer.summarize(text);
  
      // First, deduplicate repeated paragraphs.
      const paragraphsDeduped = deduplicateParagraphs(summaryRaw);
  
      // Then, clean up bullet points in the deduplicated text.
      const summary = deduplicateSummary(paragraphsDeduped);
  
      // Remove the typing bubble.
      setMessages((prev) => prev.filter((msg) => msg.id !== typingMessage.id));
  
      // Remove any existing summarize control bubbles.
      setMessages((prev) =>
        prev.filter(
          (msg) => !msg.controlTypes || !msg.controlTypes.includes("summarize")
        )
      );
  
      // Add the cleaned summary result as a new message.
      const summaryMessage = {
        id: Date.now(),
        sender: "ai",
        text: `${summary}`,
        timestamp: new Date().toISOString(),
        language: "en",
        originalText: summary,
      };
      setMessages((prev) => [...prev, summaryMessage]);
    } catch (error) {
      setError(`Summarization failed: ${error.message}`);
    }
  };
  

  // Group consecutive messages by sender
  // Group messages: ensure that any message with typing: true starts a new group.
  const groupedMessages = messages.reduce((groups, msg) => {
    const msgDate = new Date(msg.timestamp);
    const lastDayGroup = groups[groups.length - 1];

    // Create a new day group if it's the first message or the day has changed.
    if (!lastDayGroup || !isSameDay(lastDayGroup.date, msgDate)) {
      groups.push({
        date: msgDate, // keeps the day grouping
        messageGroups: [
          {
            sender: msg.sender,
            timestamp: msgDate, // unique header timestamp for this group
            messages: [msg],
          },
        ],
      });
    } else {
      // Within the same day group, get the last message group.
      const lastMessageGroup =
        lastDayGroup.messageGroups[lastDayGroup.messageGroups.length - 1];
      const lastMsg =
        lastMessageGroup.messages[lastMessageGroup.messages.length - 1];
      const lastMsgDate = new Date(lastMsg.timestamp);
      const timeDifference = msgDate.getTime() - lastMsgDate.getTime();

      // If sender changes, it's a typing message, or there's a gap of ≥ 1 minute,
      // then start a new message group with its own timestamp.
      if (
        lastMessageGroup.sender !== msg.sender ||
        msg.typing ||
        timeDifference >= 60000
      ) {
        lastDayGroup.messageGroups.push({
          sender: msg.sender,
          timestamp: msgDate, // new header timestamp for this group
          messages: [msg],
        });
      } else {
        lastMessageGroup.messages.push(msg);
      }
    }

    return groups;
  }, []);

  return (
    <div
      className="chat-container w-full bg-white dark:bg-white mx-auto flex flex-col h-screen"
      role="main"
      aria-label="Chat Interface"
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-white mb-4">
        <TopBar />
      </div>
      <div
        className="messages flex-1 overflow-y-auto bg-white dark:bg-white overflow-x-hidden space-y-4 mb-4"
        role="log"
        aria-label="Message history"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {groupedMessages.map((dayGroup, dayIndex) => (
            <motion.div key={dayGroup.date.toISOString()} layout>
              {/* Day-level header (if needed) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-4"
              >
                <span className="text-gray-500 px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                  <span className="font-sfBold">
                    {formatMessageDay(dayGroup.date)}
                  </span>
                  <span className="font-sfRegular">
                    {formatMessageTime(dayGroup.date)}
                  </span>
                </span>
              </motion.div>

              {/* Message Groups */}
              {dayGroup.messageGroups.map((group, groupIndex) => (
                <div
                  key={`${dayIndex}-${groupIndex}`}
                  className={`flex ${
                    group.sender === "user"
                      ? "justify-end items-end"
                      : "justify-start items-end"
                  } items-start relative`}
                >
                  {/* AI Avatar */}
                  {group.sender !== "user" && (
                    <Image
                      src="/images/chrome-icon.png"
                      alt="AI Avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 mr-2 z-10 xs:hidden xl:block"
                    />
                  )}

                  <div className="flex flex-col space-y-1">
                    {/* Messages Column */}
                    {group.messages.map((message) => {
                      const globalIndex = messages.findIndex(
                        (m) => m.id === message.id
                      );
                      const isNew = globalIndex >= lastChangedIndex;
                      const layoutDuration = isNew
                        ? (globalIndex - lastChangedIndex) * 0.15 + 0.85
                        : 1;

                      return (
                        <motion.div
                          key={message.id}
                          layout
                          id={`message-${message.id}`}
                          style={{ originX: group.sender === "user" ? 1 : 0 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            opacity: { duration: 0.2 },
                            layout: {
                              type: "spring",
                              bounce: 0.4,
                              duration: layoutDuration,
                            },
                          }}
                          className="relative"
                        >
                          {group.sender === "user" ? (
                            <UserChatBubble
                              message={message}
                              selectedLanguage={selectedLanguage}
                              setSelectedLanguage={setSelectedLanguage}
                              handleTranslate={handleTranslate}
                              handleSummarize={handleSummarize}
                              handleTranslationResult={handleTranslationResult}
                            />
                          ) : (
                            <AIChatBubble
                              message={message}
                              selectedLanguage={selectedLanguage}
                              setSelectedLanguage={setSelectedLanguage}
                              setError={setError}
                              error={error}
                              handleTranslate={handleTranslate}
                              handleSummarize={handleSummarize}
                              handleTranslationResult={handleTranslationResult}
                              handleSummarizeResult={handleSummarizeResult}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* User Avatar */}
                  {group.sender === "user" && (
                    <Image
                      src="/images/user-icon.png"
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 ml-2 z-10 xs:hidden xl:block"
                    />
                  )}
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {error && (
          <div
            className="error font-light font-sfRegular text-[12px] text-red-500 xs:-ml-3 xl:ml-6 px-4 -mt-2 mb-4"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}

      {/* Input Area */}
      <div
        ref={inputAreaRef}
        className="input-area mt-auto"
        role="form"
        aria-label="Message input form"
      >
        <form onSubmit={handleSend} className="relative">
          {/* XL Variant – Full textarea & send button */}
          <div className="xl:flex items-center space-x-2 xs:hidden">
          <CameraIcon />
  <AppStoreIcon />
          <div className=" relative flex-1 hidden xl:block">
            <input
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className={cn(
                "w-full p-3 pr-12 resize-none h-[48px]",
                "bg-[rgba(255,255,255,0.5)] border border-[#C8C8CC] rounded-[32px]",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-black" ,
                "disabled:opacity-50 caret-[#3478F6] font-sfRegular disabled:cursor-not-allowed"
              )}
              disabled={isProcessing}
              aria-label="Message input"
              aria-describedby={error ? "error-message" : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className={cn(
                "absolute w-[32px] h-[32px] right-[12px] top-[4px] z-[1]"
              )}
              aria-label={isProcessing ? "Sending message..." : "Send message"}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          </div>

          {/* XS Variant – Custom “Bar” with send arrow */}
          <div className="flex items-center space-x-2 xl:hidden">
  <CameraIcon />
  <AppStoreIcon />
  <div
    className="relative flex-1 xl:hidden"
    onClick={() => textareaRef.current && textareaRef.current.focus()}
  >
    {/* Input container */}
    <input
      ref={textareaRef}
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      placeholder="Type your message here..."
      className={cn(
        "w-full p-3 pr-12 resize-none h-[48px]",
        "bg-[rgba(255,255,255,0.5)] border border-[#C8C8CC] rounded-[32px]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:opacity-50 caret-[#3478F6] disabled:cursor-not-allowed"
      )}
    />
    {/* Send Arrow Button */}
    <button
      type="submit"
      disabled={isProcessing || !inputText.trim()}
      className="absolute w-[27px] h-[27px] right-[15px] top-[4.5px] z-[1]"
      aria-label={isProcessing ? "Sending message..." : "Send message"}
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <SendIconMobile className="w-5 h-5" />
      )}
    </button>
  </div>
</div>

        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
