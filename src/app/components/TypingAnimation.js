import React from "react"

const TypingAnimation = () => {
  return (
    <>
      <span className="p-4 relative bg-[#E6E7ED] rounded-[40px] h-[10px] w-full flex justify-center items-center">
        <span className="dot1 mx-[2px] bg-[#9E9EA1] h-[15px] w-[15px] rounded-full opacity-[0.4]"></span>
        <span className="dot2 mx-[2px] bg-[#9E9EA1] h-[15px] w-[15px] rounded-full opacity-[0.4]"></span>
        <span className="dot3 mx-[2px] bg-[#9E9EA1] h-[15px] w-[15px] rounded-full opacity-[0.4]"></span>
      </span>
      <style jsx>{`
        /* Pseudo-elements for decoration */
        .loadingDots:before,
        .loadingDots:after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: -2px;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background-color: #e6e7ed;
        }
        .loadingDots:before {
          bottom: -15px;
          height: 10px;
          width: 10px;
          left: -7px;
        }

        /* Keyframes for dot animation */
        @keyframes dot1L {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.4;
          }
        }
        .dot1 {
          animation: dot1L 1s ease-in-out 0.5s infinite forwards;
        }
        .dot2 {
          animation: dot1L 1s ease-in-out 0.7s infinite forwards;
        }
        .dot3 {
          animation: dot1L 1s ease-in-out 1s infinite forwards;
        }
      `}</style>
    </>
  );
};

export default TypingAnimation;
