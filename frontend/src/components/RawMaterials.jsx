// src/components/RawMaterials.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const API_BASE = (import.meta?.env?.VITE_API_BASE || "http://localhost:8080").replace(/\/+$/, "");
const api = (path) => `${API_BASE}${path}`;

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Non-JSON response body:", text);
    throw new Error(`Invalid JSON (status ${res.status})`);
  }
}

const RawMaterials = ({ onDataChange }) => {
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    brand: "",
    description: "",
    units: "",
    price: "",
    status: "Available",
    expiration_date: "", // <-- added
  });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const res = await fetch(api("/api/raw-materials"));
        if (!res.ok) {
          const body = await res.text();
          console.error("GET /api/raw-materials failed:", res.status, body);
          throw new Error(`GET failed (${res.status})`);
        }
        const data = await safeJson(res);
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (!alive) return;
        setMaterials(list);
        onDataChange?.(list);
      } catch (e) {
        console.error("[RawMaterials] fetch error:", e);
        if (alive) setLoadError("Failed to load raw materials. Check console → Network tab.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.name || !newMaterial.brand || !newMaterial.units || !newMaterial.price) return;

    try {
      if (editingMaterial) {
        const res = await fetch(`${API_BASE}/api/raw-materials/${editingMaterial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newMaterial,
            price: parseFloat(newMaterial.price),
          }),
        });

        if (!res.ok) {
          console.error("PUT failed", res.status, await res.text());
          alert("Update failed. Check console for details.");
          return;
        }

        const updated = await res.json();
        setMaterials((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
        setEditingMaterial(null);
      } else {
        const res = await fetch(`${API_BASE}/api/raw-materials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newMaterial,
            price: parseFloat(newMaterial.price),
          }),
        });
        if (!res.ok) {
          console.error("POST failed", res.status, await res.text());
          alert("Saving failed. Check console for details.");
          return;
        }
        const saved = await res.json();
        setMaterials((prev) => [...prev, saved]);
      }
    } catch (e) {
      console.error("Save error:", e);
      alert(e.message);
    } finally {
      setNewMaterial({
        name: "",
        brand: "",
        description: "",
        units: "",
        price: "",
        status: "Available",
        expiration_date: "", // <-- reset
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/raw-materials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      const updated = materials.filter((m) => m.id !== id);
      setMaterials(updated);
      onDataChange?.(updated);
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const handleEdit = (mat) => {
    setEditingMaterial(mat);
    setNewMaterial({
      name: mat.name || "",
      brand: mat.brand || "",
      description: mat.description || "",
      units: mat.units || "",
      price: String(mat.price ?? ""),
      status: mat.status || "Available",
      expiration_date: mat.expiration_date || "", // <-- added
    });
  };

  return (
    <>
      {/* ===== Raw Materials “inspo” look (scoped to this page, same as Inventory) ===== */}
      <style>{`
        div.flex-1.p-6 { background: #f5efef; }
        div.flex-1.p-6 > .bg-white.shadow-md.rounded-lg {
          border: 1px solid #eadbd8;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          border-radius: 16px !important;
        }
        div.flex-1.p-6 .mb-4.rounded.bg-red-100 { border: 1px solid #f5caca; }
        div.flex-1.p-6 form.bg-white.shadow-md.rounded-lg.p-4 {
          background: #fff;
          border: 1px solid #eadbd8;
          border-radius: 16px;
        }
        div.flex-1.p-6 form.bg-white.shadow-md.rounded-lg.p-4 input,
        div.flex-1.p-6 form.bg-white.shadow-md.rounded-lg.p-4 select {
          border-color: #bdaaa2 !important;
          border-radius: 9999px !important;
          height: 40px;
        }
        div.flex-1.p-6 form.bg-white.shadow-md.rounded-lg.p-4 button[type="submit"] {
          background: #ffc6c6 !important;
          color: #332601 !important;
          border: 1px solid #e7b2b2;
          border-radius: 9999px !important;
          padding: 10px 20px;
          font-weight: 600;
        }
        div.flex-1.p-6 form.bg-white.shadow-md.rounded-lg.p-4 button[type="submit"]:hover {
          filter: brightness(0.97);
        }
        div.flex-1.p-6 table thead tr { background: #ffe1e1 !important; }
        div.flex-1.p-6 table thead th {
          color: #4a3600;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-color: #f3d6d6 !important;
        }
        div.flex-1.p-6 table tbody tr td { border-color: #f1e3e3 !important; }
        div.flex-1.p-6 table tbody tr:hover { background: #fcf7f7; }
        div.flex-1.p-6 table tbody button {
          border-radius: 9999px !important;
          padding: 6px 12px;
          border: 1px solid transparent;
        }
        div.flex-1.p-6 table tbody button.bg-yellow-500 {
          background: #f2e4c4 !important;
          color: #4a3600 !important;
          border-color: #f5d987;
        }
        div.flex-1.p-6 table tbody button.bg-red-500 {
          background: #ffd1d1 !important;
          color: #7a1f1f !important;
          border-color: #f3bbbb;
        }
        div.flex-1.p-6 > h1 {
          color: #332601;
          margin-top: 6px;
          margin-bottom: 18px;
        }
      `}</style>

      <div className="flex bg-[#F5EFEF]" >
        <Sidebar />
        <div className=" mt-[30px] ml-[30px] mr-[30px] flex-1 p-6 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold mb-3 ">Raw Materials</h1>

          <hr className="border-t border-[#8b7760]" />

          {loadError && (
            <div className=" mb-4 rounded bg-red-100 text-red-800 px-3 py-2 text-sm">
              {loadError}
            </div>
          )}

          <form
            onSubmit={handleAddMaterial}
            className="bg-white shadow-md p-4 mb-6 flex gap-4 flex-wrap"
          >
            <input
              type="text"
              placeholder="Name"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
              className="border px-3 py-2 flex-1 mr-[8px]"
            />
            <input
              type="text"
              placeholder="Brand"
              value={newMaterial.brand}
              onChange={(e) => setNewMaterial({ ...newMaterial, brand: e.target.value })}
              className="border px-3 py-2 rounded-md flex-1 mr-[8px]"
            />
            <input
              type="text"
              placeholder="Description"
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
              className="border px-3 py-2 rounded-md flex-1 mr-[8px]"
            />
            <select
              value={newMaterial.units}
              onChange={(e) => setNewMaterial({ ...newMaterial, units: e.target.value })}
              className="border px-3 py-2 rounded-md w-32 mr-[8px]"
            >
              <option value="">Select Unit</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
              <option value="pcs">pcs</option>
            </select>
            <input
              type="number"
              placeholder="Price (₱)"
              value={newMaterial.price}
              onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
              className="border px-3 py-2 rounded-md w-32 mr-[8px]"
            />
            <select
              value={newMaterial.status}
              onChange={(e) => setNewMaterial({ ...newMaterial, status: e.target.value })}
              className="border px-3 py-2 rounded-md w-40 mr-[8px]"
            >
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
            <input
              type="date"
              placeholder="Expiration Date"
              value={newMaterial.expiration_date}
              onChange={(e) => setNewMaterial({ ...newMaterial, expiration_date: e.target.value })}
              className="border px-3 py-2 rounded-md w-40 mr-[8px]"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              disabled={loading}
            >
              {editingMaterial ? "Update" : "Add"}
            </button>
          </form>

          <div className="mt-[20px] bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Brand</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Units</th>
                  <th className="p-3 border">Price</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Expiration Date</th> 
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{mat.id}</td>
                    <td className="p-3 border">{mat.name}</td>
                    <td className="p-3 border">{mat.brand}</td>
                    <td className="p-3 border">{mat.description}</td>
                    <td className="p-3 border">{mat.units}</td>
                    <td className="p-3 border">
                      {mat.price != null && mat.price !== ""
                        ? `₱${Number(mat.price).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="p-3 border">{mat.status}</td>
                    <td className="p-3 border">
                      {mat.expiration_date ? mat.expiration_date : "—"}
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(mat)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 mr-[5px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(mat.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {materials.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-gray-500">
                      {loading ? "Loading…" : "No raw materials found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default RawMaterials;