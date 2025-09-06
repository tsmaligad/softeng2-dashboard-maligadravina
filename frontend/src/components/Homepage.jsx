import React from "react";
import Stickybar from "./Stickybar";
import hero from "../assets/homepagepic.png";
import fp1 from "../assets/fp1.png";
import fp2 from "../assets/fp2.png";

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
    img: fp1,
    alt: "Three tiered cake",
  },
  {
    id: "single-number-cupcake",
    name: "Single number cupcake",
    price: "From ₱25.00 PHP per cupcake",
    img: fp1,
    alt: "Single number cupcake",
  },
  {
    id: "single-number-cake",
    name: "Single number cake",
    price: "From ₱450.00 PHP",
    img: fp1,
    alt: "Single number cake",
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    price: "From ₱25.00 PHP",
    img: fp1,
    alt: "Assorted cupcakes",
  },
  {
    id: "artificial-flowers",
    name: "Customized with artificial flowers",
    price: "From ₱650.00 PHP",
    img: fp1,
    alt: "Cake with artificial flowers",
  },
  {
    id: "printed-toppers",
    name: "Customized with printed toppers",
    price: "From ₱600.00 PHP",
    img: fp1,
    alt: "Cake with printed toppers",
  },
];

const Homepage = () => {
  return (
    <div className="w-full min-h-screen bg-white">
      <Stickybar />

      {/* Hero */}
      <section id="home">
        <img
          src={hero}
          alt="Hero"
          className="w-full h-screen object-cover block"
        />
      </section>

      {/* Featured products title bar */}
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

      {/* Featured products grid */}
      <section className="bg-[#F5EFEF] py-10 px-6 md:px-16">
        <div className="grid grid-cols-4 gap-8">
          {featuredProducts.map((p) => (
            <article key={p.id}>
              <figure>
  <img
    src={p.img}
    alt={p.alt}
    className="w-full h-auto object-cover border-[3px] border-[#5B4220]"
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

        {/* View all */}
        <div className="mt-8 flex justify-center">
          <a
            href="#view-all"
            className="text-sm text-[#332601] underline-offset-2 hover:underline"
          >
            View all
          </a>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
