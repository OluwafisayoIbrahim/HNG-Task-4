import React, { useState } from "react";

const TranslateButton = ({ 
  text, 
  sourceLanguage, 
  targetLanguage, 
  onTranslated,
  onError // <-- Callback for error handling
}) => {
  const languageNames = {
    en: "English",
    pt: "Portuguese",
    es: "Spanish",
    ru: "Russian",
    tr: "Turkish",
    fr: "French"
  };

  const [localError, setLocalError] = useState('');

  const handleTranslate = async () => {
    if (!("ai" in window) || !("translator" in window.ai)) {
      console.error("Translator API not supported.");
      const errMsg = "Translation API not supported.";
      setLocalError(errMsg);
      onError && onError(errMsg);
      return;
    }

    try {
      // Check if the language pair is supported
      const translatorCapabilities = await window.ai.translator.capabilities();
      const isLanguagePairAvailable = await translatorCapabilities.languagePairAvailable(sourceLanguage, targetLanguage);

      if (isLanguagePairAvailable !== "readily") {
        const errMsg = `Translation not supported for ${languageNames[sourceLanguage] || sourceLanguage} to ${languageNames[targetLanguage] || targetLanguage}.`;
        setLocalError(errMsg);
        onError && onError(errMsg);
        return;
      }

      // Create the translator instance
      const translator = await window.ai.translator.create({
        sourceLanguage,
        targetLanguage
      });

      // Translate the text
      const result = await translator.translate(text);
      if (result) {
        onTranslated(result, targetLanguage);
      } else {
        const errMsg = "Translation failed. Please check the language pair.";
        setLocalError(errMsg);
        onError && onError(errMsg);
      }
    } catch (err) {
      console.error("Translation failed:", err);
      const errMsg = err.name === "NotSupportedError" 
        ? `Translation not supported for ${languageNames[sourceLanguage] || sourceLanguage} to ${languageNames[targetLanguage] || targetLanguage}.`
        : "An unexpected error occurred.";
      setLocalError(errMsg);
      onError && onError(errMsg);
    }
  };

  return (
    <div>
      <button onClick={handleTranslate} className="bg-[#007AFF] rounded-[12px] h-[34px] w-[150px]">
        <span className="font-sfRegular text-white">Translate</span>
      </button>
      {/* Inline error display removed */}
    </div>
  );
};

export default TranslateButton;
