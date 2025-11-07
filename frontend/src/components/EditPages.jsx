// src/components/EditPages.jsx
import React from "react";
import Sidebar from "./Sidebar.jsx";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { api } from "../utils/api";
import heroFallback from "../assets/homepagepic.png";

/* ---------------- EDIT PAGES SHELL ---------------- */
// homepage config
const EditPages = () => {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event, newValue) => setValue(newValue);

  return (
    <div className="flex gap-10 min-h-screen bg-[#FAF9F7] text-[#332601]">

      <Sidebar />

      {/* Main content */}
      <main className="flex-1">
        <div className="ml-[30px] mr-[30px] mx-auto max-w-6xl px-8 py-10">
          <h1 className="ml-[30px] text-3xl font-bold tracking-tight text-[#332601] mb-8 mt-[30px]">
            Edit Pages
          </h1>

          <hr className="border-t border-[#8b7760]" />

          {/* Tabs */}
          <div className="mt-8 p-4 bg-transparent border-none shadow-none">


            <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
                aria-label="page edit tabs"
              >
                <Tab label="Homepage" />
                <Tab label="Contact" />
                <Tab label="About Us" />
                <Tab label="FAQ" />
                <Tab label="Policies" />
                <Tab label="Others" />
              </Tabs>
            </Box>

            {/* Panels */}
            <div className="mt-6">
              {value === 0 && <HomepageEditor />}
              {value === 1 && (
                <div className="p-4 border rounded-xl ">
                  <h2 className=" font-semibold mb-2 ml-[10px]">Contact</h2>
                  <p className="text-sm text-gray-600 ml-[10px]">Contact page editor goes here.</p>
                </div>
              )}
              {value === 2 && (
                <div className="p-4 border rounded-xl">
                  <h2 className="font-semibold mb-2">About Us</h2>
                  <p className="text-sm text-gray-600">About page editor goes here.</p>
                </div>
              )}
              {value === 3 && <FaqEditor />}
              {value === 4 && (
                <div className="p-4 border rounded-xl">
                  <h2 className="font-semibold mb-2">Policies</h2>
                  <p className="text-sm text-gray-600">Policies editor goes here.</p>
                </div>
              )}
              {value === 5 && (
                <div className="p-4 border rounded-xl">
                  <h2 className="font-semibold mb-2">Others</h2>
                  <p className="text-sm text-gray-600">Anything else you want to edit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditPages;

/* ---------------- HOMEPAGE EDITOR (Hero + Featured + FAQs) ---------------- */

const HomepageEditor = () => {
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  // homepage config
  const [heroUrl, setHeroUrl] = React.useState("");
  const [heroUrls, setHeroUrls] = React.useState([]);
  const [featuredIds, setFeaturedIds] = React.useState([]); // number[]
  const [faqIds, setFaqIds] = React.useState([]); // number[]

  // selectable data
  const [products, setProducts] = React.useState([]); // normalized to array
  const [faqs, setFaqs] = React.useState([]); // normalized to array

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const [conf, prods, faqList] = await Promise.all([
          api.getHomepage(), // { hero_url, featured_product_ids, faq_ids }
          api.getProducts(), // {items:[...]} or [...]
          api.getFaqs(),     // {items:[...]} or [...]
        ]);

        setHeroUrl(conf?.hero_url || "");
        setHeroUrls(Array.isArray(conf?.hero_urls) ? conf.hero_urls : []); // ← NEW

        setFeaturedIds(conf?.featured_product_ids || []);
        setFaqIds(conf?.faq_ids || []);

        const productsArr = Array.isArray(prods?.items) ? prods.items : (Array.isArray(prods) ? prods : []);
        const faqsArr = Array.isArray(faqList?.items) ? faqList.items : (Array.isArray(faqList) ? faqList : []);

        setProducts(productsArr);
        setFaqs(faqsArr);
      } catch (e) {
        setError(e.message || "Failed to load homepage config");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleHeroChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const { url } = await api.uploadHomepageHero(file);
      setHeroUrl(url);
    } catch (e) {
      alert(e.message || "Failed to upload header image");
    } finally {
      setSaving(false);
    }
  }

  async function handleHeroMultiChange(e) {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      setSaving(true);
      const data = await api.uploadHomepageHeroes(files);
      const merged = data?.urls || data?.hero_urls || [];
      setHeroUrls(merged); // show all now
      setHeroUrl("");      // optional: hide single preview when carousel exists
    } catch (err) {
      alert(err.message || "Failed to upload images");
    } finally {
      setSaving(false);
    }
  }
  
  
  async function removeHeroAt(idx) {
    try {
      setSaving(true);
      const { hero_urls } = await api.deleteHeroAt(idx); // backend returns updated array
      setHeroUrls(hero_urls);
    } catch (err) {
      alert(err.message || "Failed to remove image");
    } finally {
      setSaving(false);
    }
  }

  /* ✅ ADD THIS BELOW */
function moveHero(oldIndex, delta) {
  const arr = [...heroUrls];
  const newIndex = oldIndex + delta;
  if (newIndex < 0 || newIndex >= arr.length) return;
  const [m] = arr.splice(oldIndex, 1);
  arr.splice(newIndex, 0, m);
  setHeroUrls(arr);
}
  

  function toggleFeatured(id) {
    setFeaturedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleFaq(id) {
    setFaqIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      await api.updateHomepage({
        featured_product_ids: featuredIds,
        faq_ids: faqIds,
      });
      // persist carousel order
      await api.setHeroUrls(heroUrls);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      alert(e.message || "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  }
  

  if (loading) {
    return (
      <div className="p-4 border rounded-xl text-sm text-gray-600">
        Loading homepage settings…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-xl text-sm text-red-600">
        {error}
      </div>
    );
  }

  const isDefaultHero = !heroUrl;
  const previewHero = heroUrl || heroFallback; // matches public Homepage logic

  return (
    <div className="p-4 border rounded-xl">
      <h2 className="font-semibold mb-2 ml-[10px]">Homepage</h2>
      <p className="text-sm text-gray-600 ml-[10px] mb-6">
        Edit the hero image, featured products, and FAQs shown on the homepage.
      </p>

      {/* ---------------- HERO ---------------- */}
      {/* ---------------- HERO ---------------- */}
<h3 className="font-semibold mb-2 ml-[10px]">Hero</h3>
<div className="ml-[10px]">
  {/* PREVIEW */}
  {heroUrls.length > 0 ? (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {heroUrls.map((u, i) => (
        <div key={i} className="relative group">
          <img
            src={u}
            alt={`Hero ${i + 1}`}
            className="w-full h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => removeHeroAt(i)}
            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  ) : (
    <>
      <img
        src={heroUrl || heroFallback}
        alt="Homepage header"
        className="w-full max-h-64 object-cover rounded-lg border"
      />
      <div className="mt-2 text-xs text-gray-600">
        {!heroUrl ? "Currently showing default hero." : "Currently showing uploaded hero image."}
      </div>
    </>
  )}

  {/* CONTROLS */}
  <div className="mt-4 flex flex-wrap items-center gap-3">
    {/* Single image upload (kept) */}
    <label className="inline-flex items-center gap-3 px-4 py-2 bg-[#4A3600] text-white rounded-lg cursor-pointer hover:bg-[#3a2a00] transition text-sm">
      <input type="file" accept="image/*" onChange={handleHeroChange} className="hidden" />
      Upload Single Image
    </label>

    {/* Multi image upload (new) */}
    <label className="inline-flex items-center gap-3 px-4 py-2 bg-[#4A3600] text-white rounded-lg cursor-pointer hover:bg-[#3a2a00] transition text-sm">
      <input type="file" accept="image/*" multiple onChange={handleHeroMultiChange} className="hidden" />
      Upload Multiple Images
    </label>

    {!!heroUrl && heroUrls.length === 0 && (
      <button
        type="button"
        onClick={async () => {
          try {
            setSaving(true);
            await api.clearHomepageHero();
            setHeroUrl("");
          } catch (e) {
            alert(e.message || "Failed to clear hero image");
          } finally {
            setSaving(false);
          }
        }}
        className="px-4 py-2 rounded-lg border text-sm text-[#332601] hover:bg-[#F3F1ED] transition"
      >
        Use default image
      </button>
    )}

    {saving && <span className="text-xs text-gray-500">Working…</span>}
  </div>
</div>


      {/* ---------------- FEATURED PRODUCTS ---------------- */}
      <h3 className="font-semibold mb-2 mt-[30px] ml-[10px]">Featured Products</h3>
      <p className="text-sm text-gray-600 ml-[10px] mb-3">
        Choose which products appear in the “Featured products” grid.
      </p>

      <div className="ml-[10px]">
        {products.length === 0 ? (
          <div className="text-sm text-gray-500">No products found.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((p) => (
              <li
                key={p.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  featuredIds.includes(p.id) ? "bg-emerald-50 border-emerald-300" : "bg-white"
                }`}
              >
                <div className="text-sm">
                  <div className="font-medium">{p.name}</div>
                  {p.price != null && (
                    <div className="text-xs text-gray-600">
                      ₱{Number(p.price ?? p.base_price ?? 0).toLocaleString()}
                    </div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={featuredIds.includes(p.id)}
                    onChange={() => toggleFeatured(p.id)}
                  />
                  <span>{featuredIds.includes(p.id) ? "Featured" : "Feature"}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------------- FAQS ---------------- */}
      <h3 className="font-semibold mb-2 mt-[30px] ml-[10px]">Homepage FAQs</h3>
      <p className="text-sm text-gray-600 ml-[10px] mb-3">
        Select which FAQs will appear in the homepage accordion.
      </p>

      <div className="ml-[10px]">
        {faqs.length === 0 ? (
          <div className="text-sm text-gray-500">No FAQs found.</div>
        ) : (
          <ul className="space-y-2">
            {faqs.map((f) => (
              <li
                key={f.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  faqIds.includes(f.id) ? "bg-blue-50 border-blue-300" : "bg-white"
                }`}
              >
                <div className="text-sm">
                  <div className="font-medium">{f.q}</div>
                  <div className="text-xs text-gray-600 line-clamp-2">{f.a}</div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={faqIds.includes(f.id)}
                    onChange={() => toggleFaq(f.id)}
                  />
                  <span>{faqIds.includes(f.id) ? "Shown" : "Show"}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------------- SAVE ---------------- */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="rounded-xl bg-[#4A3600] text-white px-5 py-2.5 text-sm font-medium shadow-md hover:bg-[#3a2a00] transition"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

/* ---------------- FAQ EDITOR (CRUD for /faqpage) ---------------- */
/* ---------------- FAQ EDITOR (CRUD for /faqpage) ---------------- */
const FaqEditor = () => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [faqs, setFaqs] = React.useState([]);

  // form state
  const [form, setForm] = React.useState({
    id: null,
    q: "",
    a: "",
    enabled: true,
    sort_order: 0,
  });
  const isEditing = form.id !== null;

  // --- NEW: DnD state for reordering ---
  const [dragIndex, setDragIndex] = React.useState(null);
  const [orderDirty, setOrderDirty] = React.useState(false);

  function move(arr, from, to) {
    const copy = [...arr];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    return copy;
  }
  function onDragStart(e, index) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e, overIndex) {
    e.preventDefault(); // allow drop
    if (dragIndex === null || dragIndex === overIndex) return;
    setFaqs(prev => {
      const next = move(prev, dragIndex, overIndex);
      setDragIndex(overIndex);
      return next;
    });
    setOrderDirty(true);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragIndex(null);
  }
  async function saveOrder() {
    try {
      setSaving(true);
      // persist sequential sort_order by current array order
      await Promise.all(
        faqs.map((f, idx) =>
          api.updateFaq(f.id, {
            sort_order: idx,
          })
        )
      );
      setOrderDirty(false);
    } catch (e) {
      alert(e.message || "Failed to save FAQ order");
    } finally {
      setSaving(false);
    }
  }
  // --- END NEW ---

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.getFaqsAdmin();
const arr = Array.isArray(data?.items) ? data.items : [];
// ensure sort ordering for initial render
      arr.sort((x, y) => (Number(x.sort_order ?? 0) - Number(y.sort_order ?? 0)) || Number(x.id) - Number(y.id));
      setFaqs(arr);
    } catch (e) {
      setError(e.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  function startEdit(item) {
    setForm({
      id: item.id,
      q: item.q ?? "",
      a: item.a ?? "",
      enabled: !!item.enabled,             // ← use enabled from admin list
      sort_order: Number(item.sort_order ?? 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  

  function resetForm() {
    setForm({ id: null, q: "", a: "", enabled: true, sort_order: 0 });
  }
  
  
  
  

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        q: form.q,
        a: form.a,
        enabled: form.enabled ? 1 : 0,
        sort_order: Number(form.sort_order ?? 0),
      };
      if (isEditing) {
        await api.updateFaq(form.id, payload);
      } else {
        await api.createFaq(payload);
      }
      resetForm();
      await load();
    } catch (e) {
      alert(e.message || "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      setSaving(true);
      await api.deleteFaq(id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete FAQ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 border rounded-xl">
      <h2 className="font-semibold mb-2 ml-[10px]">FAQ (Site FAQ Page)</h2>
      <p className="text-sm text-gray-600 ml-[10px] mb-6">
        Add, edit, delete FAQs for your public FAQ page.
      </p>

      {/* Form */}
      <form onSubmit={onSubmit} className="ml-[10px] mb-8 grid grid-cols-1 gap-3 bg-white p-4 rounded-2xl shadow-md border border-gray-200">
        <label className="text-sm">
          <span className="block mb-1 font-medium">Question</span>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#4A3600] focus:outline-none"
            value={form.q}
            onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
            placeholder="Type the question…"
            required
          />
        </label>

        <label className="text-sm">
          <span className="block mb-1 font-medium">Answer</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#4A3600] focus:outline-none"
            value={form.a}
            onChange={(e) => setForm((f) => ({ ...f, a: e.target.value }))}
            placeholder="Type the answer…"
            required
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-sm flex items-center gap-2">
  <input
    type="checkbox"
    checked={form.enabled}
    onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
  />
  <span>Active</span>
</label>




          

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#4A3600] text-white px-5 py-2.5 text-sm font-medium shadow-md hover:bg-[#3a2a00] transition"
            >
              {isEditing ? (saving ? "Saving…" : "Save Changes") : (saving ? "Saving…" : "Add FAQ")}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-4 py-2.5 text-sm hover:bg-[#F3F1ED] transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* List (draggable) */}
      <div className="ml-[10px] rounded-2xl bg-white shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading…</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : faqs.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No FAQs yet.</div>
        ) : (
          <>
            {orderDirty && (
              <div className="p-3 border-b bg-amber-50 flex items-center justify-between">
                <div className="text-sm text-[#7a5a1a]">Order changed. Don’t forget to save.</div>
                <button
                  onClick={saveOrder}
                  disabled={saving}
                  className="rounded-lg bg-[#4A3600] text-white px-3 py-1.5 text-sm hover:bg-[#3a2a00] transition"
                >
                  {saving ? "Saving…" : "Save Order"}
                </button>
              </div>
            )}

            <ul className="divide-y">
              {faqs.map((f, idx) => (
                <li
                  key={f.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={onDrop}
                  className={`p-4 ${dragIndex === idx ? "bg-amber-50" : "bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
  <span className="cursor-grab select-none" title="Drag to reorder">≡</span>
  <span className="opacity-60">#{idx + 1}</span>
</div>


                      <div className="font-medium text-[#332601]">{f.q}</div>
                      <div className="text-sm text-gray-700 mt-1 whitespace-pre-line">{f.a}</div>
                      <div className="text-xs mt-1">
                        Status: {f.enabled ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-700 border border-green-200">Active</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 border border-gray-300">Inactive</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => startEdit(f)}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(f.id)}
                        className="rounded-lg border px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
