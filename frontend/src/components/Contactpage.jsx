import React from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import email from "../assets/contactpage/envelope.png";
import loc from "../assets/contactpage/location.png";
import call from "../assets/contactpage/telephone.png";
import { FaChevronDown } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";



const Contactpage = () => {
  return (
    <>
      <Stickybar />
      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px]" />
      </div>

      {/* Background */}
      <main className="flex justify-center bg-[#F4E9E9]">
        <div className="w-full max-w-[1200px] mt-[70px] mx-auto px-4 pb-16">
          {/* HEADER */}
          <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mb-4">
            Contact Us
          </h1>

          {/* ✅ FORCE SIDE-BY-SIDE */}
          <div className="flex flex-row gap-10 items-start justify-between">
            {/* LEFT SIDE */}
            <div className="flex-1 max-w-[520px] text-[#332601]">
              <p className="text-base leading-relaxed mb-6 max-w-[480px]">
                Have a question or need help? Fill out our quick and easy inquiry
                form to reach us! We&apos;ll get back to you soon.
              </p>

              <div className="space-y-5 mb-8">
                <div className="flex gap-3 items-start">
                  <img
                    src={loc}
                    alt="Location Icon"
                    className="w-[20px] h-[20px] mt-[20px] mr-[10px]"
                  />
                  <p>
                    Km. 12, Purok 12, Catalunan Pequeño, Davao City, Davao del
                    Sur, Philippines
                  </p>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src={email}
                    alt="Email Icon"
                    className="w-[20px] h-[20px] mt-[18px] mr-[10px]"
                  />
                  <p className="underline underline-offset-2">
                    carlasoseagangamido@gmail.com
                  </p>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src={call}
                    alt="Phone Icon"
                    className="w-[20px] h-[20px] mt-[16px] mr-[10px]"
                  />
                  <p>Mobile: +63 926 112 9632</p>
                </div>
              </div>

              {/* make divider match map width */}
              <div className="w-[490px] h-[2px] bg-[#8b7760] mb-8" />

              {/* MAP BOX */}
              <div className="mb-[130px] mt-[50px] w-[490px] h-[280px] bg-white rounded-[20px] overflow-hidden shadow-md">
                <iframe
                  title="Sweet Treats Davao Map"
                  src="https://www.google.com/maps?q=Catalunan%20Peque%C3%B1o%20Davao%20City&output=embed"
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1 flex justify-end">
              {/* 🔥 this is the part we make look like the pic */}
              <div className="bg-[#F9F6F6] rounded-[12px] shadow-md px-[40px] py-[150px] w-full max-w-[520px] border border-[#F2E3D8] mt-[-60px]">
                {/* NAME ROW */}
                <div className="grid grid-cols-2 gap-4 mb-5 mt-[-110px] ">
                  <div>
                    <label className="block text-sm text-[#332601] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      className="w-[230px] bg-[#FDFBF9] mt-[5px] h-[25px] border border-[#463300ba] rounded-[10px] px-3 py-2.5 text-sm focus:outline-none "
                      />
                  </div>
                  <div>
                    <label className="block text-sm text-[#332601] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      className="w-[230px] bg-[#FDFBF9] mt-[5px] h-[25px] border border-[#463300ba] rounded-[10px] px-3 py-2.5 text-sm focus:outline-none "
                      />
                  </div>
                </div>

                {/* CONTACT INFO */}
                <div className="grid grid-cols-2 gap-4 mt-[20px] mb-5">
                  <div>
                    <label className="block text-sm text-[#332601]  mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your mail address"
                      className="w-[230px] bg-[#FDFBF9] mt-[5px] h-[25px] border border-[#463300ba] rounded-[10px] px-3 py-2.5 text-sm focus:outline-none "
                      />
                  </div>
                  <div>
                    <label className="block text-sm text-[#332601] mb-1">
                      Contact Number
                    </label>
                    <div className="flex gap-2">
                      
                      <input
                        type="text"
                        placeholder="+63"
                        className="w-[230px] bg-[#FDFBF9] mt-[5px] h-[25px] border border-[#463300ba] rounded-[10px] px-3 py-2.5 text-sm focus:outline-none "
                      />
                    </div>
                  </div>
                </div>

               {/* INQUIRY TYPE */}
<div className="mb-5">
  <label className="block text-sm text-[#332601] mt-[20px] mb-1">
    Inquiry Type
  </label>

  {/* Wrap in relative container so we can absolutely position the icon */}
  <div className="relative w-[496px]">
    <select
      defaultValue=""
      className="w-full bg-[#FDFBF9] mt-[5px] h-[25px] border border-[#463300ba] rounded-[10px] px-3 py-2.5 pr-8 text-sm text-[#332601] focus:outline-none appearance-none"
    >
      <option value="" disabled>
        Select type of inquiry
      </option>
      <option>Order Concern</option>
      <option>Product Inquiry</option>
      <option>Partnership</option>
      <option>Others</option>
    </select>

    {/* This icon is now visually inside the select box */}
    <FaChevronDown className="ml-[-28px] mt-[2px] absolute right-3 top-1/2 -translate-y-1/2 text-[#332601ba] w-3 h-3 pointer-events-none" />
  </div>
</div>


                {/* MESSAGE */}
<div className="mb-6">
  <label className="block text-sm text-[#332601] mt-[20px] mb-1">
    Message
  </label>
  <textarea
  rows="4"
  placeholder="Type your message here..."
  className="w-[496px] bg-[#FDFBF9] mt-[5px] border border-[#463300ba] rounded-[10px] px-3 py-2.5 text-sm text-[#332601] focus:outline-none resize-none placeholder:font-karla placeholder:not-italic"
/>

</div>

{/* CAPTCHA */}
{/* CAPTCHA */}
<div className="text-center mb-6 mt-[15px]">
  <ReCAPTCHA
    sitekey="YOUR_SITE_KEY_HERE"
    onChange={(token) => {
      console.log("captcha value:", token);
      // you can store this token in state and send to backend
    }}
  />
</div>



                {/* AGREEMENT */}
                <p className="text-xs text-[#332601] mb-6 flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5" />
                  <span>
                    By clicking submit, you agree to our Privacy Notice and Terms
                    and Conditions.
                  </span>
                </p>

                {/* BUTTON */}
                <button
  style={{ color: "white" }}
  className="w-full h-[30px] bg-[#644A07] py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition"
>
  Submit
</button>


              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Contactpage;
