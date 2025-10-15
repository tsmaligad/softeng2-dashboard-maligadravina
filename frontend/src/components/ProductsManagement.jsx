import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8080";

export default function ProductsManagement() {
  const [tab, setTab] = useState("products"); // ← NEW: active tab
  const [products, setProducts] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [addons, setAddons] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    base_price: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchProducts();
    fetchFlavors();
    fetchAddons();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products-admin`);
      const data = await res.json();
      setProducts(data.items || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFlavors() {
    try {
      const res = await fetch(`${API_BASE}/api/flavors`);
      const data = await res.json();
      setFlavors(data.items || []);
    } catch (err) {
      console.error("Failed to load flavors:", err);
    }
  }

  async function fetchAddons() {
    try {
      const res = await fetch(`${API_BASE}/api/addons`);
      const data = await res.json();
      setAddons(data.items || []);
    } catch (err) {
      console.error("Failed to load addons:", err);
    }
  }

  /* ---------------- PRODUCT HANDLERS ---------------- */
  function handleInput(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setForm((f) => ({ ...f, image: imageUrl }));
    }
  }

  function resetForm() {
    setForm({ id: null, name: "", base_price: "", image: "" });
    setImageFile(null);
  }

  function viewProduct(p) {
    setSelectedProduct(p);
  }
  
  function editProduct(p) {
    setForm({
      id: p.id,
      name: p.name ?? "",
      sizes: p.sizes || [],
      flavors: p.flavors || [],
      addons: p.addons || [],
      base_price: String(p.base_price ?? ""),
      image: p.image || "",
    });
    // optional: close modal if coming from there
    setSelectedProduct(null);
    // jump to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.base_price) {
      alert("Please fill out required fields.");
      return;
    }

    try {
      setLoading(true);
      const url = form.id
        ? `${API_BASE}/api/products-admin/${form.id}`
        : `${API_BASE}/api/products-admin`;
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");

      let productId = form.id;
      if (!productId) {
        const data = await res.json();
        productId = data.id;
      }

      if (imageFile && productId) {
        const fd = new FormData();
        fd.append("image", imageFile);
        await fetch(`${API_BASE}/api/products/${productId}/image`, {
          method: "POST",
          body: fd,
        });
      }

      fetchProducts();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API_BASE}/api/products-admin/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  /* ---------------- FLAVORS HANDLERS ---------------- */
  async function handleAddFlavor(e) {
    e.preventDefault();
    const name = e.target.flavorName.value.trim();
    if (!name) return alert("Enter a flavor name");

    try {
      const res = await fetch(`${API_BASE}/api/flavors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return alert(data?.error || "Failed to add flavor");
      }
      e.target.reset();
      fetchFlavors();
    } catch (err) {
      console.error("POST /api/flavors error:", err);
      alert("Network/server error adding flavor");
    }
  }

  async function handleDeleteFlavor(id) {
    if (!window.confirm("Delete this flavor?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/flavors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return alert(data?.error || "Failed to delete flavor");
      }
      fetchFlavors();
    } catch (err) {
      console.error("DELETE /api/flavors/:id error:", err);
      alert("Network/server error deleting flavor");
    }
  }

  /* ---------------- ADD-ONS HANDLERS ---------------- */
  async function handleAddAddon(e) {
    e.preventDefault();
    const title = e.target.addonTitle.value.trim();
    const description = e.target.addonDescription.value.trim();
    if (!title) return alert("Enter an add-on title");

    try {
      const res = await fetch(`${API_BASE}/api/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return alert(data?.error || "Failed to add addon");
      }
      e.target.reset();
      fetchAddons();
    } catch (err) {
      console.error("POST /api/addons error:", err);
      alert("Network/server error adding add-on");
    }
  }

  async function handleDeleteAddon(id) {
    if (!window.confirm("Delete this add-on?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/addons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return alert(data?.error || "Failed to delete add-on");
      }
      fetchAddons();
    } catch (err) {
      console.error("DELETE /api/addons/:id error:", err);
      alert("Network/server error deleting add-on");
    }
  }

  /* ---------------- UI ---------------- */

  // Little helper for the tab buttons
  function TabButton({ id, label, className = "" }) {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className={[
          "px-4 py-2 rounded-full border transition",
          active
            ? "bg-[#FFC6C6] text-white border-[#332601] shadow"
            : "bg-white text-[#332601] border-[#332601] hover:bg-[#F5EFEF]",
          className,                 // ← merge external classes
        ].join(" ")}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }
  

  return (
    <div className="flex min-h-screen bg-[#F5EFEF]">
      <Sidebar />
      <main className="flex-1 p-6 ml-[30px] mr-[30px] mt-[30px]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Products Management</h1>

        {/* --- Top center tabs --- */}
        <div className="w-full flex justify-center mb-6 ">
          <div className="flex gap-12 p-2">
            <TabButton id="products" label="Product Management" className="ml-12"/>
            <TabButton id="flavors" label="Flavors" className="ml-12"/>
            <TabButton id="addons" label="Add-ons" className="ml-12"/>
          </div>
        </div>

        {/* --- PRODUCTS TAB --- */}
        {tab === "products" && (
          <>
            {/* PRODUCT FORM */}
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-md p-4 mb-6 flex flex-wrap items-center gap-4 rounded-md"
            >
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleInput}
                className="border px-3 py-2 w-[200px]"
              />
              <input
                type="text"
                name="base_price"
                placeholder="Base Price (₱)"
                value={form.base_price}
                onChange={handleInput}
                className="border px-3 py-2 w-[200px]"
              />

              <div className="flex flex-col items-start">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border px-2 py-1 text-sm w-[200px]"
                />
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-md mt-2 border"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#F5EFEF] border border-[#332601] text-[#332601] px-4 py-2 font-semibold"
              >
                {form.id ? "Update Product" : "Add Product"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Reset
              </button>
            </form>

            {/* PRODUCTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
  {products.length > 0 ? (
    products.map((p) => (
      <div
        key={p.id}
        className="bg-white shadow-md rounded-md overflow-hidden hover:shadow-lg transition"
      >
        <img
          src={p.image ? `${API_BASE}${p.image}` : "/placeholder.png"}
          alt={p.name}
          className="w-full h-40 md:h-44 object-cover"
        />
        <div className="p-3 text-center">
          <h2 className="font-semibold text-lg text-gray-800">{p.name}</h2>
          <p className="text-gray-600 text-sm mt-1">₱{p.base_price}.00</p>

          {/* ACTION BAR */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={() => viewProduct(p)}
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              View
            </button>
            <button
              onClick={() => editProduct(p)}
              className="px-3 py-1 rounded border border-[#332601] text-[#332601] hover:bg-[#F5EFEF]"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500 italic col-span-full">
      No products found.
    </p>
  )}
            </div>
          </>
        )}

        {/* --- FLAVORS TAB --- */}
        {tab === "flavors" && (
          <section className="bg-white shadow-md p-4 rounded-md">
            <h2 className="text-xl font-bold text-[#332601] mb-3">Manage Flavors</h2>

            <form onSubmit={handleAddFlavor} className="flex items-center gap-2 mb-4">
              <input
                name="flavorName"
                placeholder="New flavor name"
                className="border px-3 py-2 w-[220px]"
              />
              <button
                type="submit"
                className="bg-[#F5EFEF] border border-[#332601] text-[#332601] px-4 py-2 font-semibold"
              >
                Add
              </button>
            </form>

            <ul>
              {flavors.map((f) => (
                <li
                  key={f.id}
                  className="flex justify-between items-center border-b py-1 text-[#332601]"
                >
                  <span>{f.name}</span>
                  <button
                    onClick={() => handleDeleteFlavor(f.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
              {flavors.length === 0 && (
                <li className="text-sm text-gray-500 italic">No flavors yet.</li>
              )}
            </ul>
          </section>
        )}

        {/* --- ADD-ONS TAB --- */}
        {tab === "addons" && (
          <section className="bg-white shadow-md p-4 rounded-md">
            <h2 className="text-xl font-bold text-[#332601] mb-3">Manage Add-ons</h2>

            <form
              onSubmit={handleAddAddon}
              className="flex items-center gap-2 mb-4 flex-wrap"
            >
              <input
                name="addonTitle"
                placeholder="Add-on Title"
                className="border px-3 py-2 w-[220px]"
              />
              <input
                name="addonDescription"
                placeholder="Description (e.g. +Php 10 each)"
                className="border px-3 py-2 w-[260px]"
              />
              <button
                type="submit"
                className="bg-[#F5EFEF] border border-[#332601] text-[#332601] px-4 py-2 font-semibold"
              >
                Add
              </button>
            </form>

            <ul>
              {addons.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-center border-b py-1 text-[#332601]"
                >
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-gray-600">{a.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddon(a.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
              {addons.length === 0 && (
                <li className="text-sm text-gray-500 italic">No add-ons yet.</li>
              )}
            </ul>
          </section>
        )}

        {/* PRODUCT MODAL (kept the same) */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-md relative p-0">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setSelectedProduct(null)}
              >
                &times;
              </button>
              <img
                src={
                  selectedProduct.image
                    ? `${API_BASE}${selectedProduct.image}` // ← use API_BASE
                    : "/placeholder.png"
                }
                alt={selectedProduct.name}
                className="w-full h-28 md:h-32 object-cover rounded-t-xl"
              />
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {selectedProduct.name}
                </h2>
                <p className="text-gray-700 mb-2">₱{selectedProduct.base_price}.00</p>
                <div className="flex justify-center mt-4 gap-3">
                  <button
                    onClick={() => {
                      // ensure we copy only relevant fields to the form
                      setForm({
                        id: selectedProduct.id,
                        name: selectedProduct.name ?? "",
                        base_price: selectedProduct.base_price ?? "",
                        image: selectedProduct.image ? `${API_BASE}${selectedProduct.image}` : "",
                      });
                      setSelectedProduct(null);
                      setTab("products"); // jump back to product form
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
