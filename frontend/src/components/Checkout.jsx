// src/components/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Stickybar from "./Stickybar";
import Footer from "./Footer";

const API = import.meta?.env?.VITE_API_BASE || "http://localhost:8080";
const LS_KEY = "cart";

function peso(n) {
  const v = Number(n || 0);
  return `₱${v.toFixed(2)} PHP`;
}

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [method, setMethod] = useState("delivery"); // <-- ADD THIS

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + Number(it.unit_price || 0) * Number(it.qty || 0), 0),
    [items]
  );
  const downpayment = subtotal / 2;

  return (
    <>
      <Stickybar />
      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px]" />
      </div>

      <main className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
          <section className="bg-[#F5EFEF]">
            <div className="mx-auto w-full max-w-[760px] px-6 py-12">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#332601]">Contact information</h2>
                <Link to="/login" className="text-sm text-[#332601] underline">Login</Link>
              </div>

              <input className="mt-4 w-full rounded border border-[#5B4220] bg-white px-3 py-2 outline-none focus:outline-none" placeholder="Email" />
              <input className="mt-3 w-full rounded border border-[#5B4220] bg-white px-3 py-2 outline-none focus:outline-none" placeholder="Phone number" />

              {/* Delivery */}
              <h3 className="mt-10 text-lg font-semibold text-[#332601]">Delivery</h3>

              <div className="mt-3 space-y-3">
                <label className="flex items-center gap-2 rounded border border-[#5B4220] bg-white px-3 py-2">
                  <input
                    type="radio"
                    name="method"
                    checked={method === "delivery"}
                    onChange={() => setMethod("delivery")}
                  />
                  <span className="text-[#332601]">Delivery</span>
                </label>
                <label className="flex items-center gap-2 rounded border border-[#5B4220] bg-white px-3 py-2">
                  <input
                    type="radio"
                    name="method"
                    checked={method === "pickup"}
                    onChange={() => setMethod("pickup")}
                  />
                  <span className="text-[#332601]">Pickup</span>
                </label>
              </div>

              {method === "delivery" ? (
                <>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="rounded border border-[#5B4220] bg-white px-3 py-2 outline-none" placeholder="First name" />
                    <input className="rounded border border-[#5B4220] bg-white px-3 py-2 outline-none" placeholder="Last name" />
                  </div>
                  <input className="mt-3 w-full rounded border border-[#5B4220] bg-white px-3 py-2 outline-none" placeholder="Address" />
                  <input className="mt-3 w-full rounded border border-[#5B4220] bg-white px-3 py-2 outline-none" placeholder="Apartment, suite, etc. (optional)" />
                  <input className="mt-3 w-full rounded border border-[#5B4220] bg-white px-3 py-2 outline-none" placeholder="Phone number" />
                </>
              ) : (
                <>
                  <input className="mt-3 w-full rounded border border-[#5B4220] bg-white px-3 py-2 outline-none" placeholder="Phone number" />
                  <div className="mt-3 w-full rounded border border-[#5B4220] bg-white p-3 text-[#332601] text-sm leading-relaxed">
                    <p><strong>Our Location:</strong> Km. 12, Purok 12, Catalunan Pequeño, Davao City, Davao del Sur</p>
                    <p className="mt-2"><strong>Our phone number:</strong> +63 926 112 9632</p>
                  </div>
                </>
              )}

              {/* Payment */}
              <h3 className="mt-10 text-lg font-semibold text-[#332601]">Payment</h3>
              <div className="mt-3 space-y-3">
                <label className="flex items-center gap-2 rounded border border-[#5B4220] bg-white px-3 py-2">
                  <input type="radio" name="pay" defaultChecked />
                  <span className="text-[#332601]">Physical cash</span>
                </label>
                <label className="flex items-center gap-2 rounded border border-[#5B4220] bg-white px-3 py-2">
                  <input type="radio" name="pay" />
                  <span className="text-[#332601]">GCash</span>
                </label>
              </div>

              <button
                type="button"
                className="mt-8 w-full rounded-full bg-[#F7B2B1] px-6 py-3 text-[#332601] hover:opacity-90"
                onClick={() => alert("Order submitted (demo)")}
              >
                Confirm
              </button>
            </div>
          </section>

          {/* RIGHT SUMMARY */}
          <aside className="bg-[#3D2E00] text-white">
            <div className="lg:sticky lg:top-[162px] px-8 py-10">
              <div className="space-y-6">
                {items.map((it) => {
                  const total = Number(it.unit_price || 0) * Number(it.qty || 0);
                  return (
                    <div key={it.product_id} className="flex items-center gap-4">
                      <div className="h-[56px] w-[56px] overflow-hidden rounded border border-[#8c754d] bg-white">
                        <img src={it.image_url || "/placeholder.png"} alt={it.name || "Product"} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{it.name}</div>
                        <div className="text-[11px] opacity-80">Quantity: {it.qty}</div>
                      </div>
                      <div className="text-sm whitespace-nowrap">{peso(total)}</div>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="text-sm opacity-80">Cart is empty.</div>}
              </div>

              <div className="my-6 h-px w-full bg-[#8c754d]/60" />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Subtotal</span>
                  <span>{peso(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Downpayment</span>
                  <span>{peso(downpayment)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
