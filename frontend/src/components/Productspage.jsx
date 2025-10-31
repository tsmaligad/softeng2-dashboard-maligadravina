import React, { useEffect, useState } from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom"; // ✅ add this

const Productspage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // ✅ initialize navigate

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.items || []))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  return (
    <>
      <Stickybar />
      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px]" />
      </div>
      <main className="flex items-start justify-center bg-[#F4E9E9]">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mb-4 mt-[100px]">
            Products
          </h1>
          <hr className="border-t border-[#8b7760]" />

          <div className="grid grid-cols-4 gap-8 mt-[40px] mb-[60px]">
            {products.map((p) => (
              <article key={p.id}>
                <figure
                  onClick={() => navigate(`/products-page/${p.id}`)} // ✅ navigate to detail
                  className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                >
                  <div className="mt-[30px] w-full h-48 md:h-56 overflow-hidden border-[3px] border-[#5B4220] rounded">
                  <img
  src={
    p.image_url
      ? `http://localhost:8080${p.image_url}`
      : "/placeholder.png"
  }
  alt={p.name}
  className="w-full h-full object-contain bg-[#FFF8F8]"
/>

                  </div>
                  <figcaption className="p-2 text-left leading-tight">
                    <h3 className="text-[13px] text-[#463300] font-light mb-[2px]">
                      {p.name}
                    </h3>
                    <p className="text-[15px] font-semibold text-[#4A3600]">
                      From ₱{Number(p.base_price).toFixed(2)} PHP
                    </p>
                  </figcaption>
                </figure>
              </article>
            ))}
          </div>

          <hr className="border-t border-[#8b7760] mb-[140px]" />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Productspage;
