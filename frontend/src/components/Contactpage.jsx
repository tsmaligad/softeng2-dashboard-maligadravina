import React, { useState, useRef, useEffect } from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import email from "../assets/contactpage/envelope.png";
import loc from "../assets/contactpage/location.png";
import call from "../assets/contactpage/telephone.png";
import { FaChevronDown } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { api } from "../utils/api";
import MContact from "./modals/MContact.jsx";



const API = "http://localhost:8080"; // ✅ backend base URL

const Contactpage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const RECAPTCHA_SITE_KEY = "6LdregwsAAAAABNDc6_Mz2878c4EsL2AY1Hnx4ox";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);


  // ✅ form state (same as your functional version)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);



  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await api.me(); // will return { success: false } if not logged in
  
        if (user && user.success) {
          const fullName = user.name || "";
          const parts = fullName.split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setEmailAddress(user.email || "");
        }
      } catch (err) {
        console.error("Failed to load /me:", err);
        // silently fail, form still works as empty
      }
    }
  
    fetchUserData();
  }, []);
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ required field checks
    if (!emailAddress.trim()) return alert("Email is required.");
    if (!inquiryType.trim()) return alert("Please select your inquiry type.");
    if (!message.trim()) return alert("Message is required.");
    if (!agreed) return alert("You must agree to the Privacy Notice first.");

    if (!captchaToken) {
      alert("Please complete the CAPTCHA first.");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ send to backend so admin can see it
      await fetch(`${API}/api/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: emailAddress,
          contact_number: contactNumber,
          inquiry_type: inquiryType,
          message: message,
        }),
      });

      setIsModalOpen(true);

      // reset captcha + inputs
      captchaRef.current?.reset();
      setCaptchaToken(null);

      setFirstName("");
      setLastName("");
      setEmailAddress("");
      setContactNumber("");
      setInquiryType("");
      setMessage("");
      setAgreed(false);
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
          {/* SIDE BY SIDE */}
          <div className="flex flex-row gap-10 justify-between">
            {/* LEFT SIDE (unchanged sizes) */}
            <div className="flex-1 max-w-[520px] text-[#332601]">
              {/* HEADER */}
              <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mb-4">
                Contact Us
              </h1>

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
              <div className="mt-[50px] w-[490px] h-[430px] bg-white rounded-[20px] overflow-hidden shadow-md mb-[200px]">
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
            <div className="flex-1 flex justify-end items-start">
              {/* FORM (CSS KEPT, LOGIC UPGRADED) */}
              <form
                onSubmit={handleSubmit}
                style={{ minHeight: "770px", paddingTop: "30px", paddingBottom: "48px" }}
                className="bg-[#F9F6F6] rounded-[16px] shadow-lg w-full max-w-[540px] border border-[#E8DED3] px-16 md:px-20 mb-[200px] flex flex-col justify-between"
              >
                <div className="flex flex-col gap-10 max-w-[500px] mx-auto w-full">
                  {/* NAME ROW */}
                  <div className="grid grid-cols-2 gap-3" style={{ marginBottom: "30px" }}>
                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-2 block font-medium">
                        First Name
                      </label>
                      <input
  type="text"
  placeholder="Enter your first name"
  className="w-full h-11 bg-white border-2 border-[#4A3600] rounded-[8px] px-4 text-sm text-[#332601] placeholder:text-[#A89583]"
  value={firstName}  // Set first name here
  onChange={(e) => setFirstName(e.target.value)}  // Allow user to edit
/>
                    </div>

                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-2 block font-medium">
                        Last Name
                      </label>
                      <input
  type="text"
  placeholder="Enter your last name"
  className="w-full h-11 bg-white border-2 border-[#4A3600] rounded-[8px] px-4 text-sm text-[#332601] placeholder:text-[#A89583]"
  value={lastName}  // Set last name here
  onChange={(e) => setLastName(e.target.value)}  // Allow user to edit
/>
                    </div>
                  </div>

                  {/* CONTACT ROW */}
                  <div className="grid grid-cols-2 gap-3" style={{ marginBottom: "30px" }}>
                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-2 block font-medium">
                        Email Address
                      </label>
                      <input
  type="email"
  placeholder="Enter your email address"
  className="w-full h-11 bg-white border-2 border-[#4A3600] rounded-[8px] px-4 text-sm text-[#332601] placeholder:text-[#A89583]"
  value={emailAddress}  // Set email address here
  onChange={(e) => setEmailAddress(e.target.value)}  // Allow user to edit
/>
                    </div>

                    <div>
                      <label className="text-[13px] text-[#6B5B45] mb-2 block font-medium">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        placeholder="+63"
                        className="w-full h-11 bg-white border-2 border-[#4A3600] rounded-[8px] px-4 text-sm text-[#332601] placeholder:text-[#A89583]"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* INQUIRY TYPE */}
                  <div style={{ marginBottom: "30px" }}>
                    <label className="text-[13px] text-[#6B5B45] mb-2 block font-medium">
                      Inquiry Type
                    </label>
                    <div className="relative">
                    <select
  defaultValue=""
  className="w-full h-11 bg-white border-2 border-[#4A3600] rounded-[8px] px-4 pr-10 text-sm appearance-none"
  value={inquiryType}
  onClick={() => setSelectOpen((prev) => !prev)}   // toggle arrow when you click
  onBlur={() => setSelectOpen(false)}              // arrow goes back when you leave
  onChange={(e) => {
    setInquiryType(e.target.value);                // set value
    setSelectOpen(false);                          // arrow down after choosing
  }}
>

  <option value="" disabled>
    Select type of inquiry
  </option>
  <option className="text-[#332601]">Order Concern</option>
  <option className="text-[#332601]">Product Inquiry</option>
  <option className="text-[#332601]">Partnership</option>
  <option className="text-[#332601]">Others</option>
</select>


                      <FaChevronDown
  className={`absolute right-[12px] top-1/2 -translate-y-1/2 text-[#7A6A56] w-3 h-3 pointer-events-none transition-transform duration-200 ${
    selectOpen ? "rotate-180" : "rotate-0"


  }`}
/>

                    </div>
                  </div>

                  {/* MESSAGE */}
                  <div style={{ marginBottom: "30px" }}>
                    <label className="text-[13px] text-[#6B5B45] mb-2 block font-medium">
                      Message
                    </label>
                    <textarea
                      rows="5"
                      placeholder="Type your message here..."
                      className="w-full bg-white border-2 border-[#4A3600] rounded-[8px] px-4 py-3 text-sm text-[#332601] placeholder:text-[#A89583] resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </div>

                  {/* CAPTCHA */}
                  <div className="flex justify-center" style={{ marginBottom: "30px" }}>
                    <ReCAPTCHA
                      ref={captchaRef}
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={(token) => {
                        console.log("captcha value:", token);
                        setCaptchaToken(token);
                      }}
                      onExpired={() => {
                        setCaptchaToken(null);
                      }}
                    />
                  </div>

                  {/* AGREEMENT */}
                  <label
                    className="text-[11px] text-[#6B5B45] flex gap-2 items-start"
                    style={{ marginBottom: "30px" }}
                  >
                    <input
                      type="checkbox"
                      className="accent-[#644A07] mt-0.5"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                      By clicking submit, you agree to our Privacy Notice and
                      Terms and Conditions.
                    </span>
                  </label>

                  {/* SUBMIT BUTTON */}
                  <button
  type="submit"
  disabled={
    submitting ||
    !captchaToken ||
    !emailAddress.trim() ||
    !inquiryType.trim() ||
    !message.trim() ||
    !agreed
  }
  className="w-full h-12 rounded-full bg-[#4A3600] hover:bg-[#4A3600] text-white text-[15px] font-semibold disabled:opacity-100 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
>
  {submitting ? "Sending..." : "Submit"}
</button>

                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <MContact
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />

      <Footer />
    </>
  );
};

export default Contactpage;
