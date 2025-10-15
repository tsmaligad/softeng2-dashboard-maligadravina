// src/components/Cart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import bin from "../assets/bin.png";

const API = import.meta?.env?.VITE_API_BASE || "http://localhost:8080";
const LS_KEY = "cart"; // localStorage key for guest carts

function peso(n) {
  const v = Number(n || 0);
  return `₱${v.toFixed(2)} PHP`;
}

export default function Cart() {
    const navigate = useNavigate();
  /* ---------------- CART DATA (guest via localStorage) ---------------- */
  const [items, setItems] = useState([]); // [{ product_id, qty, unit_price, name?, image_url? }]

  // Load from localStorage, then hydrate each product with name/image if missing
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    let parsed = [];
    try {
      parsed = raw ? JSON.parse(raw) : [];
    } catch {
      parsed = [];
    }

    // If some entries are missing name/image/unit_price, fetch product details
    async function hydrate() {
      const filled = await Promise.all(
        parsed.map(async (it) => {
          const hasAll =
            it?.name && it?.image_url !== undefined && it?.unit_price !== undefined;
          if (hasAll) return it;

          try {
            const r = await fetch(`${API}/api/products/${it.product_id}`);
            if (!r.ok) throw new Error("product not found");
            const p = await r.json();
            return {
              ...it,
              name: p.name,
              unit_price: Number(p.price ?? p.base_price ?? it.unit_price ?? 0),
              image_url: p.image_url ? `${API}${p.image_url}` : null,
            };
          } catch {
            // fallback — keep what we had
            return it;
          }
        })
      );

      setItems(filled);
      localStorage.setItem(LS_KEY, JSON.stringify(filled));
    }

    hydrate();
  }, []);

  // helpers to persist
  function save(next) {
    setItems(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  function inc(product_id) {
    save(
      items.map((it) =>
        it.product_id === product_id ? { ...it, qty: Math.min((it.qty || 1) + 1, 999) } : it
      )
    );
  }

  function dec(product_id) {
    save(
      items
        .map((it) =>
          it.product_id === product_id ? { ...it, qty: Math.max((it.qty || 1) - 1, 1) } : it
        )
        .filter(Boolean)
    );
  }

  function removeItem(product_id) {
    save(items.filter((it) => it.product_id !== product_id));
  }

  const estimatedTotal = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.unit_price || 0) * Number(it.qty || 0), 0),
    [items]
  );

  /* ---------------- FEATURED (unchanged from your file) ---------------- */
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/products?pageSize=100`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data?.items) ? data.items : [];
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        setFeatured(shuffled.slice(0, 4));
      })
      .catch((err) => console.error("Failed to load featured products:", err));
  }, []);

  /* ---------------- RENDER ---------------- */
  return (
    <>
      <Stickybar />
      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px] mb-[70px]" />
      </div>

      <main className="flex items-start justify-center bg-[#F5EFEF]">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mb-4">
            Your Cart
          </h1>
          <hr className="border-t border-[#8b7760]" />

          {/* CART TABLE */}
          <div className="mt-6">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_180px_160px] items-center text-xs tracking-wide text-[#463300] opacity-70 px-2">
              <span>PRODUCT</span>
              <span className="text-center">QUANTITY</span>
              <span className="text-right">TOTAL</span>
            </div>

            <hr className="my-3 border-[#d7cbbb]" />

            {/* Items */}
            {items.length === 0 && (
              <p className="text-[#332601] italic mb-10">Your cart is currently empty.</p>
            )}

            {items.map((it) => {
              const rowTotal = Number(it.unit_price || 0) * Number(it.qty || 0);
              return (
                <div
                  key={it.product_id}
                  className="grid grid-cols-[1fr_180px_160px] gap-2 items-center py-5"
                >
                  {/* Product cell */}
                  <div className="flex items-center gap-4">
                    <div className="w-[96px] h-[96px] border-[3px] border-[#5B4220] overflow-hidden">
                      <img
                        src={it.image_url || "/placeholder.png"}
                        alt={it.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm text-[#332601]">{it.name || "Product"}</div>
                      <div className="text-xs text-[#4A3600] mt-1">
                        {peso(Number(it.unit_price || 0))}
                      </div>
                    </div>
                  </div>

                  {/* Quantity cell (matches screenshot) */}
<div className="flex items-center justify-center">
<div className="flex items-center justify-between w-[112px] h-[36px] border-2 border-[#5B4220] px-3">
<button
      type="button"
      onClick={() => dec(it.product_id)}
      className="w-1/3 text-center text-[#5B4220] text-[18px] leading-none focus:outline-none focus:ring-0"
      aria-label="Decrease quantity"
    >
      –
    </button>

    <span className="w-1/3 text-center text-[#463300] select-none">
      {it.qty || 1}
    </span>

    <button
      type="button"
      onClick={() => inc(it.product_id)}
      className="w-1/3 text-center text-[#5B4220] text-[18px] leading-none focus:outline-none focus:ring-0"
      aria-label="Increase quantity"
    >
      +
    </button>
  </div>

  {/* Remove icon to the right */}
  <button
    type="button"
    onClick={() => removeItem(it.product_id)}
    className="ml-3 inline-flex items-center justify-cente focus:outline-none focus:ring-0"
    title="Remove item"
    aria-label="Remove item"
  >
    <img src={bin} alt="" className="h-[18px] w-[18px]" />
  </button>
</div>


                  {/* Row total */}
                  <div className="text-right text-[#332601]">{peso(rowTotal)}</div>
                </div>
              );
            })}

            <hr className="my-6 border-[#d7cbbb]" />

            {/* Footer row: notes + summary */}
            <div className="grid grid-cols-[1fr_360px] gap-8">
              {/* Notes */}
              <div>
                <p className="text-sm text-[#332601] mb-[20px]">Order special instructions</p>
                <textarea
                  className="w-[390px] min-h-[90px] border border-[#5B4220] rounded-lg p-3 bg-white"
                  placeholder=""
                />
              </div>

              {/* Summary */}
              <div className="flex flex-col items-end">
                <div className="text-right mb-2">
                  <div className="text-sm text-[#332601] font-semibold">
                    Estimated total{" "}
                    <span className="ml-3">{peso(estimatedTotal)}</span>
                  </div>
                  <div className="text-[11px] text-[#776554]">
                    Taxes and shipping calculated at checkout
                  </div>
                </div>

                {/* Date & time */}
                <div className="w-full flex items-center justify-end gap-2 text-xs text-[#332601] mb-3">
                  <span>Select date and time:</span>
                  <input
                    type="date"
                    className="border border-[#5B4220] rounded px-2 py-1 bg-white"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                  />
                  <input
                    type="time"
                    className="border border-[#5B4220] rounded px-2 py-1 bg-white"
                    defaultValue={new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  />
                </div>

                {/* Checkout button */}
                <button
    type="button"
    className="mt-1 w-[220px] h-[36px] rounded-full bg-[#5B4220] text-white hover:opacity-90"
    onClick={() => navigate("/checkout")}
    disabled={items.length === 0}
  >
+    Check out
+  </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURED PRODUCTS (kept) */}
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
                    <img
                      src={p.image_url ? `${API}${p.image_url}` : "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="p-2 text-left leading-tight">
                    <h3 className="text-[13px] text-[#463300] font-light mb-[2px]">{p.name}</h3>
                    <p className="text-[15px] font-semibold text-[#4A3600]">
                      From {peso(Number(p.price ?? p.base_price ?? 0))}
                    </p>
                  </figcaption>
                </Link>
              </article>
            ))}
            {featured.length === 0 && (
              <p className="text-sm text-[#463300] opacity-70">No items to feature yet.</p>
            )}
          </div>

          <div className="flex justify-center mb-[120px]">
            <Link to="/products-page" className="text-[#463300] font-semibold hover:underline text-sm">
              View all
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
