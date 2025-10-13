import React, { useEffect, useState } from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import { Link } from "react-router-dom";

const Productspage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // fetch products from your Express backend
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
      <main className="flex items-start justify-center bg-[#F5EFEF]">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mb-4 mt-[100px]">
            Products
          </h1>
          <hr className="border-t border-[#8b7760]" />

          <div className="grid grid-cols-4 gap-8 mt-[40px] mb-[60px]">
            {products.map((p) => (
              <article key={p.id}>
              <Link to={`/products-page/${p.id}`}>
                <figure className="cursor-pointer hover:scale-[1.02] transition-transform duration-200">
                  <img
                    src={
                      p.image_url
                        ? `http://localhost:8080${p.image_url}`
                        : "/placeholder.png"
                    }
                    alt={p.name}
                    className="mt-[30px] w-full h-auto object-cover border-[3px] border-[#5B4220]"
                  />
                  <figcaption className="p-2 text-left">
                    <h3 className="text-sm text-[#332601]">{p.name}</h3>
                    <p className="text-sm font-semibold text-[#332601]">
                      ₱{Number(p.price).toFixed(2)}
                    </p>
                  </figcaption>
                </figure>
              </Link>
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
