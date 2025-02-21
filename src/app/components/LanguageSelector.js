import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function LanguageSelector({
  onSelectLanguage,
  onDropdownToggle,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [dropdownDirection, setDropdownDirection] = useState("down");

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "pt", name: "Portuguese" },
    { code: "es", name: "Spanish" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "fr", name: "French" },
  ];

  const handleToggle = (newState) => {
    setIsOpen(newState);
    onDropdownToggle?.(newState);
  };

  const handleSelect = (code, name) => {
    setSelectedLanguage(name);
    setIsOpen(false);
    onSelectLanguage(code);
  };

  const handleNativeSelect = (event) => {
    const selectedCode = event.target.value;
    const selectedName =
      languages.find((lang) => lang.code === selectedCode)?.name || "";
    setSelectedLanguage(selectedName);
    onSelectLanguage(selectedCode);
  };
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        if (buttonRef.current && dropdownRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect();
          const dropdownHeight = dropdownRef.current.offsetHeight;
          const spaceBelow = window.innerHeight - buttonRect.bottom;
          setDropdownDirection(spaceBelow < dropdownHeight ? "up" : "down");
        }
      });
    }
  }, [isOpen]);

  const dropdownPositionClass =
    dropdownDirection === "down" ? "mt-1" : "bottom-full mb-1";

  return (
    <div className="relative">
      <select
        value={
          selectedLanguage
            ? languages.find((lang) => lang.name === selectedLanguage)?.code
            : ""
        }
        onChange={handleNativeSelect}
        className="hidden"
        aria-hidden="true"
      >
        <option value="" disabled>
          Select
        </option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        ref={buttonRef}
        onClick={() => handleToggle(!isOpen)}
        className="w-full xs:w-24 xl:w-32 h-7 px-3 py-2.5 bg-gray-50/80 backdrop-blur-xl border border-[#007AFF] rounded-lg text-sm xl:text-base text-gray-900 flex items-center justify-between"
      >
        <span>{selectedLanguage || "Select"}</span>
        <div className="flex flex-col -space-y-2 items-center ml-2">
          <ChevronUp className="h-4 w-4 text-gray-600" />
          <ChevronDown className="-mt-1 h-4 w-4 text-gray-600" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            ref={dropdownRef}
            initial={{ opacity: 0, y: dropdownDirection === "down" ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropdownDirection === "down" ? -10 : 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${dropdownPositionClass} w-full xs:w-48 xl:w-64 bg-gray-50/80 backdrop-blur-xl border border-gray-200/50 rounded-lg shadow-lg overflow-hidden`}
          >
            <div className="flex justify-between px-3 py-2 border-b border-gray-200/50">
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-500 text-xs xl:text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-500 text-xs xl:text-sm font-semibold"
              >
                Done
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code, lang.name)}
                  className={`w-full px-3 py-2.5 text-center text-sm xl:text-base hover:bg-gray-100/50 ${
                    selectedLanguage === lang.name
                      ? "text-blue-500 font-medium"
                      : "text-gray-900"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
