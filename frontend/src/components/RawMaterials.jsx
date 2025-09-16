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
  });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // INITIAL LOAD
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
  }, []); // load once on mount

  // ADD / UPDATE
  // replace your current submit handler with this one
const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.name || !newMaterial.brand || !newMaterial.units || !newMaterial.price) return;
  
    try {
      if (editingMaterial) {
        // ✅ EDIT: persist to DB
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
  
        const updated = await res.json(); // { id, name, brand, ... }
        // update the row in local state
        setMaterials((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
        );
        setEditingMaterial(null);
      } else {
        // ✅ ADD: create in DB (you already had this working)
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
      });
    }
  };
  

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/raw-materials/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
  
      const updated = materials.filter((m) => m.id !== id);
      setMaterials(updated);
      onDataChange?.(updated);
    } catch (e) {
      console.error("Delete error:", e);
    }
  };
  
  // when you click the Edit button in the table
const handleEdit = (mat) => {
    setEditingMaterial(mat); // tells the form we're editing
    setNewMaterial({
      name: mat.name || "",
      brand: mat.brand || "",
      description: mat.description || "",
      units: mat.units || "",
      price: String(mat.price ?? ""),
      status: mat.status || "Available",
    });
  };
  

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-3">Raw Materials</h1>

        {loadError && (
          <div className="mb-4 rounded bg-red-100 text-red-800 px-3 py-2 text-sm">
            {loadError}
          </div>
        )}

        <form
          onSubmit={handleAddMaterial}
          className="bg-white shadow-md rounded-lg p-4 mb-6 flex gap-4 flex-wrap"
        >
          <input
            type="text"
            placeholder="Name"
            value={newMaterial.name}
            onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
            className="border px-3 py-2 rounded-md flex-1"
          />
          <input
            type="text"
            placeholder="Brand"
            value={newMaterial.brand}
            onChange={(e) => setNewMaterial({ ...newMaterial, brand: e.target.value })}
            className="border px-3 py-2 rounded-md flex-1"
          />
          <input
            type="text"
            placeholder="Description"
            value={newMaterial.description}
            onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
            className="border px-3 py-2 rounded-md flex-1"
          />
          <select
            value={newMaterial.units}
            onChange={(e) => setNewMaterial({ ...newMaterial, units: e.target.value })}
            className="border px-3 py-2 rounded-md w-32"
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
            className="border px-3 py-2 rounded-md w-32"
          />
          <select
            value={newMaterial.status}
            onChange={(e) => setNewMaterial({ ...newMaterial, status: e.target.value })}
            className="border px-3 py-2 rounded-md w-40"
          >
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            disabled={loading}
          >
            {editingMaterial ? "Update" : "Add"}
          </button>
        </form>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                    {typeof mat.price === "number" ? `₱${mat.price}` : "—"}
                  </td>
                  <td className="p-3 border">{mat.status}</td>
                  <td className="p-3 border text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(mat)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
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
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    {loading ? "Loading…" : "No raw materials found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RawMaterials;
