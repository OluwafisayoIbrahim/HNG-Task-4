import React from "react";
import LanguageSelector from "./LanguageSelector";
import TranslateButton from "./TranslateButton";


const UserChatBubble = ({
  message,
  selectedLanguage,
  setSelectedLanguage,
  handleTranslate,
  handleTranslationResult,
}) => {
  return (
    <div className="relative w-full flex justify-end xl:-ml-1">
  {/* Limit the bubble width to about 62% of the container */}
  <div className="relative bg-[#007AFF] rounded-[17px] xs:mr-4 xl:mr-1 p-[9.6px] h-auto text-white xl:max-w-[645px] xs:max-w-[300px]">
    {/* Message text */}
    <div className="text-[15px] left-5 font-normal whitespace-normal break-words">
      <p className="font-sfRegular tracking-wider">{message.text}</p>
    </div>
          {/* Bubble tail */}
          <div className="absolute -right-[5px] bottom-0 z-0 pointer-events-none">
            <div className="relative w-5 h-3.5">
              {/* Tail outer edge */}
              <div className="absolute inset-0 bg-[#007AFF] rounded-bl-[20px]"/>
              {/* Tail inner edge */}
              <div className="absolute left-[75%] right-[-145%] top-[-121.05%] bottom-[-21.05%] bg-white rounded-bl-[14px]" />
            </div>
          </div>
        </div>

        {/* Controls section */}
        {message.controlTypes && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.controlTypes.includes("translate") && (
              <div className="flex items-center gap-2">
                <LanguageSelector
                  onSelectLanguage={setSelectedLanguage}
                  currentLanguage={selectedLanguage}
                />
                <TranslateButton
                  text={message.originalText || message.text}
                  sourceLanguage={message.language}
                  targetLanguage={selectedLanguage}
                  onTranslated={handleTranslationResult}
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
          </div>
        )}
      </div>
  );
};

export default UserChatBubble;
