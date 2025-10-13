import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Stickybar from "./Stickybar";
import Footer from "./Footer";

export default function ProductDetail() {
  const { id } = useParams(); // /products-page/:id route
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]); // to show featured/related items

  useEffect(() => {
    // fetch current product
    fetch(`http://localhost:8080/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    // fetch a few featured products
    fetch(`http://localhost:8080/api/products?pageSize=4`)
      .then((r) => r.json())
      .then((data) => setRelated(data.items || []))
      .catch(console.error);
  }, []);

  if (!product) return <p>Loading...</p>;

  return (
    <>
      <Stickybar />
      <div className="pt-[72px]">
            <section className="bg-[#4A3600] h-[90px] mb-[70px]" />
          </div>
          <main className="flex items-start justify-center">
          <div className="w-full max-w-[1200px] mx-auto px-4">
            
          <div>
            <img
              src={`http://localhost:8080${product.image_url}`}
              alt={product.name}
              className="rounded-2xl w-full border-[3px] border-[#5B4220]"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[#332601]">{product.name}</h1>
            <p className="text-lg mt-2 font-semibold text-[#4A3600]">
              From ₱{product.price.toFixed(2)}
            </p>
            <p className="mt-4 text-[#332601]">{product.description}</p>

            <div className="mt-5">
              <h3 className="font-semibold text-[#332601]">
                Flavor for top layer:
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {["Chocolate", "Mocha", "Pandan", "Ube", "Red Velvet"].map((f) => (
                  <button
                    key={f}
                    className="border border-[#5B4220] rounded px-3 py-1 hover:bg-pink-100"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="block mb-1 font-semibold text-[#332601]">
                Dedication Message:
              </label>
              <textarea
                className="w-full border border-[#5B4220] rounded-lg p-2"
                placeholder="N/A if no dedication"
              ></textarea>
            </div>

            <button className="mt-6 bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600">
              Add to Cart
            </button>
          </div>
        </div>
      </main>

      {/* 🟤 Featured Products Section */}
      <section className="bg-[#4A3600] w-full mt-[80px]">
        <div className="h-[95px] flex items-center justify-center">
          <h2
            className="m-0 text-lg font-semibold text-white !text-white"
            style={{ color: "white" }}
          >
            Featured products
          </h2>
        </div>
        </section>

        {/* 🧁 Grid of featured products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-[40px] mb-[80px] px-6 max-w-[1000px]">
          {related.map((p) => (
            <div key={p.id} className="text-center">
              <img
                src={`http://localhost:8080${p.image_url}`}
                alt={p.name}
                className="w-full h-auto object-cover border-[2px] border-[#5B4220]"
              />
              <p className="mt-2 text-sm text-[#332601]">{p.name}</p>
              <p className="text-sm font-semibold text-[#332601]">
                From ₱{Number(p.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

      <Footer />
    </>
  );
}
