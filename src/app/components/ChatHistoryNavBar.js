// components/ChatHistoryNavbar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const sidebarVariants = {
  hidden: { x: "-100%" },
  visible: { x: "0%" },
  exit: { x: "-100%" },
};

const ChatHistoryNavbar = ({ chatHistory, onSelectSession, onClose }) => {
  const [animationState, setAnimationState] = useState("visible");

  return (
    <motion.div
      initial="hidden"
      animate={animationState}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (animationState === "exit") {
          onClose();
        }
      }}
      className="fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 shadow-md z-50"
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-lg font-thin text-[#007AFF] font-sfRegular">
          Chat History
        </h2>
        <button
          onClick={() => setAnimationState("exit")}
          className="text-[#007AFF] font-thin font-sfRegular text-[17px] focus:outline-none"
        > 
          Close
        </button>
      </div>
      <ul className="overflow-y-auto h-full">
        {chatHistory.map((session, index) => (
          <li key={index}>
            <button
              onClick={() => onSelectSession(session)}
              className="w-full text-left p-4 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              <div className="font-semibold text-gray-800 font-sfRegular dark:text-gray-100">
                {session.title}
              </div>
              <div className="text-sm text-gray-600 truncate font-sfRegular dark:text-gray-400">
                {session.preview}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ChatHistoryNavbar;
