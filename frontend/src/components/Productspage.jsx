import React, { useEffect, useState } from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

const Productspage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

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

      <main className="flex justify-center bg-[#F5EFEF]">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          {/* Page Title */}
          <h1 className="font-kapakana text-5xl text-[#332601] mt-[100px] mb-4">
  Products
</h1>



          <hr className="border-t border-[#8b7760]" />

          {/* ✅ MATCHES FEATURED PRODUCTS EXACTLY */}
          <div className="grid grid-cols-4 gap-[30px] mt-[50px] mb-[90px]">
            {products.map((p) => (
              <article key={p.id} className="group">
                <figure
                  onClick={() => navigate(`/products-page/${p.id}`)}
                  className="cursor-pointer"
                >
                  {/* ✅ Same square frame, same border, same object-cover */}
                  <div className="aspect-square w-full overflow-hidden border-[3px] border-[#644A07]">
                    <img
                      src={
                        p.image_url
                          ? `http://localhost:8080${p.image_url}`
                          : "/placeholder.png"
                      }
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                  </div>

                  {/* ✅ Same text styling as Featured */}
                  <figcaption className="mt-3 text-left leading-tight">
                    <h3 className="text-[12px] text-[#665132] leading-tight">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-[15px] font-semibold text-[#332601]">
                      From ₱{Number(p.base_price ?? p.price ?? 0).toFixed(2)} PHP
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
