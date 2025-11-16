// src/components/ProductDetail.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import { cartStore } from "../utils/cartStore";
import MAddedToCart from "./modals/MAddedToCart.jsx";


const API = "http://localhost:8080";

export default function ProductDetail() {
  const { id } = useParams();
  const [showAddedModal, setShowAddedModal] = useState(false);
  console.log("🧁 ProductDetail route param id =", id);

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
  const [gallery, setGallery] = useState([]);
const [activeImage, setActiveImage] = useState(null);


useEffect(() => {
  fetch(`${API}/api/products/${encodeURIComponent(id)}`)
    .then((r) => r.json())
    .then((data) => {
      // 🔹 Normalize options: if it's a JSON string, parse it
      let opts = null;
      if (typeof data.options === "string") {
        try {
          opts = JSON.parse(data.options);
        } catch (err) {
          console.error("Failed to parse product.options JSON:", err);
          opts = null;
        }
      } else if (data.options && typeof data.options === "object") {
        opts = data.options;
      }

      const productWithOptions = { ...data, options: opts };

      setProduct(productWithOptions);

      const s = opts?.sizes || data.sizes || [];
      const f = opts?.flavors || data.flavors || [];
      const a = opts?.addons || data.addons || [];

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
    if (!id) return;
  
    fetch(`${API}/api/products/${encodeURIComponent(id)}/gallery`)
      .then((r) => r.json())
      .then((data) => setGallery(data.items || []))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const src = product.image_url ? `${API}${product.image_url}` : "/placeholder.png";
    setActiveImage(src);
  }, [product]);
  
  

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
        // base shape + typography
        "min-w-[90px] px-3 py-1 text-xs",
        "text-center tracking-[0.02em]",
        "border-[2px]",
        "transition-colors",
  
        // colors
        active
          ? "bg-[#FFC6C6] text-[#4A3600] border-[#4A3600]" // selected = pink bg
          : "bg-[#F5EFEF] text-[#4A3600] border-[#4A3600] hover:bg-[#f9e3e3]", // normal = cream bg
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

// normalize boolean regardless if it comes from options, root, or as string/number
// normalize boolean regardless if it comes from options, root, or as string/number
function normalizeBool(raw, fallback) {
  if (raw === undefined || raw === null) return fallback;

  // direct boolean
  if (raw === true || raw === false) return raw;

  // string forms: "true", "false", "1", "0"
  if (typeof raw === "string") {
    const lower = raw.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    if (lower === "1") return true;
    if (lower === "0") return false;
  }

  // numeric forms: 1, 0
  if (typeof raw === "number") {
    if (raw === 1) return true;
    if (raw === 0) return false;
  }

  return Boolean(raw);
}

// ⭐ SUPER FORGIVING: check camelCase + snake_case, in options + root
const rawCakeFlag =
  product.options?.hasCakeDetails ??
  product.options?.has_cake_details ??
  product.hasCakeDetails ??
  product.has_cake_details;

const rawCupcakeFlag =
  product.options?.hasCupcakeDetails ??
  product.options?.has_cupcake_details ??
  product.hasCupcakeDetails ??
  product.has_cupcake_details;

const hasCakeDetails = normalizeBool(rawCakeFlag, true);
const hasCupcakeDetails = normalizeBool(rawCupcakeFlag, false);

console.log("PRODUCT DETAIL RAW:", product);
console.log("options on detail:", product.options);
console.log("RAW CAKE FLAG:", rawCakeFlag);
console.log("RAW CUPCAKE FLAG:", rawCupcakeFlag);
console.log("FINAL hasCakeDetails:", hasCakeDetails);
console.log("FINAL hasCupcakeDetails:", hasCupcakeDetails);



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

      setShowAddedModal(true);
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
        <div className="w-full max-w-[1200px] mx-auto px-4 grid gap-10 grid-cols-[520px_1fr]">

            {/* Left - Images */}
            <section>
  {/* BIG IMAGE */}
  <div className="w-[400px] h-[400px] border-[3px] border-[#5B4220] rounded overflow-hidden">
  <img
    src={activeImage || imageSrc}
    alt={product.name}
    className="w-full h-full object-cover"
  />
</div>


  {/* THUMBNAILS: use gallery; fallback to main image */}
  <div className="mt-4 w-[400px] flex flex-wrap justify-between gap-y-[10px]">

  {gallery.length > 0
    ? gallery.map((img) => (
        <button
          key={img.id}
          type="button"
          onClick={() => setActiveImage(`${API}/api/gallery/${img.id}`)}
          className="w-[190px] h-[190px] border-[3px] border-[#5B4220] rounded overflow-hidden p-0"
        >
          <img
            src={`${API}/api/gallery/${img.id}`}
            alt=""
            className="w-full h-full object-cover block"
          />
        </button>
      ))
    : [...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-[190px] h-[190px] border-[3px] border-[#5B4220] rounded overflow-hidden p-0"
        >
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-cover block"
          />
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
             {/* Quantity */}
<div className="mt-5">
  <p className="text-xs text-[#332601] mb-1">Quantity:</p>

  <div
    className="flex items-center justify-between w-[110px] rounded-md px-3 py-1 bg-[#F5EFEF]"
    style={{ border: "1px solid #4A3600" }} // 👈 forced brown border
  >
    {/* Minus */}
    <button
      type="button"
      onClick={() => setQty((q) => Math.max(1, q - 1))}
      className="text-base font-semibold leading-none hover:opacity-60 p-0 m-0"
      style={{
        color: "#4A3600",     // 👈 brown text
        background: "none",
        border: "none",
        outline: "none",
        boxShadow: "none",
      }}
    >
      –
    </button>

    <span className="text-[#332601] select-none text-sm font-medium">{qty}</span>

    {/* Plus */}
    <button
      type="button"
      onClick={() => setQty((q) => q + 1)}
      className="text-base font-semibold leading-none hover:opacity-60 p-0 m-0"
      style={{
        color: "#4A3600",     // 👈 brown text
        background: "none",
        border: "none",
        outline: "none",
        boxShadow: "none",
      }}
    >
      +
    </button>
  </div>
</div>




              {/* Cake Description & Image */}
{hasCakeDetails && (
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
)}


              {/* Cupcake Description & Image */}
{hasCupcakeDetails && (
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
)}


              {/* Add-ons */}
              {addons.length > 0 && (
  <div className="mt-5">
    <p className="text-xs text-[#332601] mb-2">Add-ons:</p>

    <div className="flex flex-wrap gap-3">
      {addons.map((a, i) => {
        const addonId = a?.id ?? `a-${i}`;
        const isActive = addonsSel.includes(addonId);

        return (
          <button
  key={addonId}
  type="button"
  onClick={() => toggleAddon(addonId)}
  className={[
    "w-[150px] px-2 py-[6px]",             // fixed width + compact height
    "border-[2px] rounded-sm",             // brown border
    "flex flex-col items-center justify-center text-center", 
    "text-[11px] leading-tight",           // compact multi-line text
    "transition-colors",

    isActive
      ? "bg-[#FFC6C6] text-[#4A3600] border-[#4A3600]"
      : "bg-[#F5EFEF] text-[#4A3600] border-[#4A3600] hover:bg-[#f9e3e3]",
  ].join(" ")}
>
  <span className="font-medium text-xs">
    {a?.title ?? a?.name ?? a}
  </span>

  {a?.price != null && (
    <span className="text-[10px] opacity-90">
      (+₱{Number(a.price).toFixed(0)})
    </span>
  )}

  {a?.description && (
    <span className="text-[10px] opacity-90">
      {a.description}
    </span>
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
  onClick={addToCart}
  className="
    mt-[20px] 
    w-full 
    bg-[#4A3600] 
    text-white 
    py-1
    rounded-full 
    text-sm 
    font-medium 
    shadow-sm 
    hover:opacity-90 
    transition
  "
>
  Add to cart
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

      <MAddedToCart
        isOpen={showAddedModal}
        onClose={() => setShowAddedModal(false)}
        productName={product?.name}
        qty={qty}
      />

      <Footer />
    </>
  );
}