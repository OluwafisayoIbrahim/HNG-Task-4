import React from "react";
import ChromeIcon from "./ChromeIcon";
import ArrowIcon from "../../../public/images/image.png";
import Image from "next/image";

export default function NavigationBar() {
  return (
    <div
      className="relative 
        xs:w-full xs:h-[116px] xs:left-0 xs:top-0 
        xl:w-full xl:h-[100px] xl:left-0 xl:top-0"
    >
      <div
        className="absolute 
    xs:left-0 xs:top-0 xs:max-w-full xs:w-full xs:h-[116px] 
    xl:left-0 xl:top-0 xl:w-full xl:h-[116px]
    bg-[#F9F9F9] shadow-[0px_0.5px_0px_#B2B2B2] backdrop-blur-2xl xl:hidden"
      />

      <div
        className="absolute 
          xs:left-1/2 xs:top-1/2 xs:transform xs:-translate-x-1/2 xs:-translate-y-1/2 
          xl:left-1/2 xl:top-1/2 xl:transform xl:-translate-x-1/2 xl:-translate-y-1/2
          xs:w-[48px] xs:h-[48px] 
          xl:w-[48px] xl:h-[48px]
          rounded-full shadow-[0px_5px_20px_rgba(166,166,166,0.3)]
          flex items-center justify-center"
      >
        <ChromeIcon />
      </div>

      <div
        className="absolute 
    xs:left-1/2 xs:top-[95px] xs:transform xs:-translate-x-1/2 xs:w-auto xs:h-[15px] 
    xl:left-1/2 xl:top-[95px] xl:transform xl:-translate-x-1/2 xl:w-auto xl:h-[15px]
    flex flex-row items-center justify-center gap-[3px]"
      >
        <div
          className="xs:text-[10px] xs:leading-[15px] xs:text-center xs:text-[#000000]
               xl:text-[15px] xl:leading-[15px] xl:text-center xl:text-[#000000]
               font-sfRegular"
        >
          Chrome AI
        </div>
        <div
          className="xs:w-[4px] xs:h-[7px] xl:w-[4px] xl:h-[7px]
            mx-1"
        >
          <Image src={ArrowIcon} alt="Arrow Icon" />
        </div>
      </div>

      <div
        className="absolute 
          xs:left-0 xs:top-[49px] xs:w-[40px] xs:h-[40px] 
          xl:left-0 xl:top-[49px] xl:w-[40px] xl:h-[40px]"
      ></div>
    </div>
  );
}
