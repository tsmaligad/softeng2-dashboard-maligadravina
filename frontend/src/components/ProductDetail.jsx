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
  const [flavor, setFlavor] = useState(""); // SINGLE flavor (string)
  const [qty, setQty] = useState(1);
  const [cakeDesc, setCakeDesc] = useState(""); // text description
  const [cakeImage, setCakeImage] = useState(null); // File
  const [cupcakeDesc, setCupcakeDesc] = useState("");
  const [cupcakeImage, setCupcakeImage] = useState(null);
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
    // default size/flavor when lists load
    if (sizes.length && !size) setSize(sizes[0]);
    if (flavors.length && !flavor) {
      const candidate = flavors[0];
      const name = candidate?.name || candidate?.title || candidate || "";
      setFlavor(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, flavors]);

  const toggleAddon = (addonId) => {
    setAddonsSel((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
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
  const imageSrc = product.image_url ? `${API}${product.image_url}` : "/placeholder.png";

  // helper: convert File -> data URL (base64)
  function fileToDataUrl(file) {
    if (!file) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      } catch (err) {
        reject(err);
      }
    });
  }

  // helper: map selected addon ids to full addon object (try to be forgiving)
  function mapSelectedAddons(selIds = []) {
    const mapped = selIds.map((sid) => {
      // find in addons by id, name, title or fallback to raw id
      const found = addons.find(
        (a, i) =>
          String(a?.id) === String(sid) ||
          String(a?.name) === String(sid) ||
          String(a?.title) === String(sid) ||
          String(`a-${i}`) === String(sid)
      );
      if (found) {
        return {
          id: found.id ?? found.name ?? found.title ?? sid,
          title: found.title ?? found.name ?? found,
          description: found.description ?? null,
          price: Number(found.price ?? found.amount ?? 0) || 0,
        };
      }
      // fallback: plain id string
      return {
        id: sid,
        title: String(sid),
        description: null,
        price: 0,
      };
    });
    return mapped;
  }

  async function addToCart() {
    if (!product) return;

    try {
      const unitPrice = Number(product.price ?? product.base_price ?? 0);

      // Convert images to base64 so they can be stored/sent
      const cakeImageData = await fileToDataUrl(cakeImage);
      const cupcakeImageData = await fileToDataUrl(cupcakeImage);

      const selectedAddons = mapSelectedAddons(addonsSel);

      // compute addons total (per item)
      const addonsTotalPerUnit = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

      const total_price = (unitPrice + addonsTotalPerUnit) * Number(qty || 1);

      // Build notes string for backwards compatibility / quick view
      const notes = [
        size ? `Size: ${size}` : "",
        flavor ? `Flavor: ${flavor}` : "",
        dedication ? `Dedication: ${dedication}` : "",
        cakeDesc ? `Cake description: ${cakeDesc}` : "",
        cakeImage ? `Cake image attached` : "",
        cupcakeDesc ? `Cupcake description: ${cupcakeDesc}` : "",
        cupcakeImage ? `Cupcake image attached` : "",
        selectedAddons.length ? `Add-ons: ${selectedAddons.map((a) => a.title).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      // Structured cart item - this is what will be stored
      const cartItem = {
        product_id: product.id,
        product_name: product.name,
        qty: Number(qty || 1),
        unit_price: unitPrice,
        addons: selectedAddons, // array of objects {id, title, description, price}
        size: size || null,
        flavor: flavor || null,
        dedication: dedication || null,
        cakeDesc: cakeDesc || null,
        cakeImage: cakeImageData || null, // base64 or null
        cupcakeDesc: cupcakeDesc || null,
        cupcakeImage: cupcakeImageData || null,
        notes: notes || "",
        total_price: Number(total_price) || 0,
        // timestamp for reference
        added_at: new Date().toISOString(),
      };

      await cartStore.add(cartItem);

      alert("Added to cart!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Failed to add to cart. See console for details.");
    }
  }

  return (
    <>
      <Stickybar />

      <div className="bg-[#F5EFEF] min-h-screen pt-[72px]">
        <section className="bg-[#4A3600] h-[90px] mb-[70px]" />

        <main className="flex items-start justify-center">
          <div className="w-full max-w-[1200px] mx-auto px-4 grid gap-10 lg:grid-cols-[520px_1fr]">
            {/* Left - Images */}
            <section>
              <div className="rounded-2xl overflow-hidden border-[3px] border-[#5B4220]">
                <img src={imageSrc} alt={product.name} className="w-full h-[420px] object-cover" />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 overflow-hidden border-[3px] border-[#5B4220] rounded">
                    <img src={imageSrc} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>

            {/* Right - Info */}
            <section>
              <h1 className="text-[26px] font-semibold text-[#332601]">{product.name}</h1>
              <p className="mt-2 text-[#4A3600] font-semibold">From ₱{price.toFixed(2)} PHP</p>

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-[#332601] mb-1">Size:</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <Chip key={s} active={size === s} onClick={() => setSize(s)}>
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Flavor */}
              {flavors.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-[#332601] mb-1">Flavor:</p>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map((f, i) => {
                      const name = f?.name || f?.title || f;
                      return (
                        <Chip key={`flavor-${i}`} active={flavor === name} onClick={() => setFlavor(name)}>
                          {name}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-5">
                <p className="text-xs text-[#332601] mb-1">Quantity:</p>
                <div className="flex items-center justify-between w-[120px] border border-[#5B4220] rounded-sm px-4 py-1.5 bg-transparent">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-[#5B4220] text-lg font-semibold leading-none hover:opacity-70">–</button>
                  <span className="text-[#332601] select-none text-sm font-medium">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => q + 1)} className="text-[#5B4220] text-lg font-semibold leading-none hover:opacity-70">+</button>
                </div>
              </div>

              {/* Cake Description & Image */}
              <div className="mt-5">
                <p className="text-xs text-[#332601] mb-2">Cake Description:</p>
                <textarea
                  value={cakeDesc}
                  onChange={(e) => setCakeDesc(e.target.value)}
                  className="w-full h-28 border border-[#5B4220] rounded-lg p-2 bg-white mb-2"
                  placeholder="Describe your cake request"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCakeImage(e.target.files[0])}
                  className="border border-[#5B4220] rounded-lg p-1 w-full"
                />
              </div>

              {/* Cupcake Description & Image */}
              <div className="mt-4">
                <p className="text-xs text-[#332601] mb-2">Cupcake Description:</p>
                <textarea
                  value={cupcakeDesc}
                  onChange={(e) => setCupcakeDesc(e.target.value)}
                  className="w-full h-28 border border-[#5B4220] rounded-lg p-2 bg-white mb-2"
                  placeholder="Describe your cupcake request"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCupcakeImage(e.target.files[0])}
                  className="border border-[#5B4220] rounded-lg p-1 w-full"
                />
              </div>

              {/* Add-ons */}
              {addons.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-[#332601] mb-2">Add-ons:</p>
                  <div className="flex flex-wrap gap-3">
                    {addons.map((a, i) => {
                      const addonId = a?.id ?? `a-${i}`;
                      return (
                        <button
                          key={addonId}
                          type="button"
                          onClick={() => toggleAddon(addonId)}
                          className={[
                            "rounded px-3 py-2 border text-sm text-left",
                            addonsSel.includes(addonId)
                              ? "bg-[#FFC6C6] text-white border-[#332601]"
                              : "bg-white text-[#332601] border-[#332601] hover:bg-[#F5EFEF]",
                          ].join(" ")}
                          title={a?.description || ""}
                        >
                          <div className="font-medium">{a?.title ?? a?.name ?? a}</div>
                          {a?.description && <div className="text-[11px] opacity-80">{a.description}</div>}
                          {a?.price != null && <div className="text-[11px] opacity-80">+ ₱{Number(a.price).toFixed(2)}</div>}
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
              <button className="mt-6 bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600" onClick={addToCart}>
                Add to Cart
              </button>
            </section>
          </div>
        </main>

        {/* Featured & Related Products */}
        <section className="bg-[#4A3600] w-full mt-[80px]">
          <div className="h-[95px] flex items-center justify-center">
            <h2 className="m-0 text-lg font-semibold text-white">Featured products</h2>
          </div>
        </section>

        <div className="flex items-start justify-center bg-[#F5EFEF]">
          <div className="w-full max-w-[1200px] mx-auto px-4">
            <div className="flex flex-wrap justify-between gap-6 mt-[40px] mb-[60px]">
              {featured.map((p) => (
                <article key={p.id} className="flex-1 min-w-[250px] max-w-[270px]">
                  <Link to={`/products-page/${p.id}`} className="no-underline hover:no-underline">
                    <div className="w-full h-56 overflow-hidden border-[3px] border-[#5B4220] rounded">
                      <img src={p.image_url ? `${API}${p.image_url}` : "/placeholder.png"} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <figcaption className="p-2 text-left leading-tight">
                      <h3 className="text-[13px] text-[#463300] font-light mb-[2px]">{p.name}</h3>
                      <p className="text-[15px] font-semibold text-[#4A3600]">From ₱{Number(p.price ?? p.base_price ?? 0).toFixed(2)} PHP</p>
                    </figcaption>
                  </Link>
                </article>
              ))}
            </div>
            <div className="flex justify-center mb-[120px]">
              <Link to="/products-page" className="text-[#463300] font-semibold hover:underline text-sm">
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