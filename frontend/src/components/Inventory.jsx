// src/components/Inventory.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8080";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ rawMaterialId: "", quantity: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rawMaterials, setRawMaterials] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load raw materials + inventory on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/raw-materials`);
        const mats = await res.json();
        setRawMaterials(Array.isArray(mats) ? mats : []);
      } catch (e) {
        console.error("Failed to load raw materials:", e);
      }
    })();

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/inventory`);
        const inv = await res.json();
        setItems(Array.isArray(inv) ? inv : []);
      } catch (e) {
        console.error("Failed to load inventory:", e);
      }
    })();
  }, []);

  // Add or Update item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.rawMaterialId || !newItem.quantity) return;

    const selectedMaterial = rawMaterials.find(
      (mat) => mat.id === parseInt(newItem.rawMaterialId, 10)
    );
    if (!selectedMaterial) return;

    if (editingItem) {
      // (Optional) add a PATCH route to persist edits; for now, local update only
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, quantity: parseInt(newItem.quantity, 10) }
            : item
        )
      );
      setEditingItem(null);
      setNewItem({ rawMaterialId: "", quantity: "" });
      return;
    }

    try {
      setSaving(true);
      // Persist in DB
      const res = await fetch(`${API_BASE}/api/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawMaterialId: selectedMaterial.id,
          quantity: parseInt(newItem.quantity, 10),
        }),
      });

      if (!res.ok) {
        console.error("POST /api/inventory failed:", res.status, await res.text());
        alert("Failed to add item. Check console for details.");
        return;
      }

      // Re-fetch inventory from DB so UI matches MySQL
      const invRes = await fetch(`${API_BASE}/api/inventory`);
      if (!invRes.ok) {
        console.error("GET /api/inventory failed:", invRes.status, await invRes.text());
        alert("Saved, but failed to refresh list.");
        return;
      }
      const inv = await invRes.json();
      setItems(Array.isArray(inv) ? inv : []);
    } catch (e) {
      console.error("Failed to add inventory item:", e);
      alert(e.message);
    } finally {
      setSaving(false);
      setNewItem({ rawMaterialId: "", quantity: "" });
    }
  };

  const handleDelete = (id) => {
    // (Optional) add DELETE /api/inventory/:id in backend to persist deletes
    setItems(items.filter((item) => item.id !== id));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      rawMaterialId: item.rawMaterialId,
      quantity: item.quantity,
    });
  };

  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id?.toString().includes(searchQuery)
  );

  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value ?? 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by ID, Name, or Brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border px-3 py-2 rounded-md shadow-sm"
          />
        </div>

        <form
          onSubmit={handleAddItem}
          className="bg-white shadow-md rounded-lg p-4 mb-6 flex gap-4 flex-wrap"
        >
          <select
            value={newItem.rawMaterialId}
            onChange={(e) =>
              setNewItem({ ...newItem, rawMaterialId: e.target.value })
            }
            className="border px-3 py-2 rounded-md flex-1"
          >
            <option value="">-- Select Raw Material --</option>
            {rawMaterials.map((mat) => (
              <option
                key={mat.id}
                value={mat.id}
                disabled={mat.status !== "Available"}
              >
                {mat.name} ({mat.brand}) - {mat.units}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-32"
          />

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {editingItem ? "Update" : saving ? "Saving…" : "Add"}
          </button>
        </form>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Brand</th>
                <th className="p-3 border">Units</th>
                <th className="p-3 border">Quantity</th>
                <th className="p-3 border">Base Price</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{item.id}</td>
                    <td className="p-3 border">{item.name}</td>
                    <td className="p-3 border">{item.brand}</td>
                    <td className="p-3 border">{item.units}</td>
                    <td className="p-3 border">{item.quantity}</td>
                    <td className="p-3 border">{formatPeso(item.price)}</td>
                    <td className="p-3 border">{item.status}</td>
                    <td className="p-3 border text-center flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
