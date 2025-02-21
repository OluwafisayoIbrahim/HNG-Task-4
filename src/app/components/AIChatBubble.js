import React, { useEffect } from "react";
import LanguageSelector from "./LanguageSelector";
import TranslateButton from "./TranslateButton";
import SummarizeButton from "./SummarizeButton";
import TypingAnimation from "./TypingAnimation"

const AIChatBubble = ({
  message,
  selectedLanguage,
  setSelectedLanguage,
  setError,
  error,
  handleTranslate,
  handleSummarize,
  handleTranslationResult,
  handleSummarizeResult,
  LanguageSelectorComponent
}) => {
  const handleTranslateError = (errMsg) => {
    setError(errMsg);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    console.log("AIChatBubble message:", message);
  }, [message]);
  
  
  
  return (
    <div className="relative w-full flex justify-start my-1">
        <div className="relative bg-[#E6E5EB] rounded-[17px] p-[12px] xs:ml-4 xl:ml-1 h-auto text-black xl:max-w-[645px] xs:max-w-[300px]">
        <div className="text-[15px] left-5 font-normal whitespace-normal break-words">
        <p className="font-sfRegular tracking-wide">
        {message.typing ? (
          <span><TypingAnimation /></span>
            
          ) : (
            <span className="font-sfRegular tracking-wide">{message.text}</span>
          )}
        </p>
        </div>
      {/* Bubble – Friend Design */}
      <div className="absolute -left-[5px] bottom-0 z-0 pointer-events-none">
            <div className="relative w-5 h-3.5">
              {/* Tail outer edge */}
              <div className="absolute inset-0 bg-[#E6E5EB] rounded-br-[20px]"/>
              {/* Tail inner edge */}
              <div className="absolute right-[75%] left-[-145%] top-[-121.05%] bottom-[-21.05%] z-0 bg-white rounded-br-[14px]" />
            </div>
        </div>

      {/* Controls */}
      {message.controlTypes && (
        <div className="controls-container mt-2 flex flex-wrap gap-2">
          {message.controlTypes.includes("translate") && (
            <div className="translation-controls flex items-center gap-2">
              <LanguageSelector
                onSelectLanguage={setSelectedLanguage}
                currentLanguage={selectedLanguage}
                LanguageSelectorComponent={LanguageSelectorComponent}
              />
              <TranslateButton
                text={message.originalText || message.text}
                sourceLanguage={message.language}
                targetLanguage={selectedLanguage}
                onTranslated={handleTranslationResult}
                onError={handleTranslateError}
                onClick={() =>
                  handleTranslate(
                    message.originalText || message.text,
                    message.language,
                    selectedLanguage,
                    message.id
                  )
                }
              />
            </div>
          )}
          {message.controlTypes.includes("summarize") && (
            <div className="summarize-controls">
              <SummarizeButton
                text={message.originalText || message.text}
                onSummarizeResult={handleSummarizeResult}
                onClick={() =>
                  handleSummarize(message.originalText || message.text)
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default AIChatBubble;
