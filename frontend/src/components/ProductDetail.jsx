// src/components/ProductDetail.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import { cartStore } from "../utils/cartStore";

const API = "http://localhost:8080";

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [addons, setAddons] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [size, setSize] = useState("");
  const [flavorTop, setFlavorTop] = useState("");
  const [flavorBottom, setFlavorBottom] = useState("");
  const [qty, setQty] = useState(1);
  const [cakeNotes, setCakeNotes] = useState("");
  const [cupcakeNotes, setCupcakeNotes] = useState("");
  const [dedication, setDedication] = useState("");
  const [addonsSel, setAddonsSel] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/products/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        const s = data.options?.sizes || data.sizes || [];
        const f = data.options?.flavors || data.flavors || [];
        const a = data.options?.addons || data.addons || [];
        setSizes(Array.isArray(s) ? s : []);
        setFlavors(Array.isArray(f) ? f : []);
        setAddons(Array.isArray(a) ? a : []);
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    fetch(`${API}/api/products?pageSize=24`)
      .then((r) => r.json())
      .then((data) => setRelated(data.items || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (sizes.length && !size) setSize(sizes[0]);
    if (flavors.length && !flavorTop) {
      setFlavorTop(flavors[0].name || flavors[0].title || flavors[0]);
    }
    if (flavors.length && !flavorBottom) {
      const second = flavors[1] || flavors[0];
      setFlavorBottom(second.name || second.title || second);
    }
  }, [sizes, flavors, size, flavorTop, flavorBottom]);

  const toggleAddon = (id) => {
    setAddonsSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const Chip = ({ active, children, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-[6px] rounded border text-sm transition",
        active
          ? "bg-[#FFC6C6] text-white border-[#332601]"
          : "bg-white text-[#332601] border-[#332601] hover:bg-[#F5EFEF]",
      ].join(" ")}
    >
      {children}
    </button>
  );

  const featured = useMemo(() => {
    const pool = related.filter((p) => String(p.id) !== String(id));
    return [...pool].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [related, id]);

  if (!product) return <p>Loading...</p>;

  const price = Number(product.price ?? product.base_price ?? 0);
  const imageSrc = product.image_url
    ? `${API}${product.image_url}`
    : "/placeholder.png";

  async function addToCart() {
    if (!product) return;

    const unitPrice = Number(product.price ?? product.base_price ?? 0);

    const notes = [
      size ? `Size: ${size}` : "",
      flavorTop ? `Top: ${flavorTop}` : "",
      flavorBottom ? `Bottom: ${flavorBottom}` : "",
      dedication ? `Dedication: ${dedication}` : "",
      cakeNotes ? `Cake notes: ${cakeNotes}` : "",
      cupcakeNotes ? `Cupcake notes: ${cupcakeNotes}` : "",
      addonsSel?.length ? `Add-ons: ${addonsSel.join(",")}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    // ✅ Use shared cartStore so key matches Cart.jsx (cart_guest / cart_email)
    await cartStore.add({
      product_id: product.id,
      qty: Number(qty || 1),
      unit_price: unitPrice,
      notes: notes || "",
    });

    alert("Added to cart!");
  }

  return (
    <>
      <Stickybar />

      {/* full background wrapper */}
      <div className="bg-[#F5EFEF] min-h-screen pt-[72px]">
        {/* top brown bar */}
        <section className="bg-[#4A3600] h-[90px] mb-[70px]" />

        {/* MAIN SECTION */}
        <main className="flex items-start justify-center">
          <div className="w-full max-w-[1200px] mx-auto px-4 grid gap-10 lg:grid-cols-[520px_1fr]">
            {/* Left - Images */}
            <section>
              <div className="rounded-2xl overflow-hidden border-[3px] border-[#5B4220]">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-[420px] object-cover"
                />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 overflow-hidden border-[3px] border-[#5B4220] rounded"
                  >
                    <img
                      src={imageSrc}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Right - Info */}
            <section>
              <h1 className="text-[26px] font-semibold text-[#332601]">
                {product.name}
              </h1>
              <p className="mt-2 text-[#4A3600] font-semibold">
                From ₱{price.toFixed(2)} PHP
              </p>

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-[#332601] mb-1">Size:</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <Chip
                        key={s}
                        active={size === s}
                        onClick={() => setSize(s)}
                      >
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavors */}
              {flavors.length > 0 && (
                <>
                  <div className="mt-5">
                    <p className="text-xs text-[#332601] mb-1">
                      Flavor for top layer:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {flavors.map((f, i) => {
                        const name = f.name || f.title || f;
                        return (
                          <Chip
                            key={`top-${i}`}
                            active={flavorTop === name}
                            onClick={() => setFlavorTop(name)}
                          >
                            {name}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-[#332601] mb-1">
                      Flavor for bottom layer:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {flavors.map((f, i) => {
                        const name = f.name || f.title || f;
                        return (
                          <Chip
                            key={`bot-${i}`}
                            active={flavorBottom === name}
                            onClick={() => setFlavorBottom(name)}
                          >
                            {name}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Quantity */}
              <div className="mt-5">
                <p className="text-xs text-[#332601] mb-1">Quantity:</p>
                <div className="flex items-center justify-between w-[120px] border border-[#5B4220] rounded-sm px-4 py-1.5 bg-transparent">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="text-[#5B4220] text-lg font-semibold leading-none hover:opacity-70"
                  >
                    –
                  </button>
                  <span className="text-[#332601] select-none text-sm font-medium">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="text-[#5B4220] text-lg font-semibold leading-none hover:opacity-70"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cake and Cupcake Notes */}
              <div className="mt-5">
                <p className="text-xs text-[#332601] mb-2">
                  Design Sample or Request for <b>Cake</b>:
                </p>
                <textarea
                  value={cakeNotes}
                  onChange={(e) => setCakeNotes(e.target.value)}
                  className="w-full h-28 border border-[#5B4220] rounded-lg p-2 bg-white"
                  placeholder="Paste link or describe your design request"
                />
              </div>

              <div className="mt-4">
                <p className="text-xs text-[#332601] mb-2">
                  Design Sample or Request for <b>Cupcakes</b>:
                </p>
                <textarea
                  value={cupcakeNotes}
                  onChange={(e) => setCupcakeNotes(e.target.value)}
                  className="w-full h-28 border border-[#5B4220] rounded-lg p-2 bg-white"
                  placeholder="Paste link or describe your design request"
                />
              </div>

              {/* Add-ons */}
              {addons.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-[#332601] mb-2">Add-ons:</p>
                  <div className="flex flex-wrap gap-3">
                    {addons.map((a, i) => {
                      const id = a.id || `a-${i}`;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleAddon(id)}
                          className={[
                            "rounded px-3 py-2 border text-sm text-left",
                            addonsSel.includes(id)
                              ? "bg-[#FFC6C6] text-white border-[#332601]"
                              : "bg-white text-[#332601] border-[#332601] hover:bg-[#F5EFEF]",
                          ].join(" ")}
                          title={a.description || ""}
                        >
                          <div className="font-medium">
                            {a.title || a.name || a}
                          </div>
                          {a.description && (
                            <div className="text-[11px] opacity-80">
                              {a.description}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dedication */}
              <div className="mt-5">
                <p className="text-xs text-[#332601] mb-1">Dedication Message:</p>
                <textarea
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  className="w-full border border-[#5B4220] rounded-lg p-2 bg-white"
                  placeholder="N/A if no dedication"
                />
              </div>

              {/* Add to Cart */}
              <button
                className="mt-6 bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600"
                onClick={addToCart}
              >
                Add to Cart
              </button>
            </section>
          </div>
        </main>

        {/* FEATURED PRODUCTS */}
        <section className="bg-[#4A3600] w-full mt-[80px]">
          <div className="h-[95px] flex items-center justify-center">
            <h2 className="m-0 text-lg font-semibold text-white">
              Featured products
            </h2>
          </div>
        </section>

        {/* RELATED */}
        <div className="flex items-start justify-center bg-[#F5EFEF]">
          <div className="w-full max-w-[1200px] mx-auto px-4">
            <div className="flex flex-wrap justify-between gap-6 mt-[40px] mb-[60px]">
              {featured.map((p) => (
                <article
                  key={p.id}
                  className="flex-1 min-w-[250px] max-w-[270px]"
                >
                  <Link
                    to={`/products-page/${p.id}`}
                    className="no-underline hover:no-underline"
                  >
                    <div className="w-full h-56 overflow-hidden border-[3px] border-[#5B4220] rounded">
                      <img
                        src={
                          p.image_url
                            ? `${API}${p.image_url}`
                            : "/placeholder.png"
                        }
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <figcaption className="p-2 text-left leading-tight">
                      <h3 className="text-[13px] text-[#463300] font-light mb-[2px]">
                        {p.name}
                      </h3>
                      <p className="text-[15px] font-semibold text-[#4A3600]">
                        From ₱
                        {Number(p.price ?? p.base_price ?? 0).toFixed(2)} PHP
                      </p>
                    </figcaption>
                  </Link>
                </article>
              ))}
            </div>

            <div className="flex justify-center mb-[120px]">
              <Link
                to="/products-page"
                className="text-[#463300] font-semibold hover:underline text-sm"
              >
                View all
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
