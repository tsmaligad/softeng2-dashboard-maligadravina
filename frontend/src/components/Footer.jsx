// src/components/Footer.jsx
import React from "react";
import facebook from "../assets/facebook-logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#4A3600] pb-[60px] text-[#F5EFEF]">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="ml-[150px] mt-[80px] text-lg font-semibold">
            Sweet Treats Davao
          </h3>
          <a
            
            className="text-[#F8B8B8] mt-[67px] mr-[150px] hover:underline"
          >
            +63 926 112 9632
          </a>
        </div>

        <div className="flex justify-between items-start mr-[150px]">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <img
              src={facebook}
              alt="Facebook"
              className="w-[20px] h-[20px] ml-[150px] hover:opacity-80 filter brightness-0 invert"
            />
          </a>

          <div className="text-right space-y-2">
            <p>
              <a
                
                className="text-[#F5EFEF] no-underline hover:underline"
              >
                carlaroseagangamido@gmail.com
              </a>
            </p>
            <p>
              Km. 12, Purok 12, Catalunan Pequeño, Davao City,
              <br />
              Davao del Sur, Philippines
            </p>
          </div>
        </div>
      </div>

      
    </footer>
  );
}
