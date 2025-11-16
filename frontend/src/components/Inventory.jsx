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

  useEffect(() => {
    // Load raw materials
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/raw-materials`);
        const mats = await res.json();
        setRawMaterials(Array.isArray(mats) ? mats : []);
      } catch (e) {
        console.error("Failed to load raw materials:", e);
      }
    })();

    // Load inventory
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

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.rawMaterialId || !newItem.quantity) return;

    const selectedMaterial = rawMaterials.find(
      (mat) => mat.id === parseInt(newItem.rawMaterialId, 10)
    );
    if (!selectedMaterial) return;

    if (editingItem) {
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
      const invRes = await fetch(`${API_BASE}/api/inventory`);
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
    <>
      {/* ===== CSS styling similar to RawMaterials.jsx ===== */}
      <style>{`
        div.flex-1.p-6 { background: #f5efef; }
        div.flex-1.p-6 > .bg-white.shadow-md.rounded-lg {
          border: 1px solid #eadbd8;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          border-radius: 16px !important;
        }
        div.flex-1.p-6 .mb-4.rounded.bg-red-100 { border: 1px solid #f5caca; }
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

      <div className="flex bg-[#F5EFEF] min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6 ml-[30px] mr-[30px] mt-[30px]">
          <h1 className="text-3xl font-bold mb-6">Inventory</h1>

          <hr className="border-t border-[#8b7760]" />


          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by ID, Name, or Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border px-3 py-2 rounded-md shadow-sm mb-[20px]"
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
              className="border px-3 py-2 flex-1 mr-[8px]"
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
              className="border px-3 py-2 w-32 mr-[8px]"
            />

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              {editingItem ? "Update" : saving ? "Saving…" : "Add"}
            </button>
          </form>

          <div className="bg-white shadow-md rounded-lg overflow-hidden mt-[30px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Brand</th>
                  <th className="p-3 border">Units</th>
                  <th className="p-3 border">Quantity</th>
                  <th className="p-3 border">Base Price</th>
                  <th className="p-3 border">Expiration Date</th>
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
                      <td className="p-3 border">
                        {item.expiration_date ? item.expiration_date : "—"}
                      </td>
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
                    <td colSpan="9" className="p-4 text-center text-gray-500">
                      No items found
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

export default Inventory;
