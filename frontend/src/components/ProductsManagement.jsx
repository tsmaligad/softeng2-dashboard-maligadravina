import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Sortable from "sortablejs";


import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

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
    flavors: [], // will hold full flavor objects
    addons: [], // will hold full addon objects
  });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [gallery, setGallery] = useState([]);


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

  async function fetchGallery(productId) {
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}/gallery`);
      const data = await res.json();
      setGallery(data.items || []);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  }

  useEffect(() => {
    if (gallery.length === 0) return;
  
    const el = document.getElementById("gallery-sortable");
    if (!el) return;
  
    Sortable.create(el, {
      animation: 150,
      ghostClass: "opacity-50",
      onEnd: async (evt) => {
        // Recalculate new order
        const updatedOrder = [...el.children].map((child, index) => ({
          id: Number(child.dataset.id),
          sort_order: index,
        }));
  
        // Send new order to backend
        await fetch(`${API_BASE}/api/products/${form.id}/gallery/sort`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: updatedOrder }),
        });
  
        // Refresh
        fetchGallery(form.id);
      },
    });
  }, [gallery]);

  

  

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
    setForm({ id: null, name: "", base_price: "", image: "", flavors: [], addons: [] });
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
      flavors: Array.isArray(p.flavors) ? p.flavors : [],
      addons: Array.isArray(p.addons) ? p.addons : [],
      base_price: String(p.base_price ?? ""),
      image: p.image ? `${API_BASE}${p.image}` : "",
    });
  
    fetchGallery(p.id);  // ⭐ LOAD GALLERY IMAGES
  
    setSelectedProduct(null);
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

      // send form as JSON; flavors/addons are full objects as required
      const payload = {
        name: form.name,
        base_price: Number(form.base_price),
        image: form.image, // could be a URL or path; your backend handles image upload separately below
        sizes: form.sizes || [],
        flavors: form.flavors || [],
        addons: form.addons || [],
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

      // 📌 Upload gallery images
if (galleryFiles.length > 0 && productId) {
  const galleryForm = new FormData();
  galleryFiles.forEach(file => {
    galleryForm.append("gallery", file);
  });

  await fetch(`${API_BASE}/api/products/${productId}/gallery`, {
    method: "POST",
    body: galleryForm,
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

  /* ---------------- CHIP TOGGLE HELPERS ---------------- */

  // Check if a flavor object (by id) is currently selected in form.flavors
  function isFlavorSelected(flavor) {
    return form.flavors.some((f) => Number(f.id) === Number(flavor.id));
  }

  // Toggle flavor: add/remove the full object
  function toggleFlavor(flavor) {
    setForm((f) => {
      const exists = (f.flavors || []).some((x) => Number(x.id) === Number(flavor.id));
      const newFlavors = exists
        ? f.flavors.filter((x) => Number(x.id) !== Number(flavor.id))
        : [...(f.flavors || []), flavor];
      return { ...f, flavors: newFlavors };
    });
  }

  function isAddonSelected(addon) {
    return form.addons.some((a) => Number(a.id) === Number(addon.id));
  }

  function toggleAddon(addon) {
    setForm((f) => {
      const exists = (f.addons || []).some((x) => Number(x.id) === Number(addon.id));
      const newAddons = exists
        ? f.addons.filter((x) => Number(x.id) !== Number(addon.id))
        : [...(f.addons || []), addon];
      return { ...f, addons: newAddons };
    });
  }

  /* ---------------- UI ---------------- */


  return (
    <div className="flex min-h-screen bg-[#F5EFEF]">

      <Sidebar />
      <main className="mb-[50px] flex-1 p-6 ml-[30px] mr-[30px] mt-[30px] ">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Products Management</h1>

        <hr className="border-t border-[#8b7760]" />

        {/* --- Top center tabs --- */}
        {/* --- Top center tabs (MUI, same style as status tabs) --- */}
<div className="mt-4 mb-[30px]">
  <Box
    sx={{
      width: "100%",
      bgcolor: "#FFFFFF",          // white background
      borderRadius: 2,
      px: 1,
      border: "1px solid #EADBD8", // soft outline (same as AdminContact/EditPages)
    }}
  >
    <Tabs
      value={tab} // ← bind to your state: "products" | "flavors" | "addons"
      onChange={(_event, newValue) => setTab(newValue)}
      variant="scrollable"
      scrollButtons
      allowScrollButtonsMobile
      aria-label="products management tabs"
      TabIndicatorProps={{
        style: {
          backgroundColor: "#4A3600", // brown underline
          height: 3,
          borderRadius: 9999,
        },
      }}
      sx={{
        "& .MuiTab-root": {
          textTransform: "none",
          fontSize: 14,
          paddingInline: "24px",
          paddingBlock: "10px",
          minHeight: 48,
          color: "#6B5B45",   // muted brown
          fontWeight: 500,
        },
        "& .MuiTab-root.Mui-selected": {
          color: "#4A3600",   // deeper brown when active
          fontWeight: 600,
        },
        "& .MuiTabs-scrollButtons": {
          color: "#4A3600",
        },
      }}
    >
      <Tab value="products" label="Product Management" />
      <Tab value="flavors" label="Flavors" />
      <Tab value="addons" label="Add-ons" />
    </Tabs>
  </Box>
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
                className="border px-3 py-2 w-[200px] mr-[8px] "
              />
              <input
                type="text"
                name="base_price"
                placeholder="Base Price (₱)"
                value={form.base_price}
                onChange={handleInput}
                className="border px-3 py-2 w-[200px] mr-[8px]"
              />

              <div className="flex flex-col items-start">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border px-2 py-1 text-sm w-[200px] mr-[8px]"
                />
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-md mt-2 border mr-[8px]"
                  />
                )}
              </div>


              {/* GALLERY IMAGES UPLOAD (multiple) */}
<div className="flex flex-col items-start mt-2 w-full">
  <label className="text-sm font-semibold text-[#332601] mb-1">
    Gallery Images (multiple allowed)
  </label>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }}
    
    className="border px-2 py-1 text-sm w-[250px]"
  />
</div>

{/* EXISTING GALLERY PREVIEW */}
{gallery.length > 0 && (
  <div className="w-full mt-3">
    <h3 className="text-sm font-semibold text-[#332601] mb-2">
      Existing Gallery Images
    </h3>

    <div id="gallery-sortable" className="flex flex-wrap gap-3">

      {gallery.map(img => (
        <div key={img.id} data-id={img.id} className="relative">

          <img
            src={`${API_BASE}/api/gallery/${img.id}`}
            className="w-20 h-20 object-cover rounded border"
          />

          <button
            className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 rounded"
            onClick={() => handleDeleteGallery(img.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}

{/* PREVIEW NEW GALLERY IMAGES */}
{galleryFiles.length > 0 && (
  <div className="w-full mt-3">
    <h3 className="text-sm font-semibold text-[#332601] mb-2">
      New Images To Upload
    </h3>

    <div className="flex flex-wrap gap-3">
      {galleryFiles.map((file, index) => (
        <div key={index} className="relative w-20 h-20">
          
          <img
            src={URL.createObjectURL(file)}
            className="w-20 h-20 object-cover rounded border"
          />

          {/* DELETE BUTTON */}
          <button
            type="button"
            className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 rounded"
            onClick={() =>
              setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
            }
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}






              {/* ------------------ CHIP SECTIONS (Flavors + Add-ons) ------------------ */}
              <div className="w-full mt-2">
                {/* Flavors chips */}
                <div className="mb-2">
                  <div className="text-sm font-semibold text-[#332601] mb-2">Flavors</div>
                  <div className="flex flex-wrap gap-2">
                    {flavors.length > 0 ? (
                      flavors.map((flv) => {
                        const active = isFlavorSelected(flv);
                        return (
                          <button
                            key={flv.id}
                            type="button"
                            onClick={() => toggleFlavor(flv)}
                            className={[
                              "px-3 py-1 rounded-full text-sm border transition-select inline-flex items-center",
                              active
                                ? "bg-[#FFC6C6] text-white border-[#332601]"
                                : "bg-white text-[#332601] border-[#cfcfcf] hover:bg-[#F5EFEF]",
                            ].join(" ")}
                          >
                            {flv.name}
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 italic">No flavors available.</div>
                    )}
                  </div>
                </div>

                {/* Add-ons chips */}
                <div>
                  <div className="text-sm font-semibold text-[#332601] mb-2">Add-ons</div>
                  <div className="flex flex-wrap gap-2">
                    {addons.length > 0 ? (
                      addons.map((ad) => {
                        const active = isAddonSelected(ad);
                        return (
                          <button
                            key={ad.id}
                            type="button"
                            onClick={() => toggleAddon(ad)}
                            className={[
                              "px-3 py-1 rounded-full text-sm border transition-select inline-flex items-center",
                              active
                                ? "bg-[#FFC6C6] text-white border-[#332601]"
                                : "bg-white text-[#332601] border-[#cfcfcf] hover:bg-[#F5EFEF]",
                            ].join(" ")}
                          >
                            {ad.title}
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 italic">No add-ons available.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex gap-2 mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#F5EFEF] border border-[#332601] text-[#332601] px-4 py-2 font-semibold mr-[5px]"
                >
                  {form.id ? "Update Product" : "Add Product"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 px-4 py-2 rounded mr-[5px]"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* PRODUCTS GRID — now 4 per row, no white bg or borders */}
            <style>{`
  .admin-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 2rem;
    max-width: 1300px;
    margin: 2rem auto 0;
  }
  @media (min-width: 640px) {
    .admin-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (min-width: 1024px) {
    .admin-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } /* ← 4 across */
  }

  .admin-card {
    background: transparent;
    border: none;
    box-shadow: none;
    text-align: left;
  }

  .admin-thumb {
    width: 100%;
    aspect-ratio: 1 / 1; /* perfect square, adjusts automatically */
    overflow: hidden;
    border-radius: 4px;
  }

  .admin-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
`}</style>

            <div className="admin-grid">
              {products.length > 0 ? (
                products.map((p) => (
                  <div key={p.id} className="admin-card">
                    <div className="admin-thumb">
                      <img
                        src={p.image ? `${API_BASE}${p.image}` : "/placeholder.png"}
                        alt={p.name}
                      />
                    </div>

                    <div className="mt-2">
                      <h2 className="text-[14px] font-semibold text-[#332601] mb-1 line-clamp-2">
                        {p.name}
                      </h2>
                      <p className="text-[13px] text-[#4A3600] mb-3 font-medium">
                        From ₱{p.base_price}.00 PHP
                      </p>



                      <div className="flex gap-2">
  <button
    onClick={() => editProduct(p)}
    className="px-3 py-1 text-[12px] rounded-full bg-[#FFC6C6] text-[#332601] border border-[#E7B2B2] font-semibold hover:brightness-95"
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(p.id)}
    className="px-3 py-1 text-[12px] rounded-full bg-[#FFD1D1] text-[#7A1F1F] border border-[#F3BBBB] font-semibold hover:brightness-95"
  >
    Delete
  </button>
</div>

                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 italic col-span-full">No products found.</p>
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
                        flavors: Array.isArray(selectedProduct.flavors)
                          ? selectedProduct.flavors
                          : [],
                        addons: Array.isArray(selectedProduct.addons)
                          ? selectedProduct.addons
                          : [],
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
