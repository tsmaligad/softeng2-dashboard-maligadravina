import React from "react";
import Stickybar from "./Stickybar";
import { Link, useNavigate } from "react-router-dom";
import hero from "../assets/homepagepic.png";
import fp1 from "../assets/homepagepics/fp1.png";
import fp2 from "../assets/homepagepics/fp2.png";
import fp3 from "../assets/homepagepics/fp3.png";
import fp4 from "../assets/homepagepics/fp4.png";
import fp5 from "../assets/homepagepics/fp5.png";
import fp6 from "../assets/homepagepics/fp6.png";
import fp7 from "../assets/homepagepics/fp7.png";
import fp8 from "../assets/homepagepics/fp8.png";

import Footer from "./Footer";


const faqs = [
  {
    q: "How can I pay for my order?",
    a: "We accept GCash, major credit/debit cards, and bank transfer. For COD, please message support first to confirm availability in your area."
  },
  {
    q: "How much is the delivery fee?",
    a: "Delivery fees vary by location and courier rates. You’ll see the exact fee at checkout after entering your address."
  },
  {
    q: "Can I be the one to arrange for pickup?",
    a: "Yes. Choose “Pick up / Own courier” at checkout and include rider details in the notes. We’ll message you when your order is ready."
  },
  {
    q: "How do I track my order?",
    a: "Once shipped, you’ll receive a tracking link via email/SMS. You can also check status in your account under Orders."
  },
];

const featuredProducts = [
  {
    id: "bento",
    name: "Bento size cake",
    price: "From ₱200.00 PHP",
    img: fp1,
    alt: "Bento size cake",
  },
  {
    id: "regular",
    name: "Regular size cake",
    price: "From ₱400.00 PHP",
    img: fp2,
    alt: "Regular size cake",
  },
  {
    id: "three-tier",
    name: "3 tiered cake",
    price: "From ₱2200.00 PHP",
    img: fp3,
    alt: "Three tiered cake",
  },
  {
    id: "single-number-cupcake",
    name: "Single number cupcake",
    price: "From ₱25.00 PHP per cupcake",
    img: fp4,
    alt: "Single number cupcake",
  },
  {
    id: "single-number-cake",
    name: "Single number cake",
    price: "From ₱450.00 PHP",
    img: fp5,
    alt: "Single number cake",
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    price: "From ₱25.00 PHP",
    img: fp6,
    alt: "Assorted cupcakes",
  },
  {
    id: "artificial-flowers",
    name: "Customized with artificial flowers",
    price: "From ₱650.00 PHP",
    img: fp7,
    alt: "Cake with artificial flowers",
  },
  {
    id: "printed-toppers",
    name: "Customized with printed toppers",
    price: "From ₱600.00 PHP",
    img: fp8,
    alt: "Cake with printed toppers",
  },
];

const Homepage = () => {
  return (
    <div className="w-full min-h-screen bg-white">
      <Stickybar />
      <section id="home">
        <img
          src={hero}
          alt="Hero"
          className="w-full h-screen object-cover block"
        />
      </section>
      <section className="bg-[#4A3600]">
        <div className="h-[95px] flex items-center justify-center">
          <h2
            className="m-0 text-lg font-semibold text-white !text-white"
            style={{ color: "white" }}
          >
            Featured products
          </h2>
        </div>
      </section>
      <section className="bg-[#F5EFEF] py-10 px-6 md:px-16">
        <div className="grid grid-cols-4 gap-8">
          {featuredProducts.map((p) => (
            <article key={p.id}>
              <figure>
                <img
                  src={p.img}
                  alt={p.alt}
                  className="mt-[90px] w-full h-auto object-cover border-[3px] border-[#5B4220]"
                />
                <figcaption className="p-2 text-left">
                  <h3 className="text-sm text-[#332601]">{p.name}</h3>
                  <p className="text-sm font-semibold text-[#332601]">
                    {p.price}
                  </p>
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
        <div className="mt-[40px] mb-[90px] flex justify-center">
          

          <Link to ="/products-page" className="text-sm text-[#332601] underline-offset-2 hover:underline">
              View all
              </Link>


        </div>
        <section className="bg-[#4A3600]">
          <div className="h-[95px] flex items-center justify-center">
            <h2
              className="m-0 text-lg font-semibold text-white !text-white"
              style={{ color: "white" }}
            >
              Frequently Asked Questions
            </h2>

            
          </div>
        </section>
        <section className="bg-[#F5EFEF] pb-[90px]">
        <div className="mt-[80px] space-y-[20px] max-w-[860px] mx-auto px-4">
          {faqs.map((item, idx) => (
            <details
              key={idx}
              className={[
                "group bg-[#FBF3F3] border-b border-[#decdb9]",
                idx > 0 ? "mt-10" : ""
              ].join(" ")}
            >
              <summary
                className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none
                           flex items-center justify-between px-[20px] py-[30px] text-[#1f1a14]"
              >
                <span className="text-[18px] md:text-[20px] leading-7 font-medium">
                  {item.q}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="inline-block shrink-0 transition-transform duration-200 group-open:rotate-180 text-[#1f1a14]"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="px-[40px] mt-[-20px] mb-[20px] pb-6 text-[15px] md:text-[16px] text-[#332601]/90">
                {item.a}
              </div>
            </details>
            
          ))}
        </div>
        </section>
      </section>
      <Footer />
    </div>
  );
};

export default Homepage;
