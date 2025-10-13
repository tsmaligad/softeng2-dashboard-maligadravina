import React from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";

const Myaccount = () => {
  return (
    <div className="flex flex-col min-h-screen"> 
      {/* Stickybar at top */}
      <Stickybar />

      {/* Content */}
      <div className="pt-[72px] flex-1 bg-[#F5EFEF]"> 
        <section className="bg-[#4A3600] h-[90px]" />

        <main className=" flex items-start justify-center ">
          <div className="w-full max-w-[1200px] mx-auto px-4 ">
            <h1 className="mt-[100px] text-5xl font-kapakana italic text-left text-[#332601] mb-4">
              My Account
            </h1>
            <hr className="border-t border-[#8b7760] mb-[500px]" />
          </div>
        </main>
      </div>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
};

export default Myaccount;
