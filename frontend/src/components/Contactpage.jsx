import React, { useState, useRef } from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import email from "../assets/contactpage/envelope.png";
import loc from "../assets/contactpage/location.png";
import call from "../assets/contactpage/telephone.png";
import { FaChevronDown } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

const Contactpage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const RECAPTCHA_SITE_KEY = "6LdregwsAAAAABNDc6_Mz2878c4EsL2AY1Hnx4ox";


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Please complete the CAPTCHA first.");
      return;
    }

    try {
      setSubmitting(true);

      // 🔐 OPTIONAL: if backend /verify-captcha is set up:
      /*
      const res = await fetch("http://localhost:8080/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      const data = await res.json();
      if (!data.success) {
        alert("Captcha failed. Please try again.");
        return;
      }
      */

      // For now, just pretend it worked:
      alert("Form submitted! (CAPTCHA token is valid on client side)");

      // reset captcha + form stuff if you want
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong submitting the form.");
    } finally {
      setSubmitting(false);
    }
  };


  
  return (
    <>
      <Stickybar />
      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px]" />
      </div>

      {/* Background */}
      <main className="flex justify-center bg-[#F5EFEF]">
        <div className="w-full max-w-[1200px] mt-[70px] mx-auto px-4 pb-16">
          {/* HEADER */}
          <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mb-4">
            Contact Us
          </h1>

          {/* SIDE BY SIDE */}
          <div className="flex flex-row gap-10 items-start justify-between">
            {/* LEFT SIDE (unchanged sizes) */}
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
                    className="w-[20px] h-[20px] mt-[1px] mr-[10px]"
                  />
                  <p>carlaroseagangamido@gmail.com</p>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src={call}
                    alt="Phone Icon"
                    className="w-[20px] h-[20px] mt-[1px] mr-[10px]"
                  />
                  <p>Mobile: +63 926 112 9632</p>
                </div>
              </div>

              {/* divider matches map width */}
              <div className="w-[490px] h-[2px] bg-[#8b7760] mt-[10px] mb-8" />

              {/* MAP BOX (unchanged size) */}
              <div className="mb-[130px] mt-[50px] w-[490px] h-[280px] bg-white rounded-[20px] overflow-hidden shadow-md">
                <iframe
                  title="Sweet Treats Davao Map"
                  src="https://www.google.com/maps?q=Catalunan%20Peque%C3%B1o%20Davao%20City&output=embed"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* RIGHT SIDE (match mock: 2-in-a-row where needed) */}
            <div className="flex-1 flex justify-end mt-16 md:mt-24">
              {/* ⭐ REAL FORM STARTS HERE */}
              <form
                onSubmit={handleSubmit}
                className="bg-[#F9F6F6] rounded-[12px] shadow-md w-full max-w-[520px] border border-[#F2E3D8] px-7 md:px-8 py-9 md:py-10"
              >
                <div className="flex flex-col gap-6 max-w-[500px] mx-auto">

                  {/* NAME ROW */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-1.5 block">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your first name"
                        className="w-full h-10 bg-[#FDFBF9] border border-[#D7C9B9] rounded-[10px] px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-1.5 block">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your last name"
                        className="w-full h-10 bg-[#FDFBF9] border border-[#D7C9B9] rounded-[10px] px-3 text-sm"
                      />
                    </div>
                  </div>

                  {/* CONTACT ROW */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-1.5 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your mail address"
                        className="w-full h-10 bg-[#FDFBF9] border border-[#D7C9B9] rounded-[10px] px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-1.5 block">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        placeholder="+63"
                        className="w-full h-10 bg-[#FDFBF9] border border-[#D7C9B9] rounded-[10px] px-3 text-sm"
                      />
                    </div>
                  </div>

                  {/* INQUIRY TYPE */}
                  <div>
                    <label className="text-[13px] text-[#6B5B45] mb-1.5 block">
                      Inquiry Type
                    </label>
                    <div className="relative">
                      <select
                        defaultValue=""
                        className="w-full h-10 bg-[#FDFBF9] border border-[#D7C9B9] rounded-[10px] px-3 pr-8 text-sm appearance-none"
                      >
                        <option value="" disabled>
                          Select type of inquiry
                        </option>
                        <option>Order Concern</option>
                        <option>Product Inquiry</option>
                        <option>Partnership</option>
                        <option>Others</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A56] w-3 h-3" />
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label className="text-[13px] text-[#6B5B45] mb-1.5 block">
                      Message
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Type your message here..."
                      className="w-full bg-[#FDFBF9] border border-[#D7C9B9] rounded-[10px] px-3 py-3 text-sm resize-none"
                    ></textarea>
                  </div>

                  {/* CAPTCHA */}
                  {/* CAPTCHA (left-aligned) */}
{/* CAPTCHA (left-aligned) */}
<div className="flex justify-start">
  <ReCAPTCHA
    ref={captchaRef}
    sitekey={RECAPTCHA_SITE_KEY}
    onChange={(token) => {
      console.log("captcha value:", token);
      setCaptchaToken(token);        // ⭐ VERY IMPORTANT
    }}
    onExpired={() => {
      setCaptchaToken(null);         // optional, but nice
    }}
  />
</div>



                  {/* AGREEMENT */}
                  <label className="text-[12px] text-[#6B5B45] flex gap-2">
                    <input type="checkbox" className="accent-[#644A07]" />
                    <span>
                      By clicking submit, you agree to our Privacy Notice and
                      Terms and Conditions.
                    </span>
                  </label>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={submitting || !captchaToken}
                    className="w-full h-11 rounded-full bg-[#644A07] text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Contactpage;
