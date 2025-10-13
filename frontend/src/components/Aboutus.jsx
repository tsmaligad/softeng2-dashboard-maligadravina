import React from "react";
import Stickybar from "./Stickybar";

const Aboutus = () => {
    return (
        <>
          <Stickybar />
          <div className="pt-[72px]">
            <section className="bg-[#4A3600] h-[90px] mb-[70px]" />
          </div>
    
          <main className="flex items-start justify-center">
            <div className="w-full max-w-[1200px] mx-auto px-4">
              <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mb-4">
                About Us
              </h1>
              <hr className="border-t border-[#8b7760]" />
            </div>
          </main>
        </>
      );
    };

export default Aboutus;