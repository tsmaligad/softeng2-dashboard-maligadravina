import React, { useState } from "react";
import Sidebar from "../components/Sidebar"; // ✅ import sidebar

const Inventory = ({ rawMaterials = [] }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ rawMaterialId: "", quantity: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add or Update item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.rawMaterialId || !newItem.quantity) return;

    const selectedMaterial = rawMaterials.find(
      (mat) => mat.id === parseInt(newItem.rawMaterialId, 10)
    );

    if (!selectedMaterial) return;

    if (editingItem) {
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                rawMaterialId: selectedMaterial.id,
                name: selectedMaterial.name,
                brand: selectedMaterial.brand,
                units: selectedMaterial.units,
                price: selectedMaterial.price,
                status: selectedMaterial.status,
                quantity: parseInt(newItem.quantity, 10),
              }
            : item
        )
      );
      setEditingItem(null);
    } else {
      const newEntry = {
        id: items.length + 1,
        rawMaterialId: selectedMaterial.id,
        name: selectedMaterial.name,
        brand: selectedMaterial.brand,
        units: selectedMaterial.units,
        price: selectedMaterial.price,
        status: selectedMaterial.status,
        quantity: parseInt(newItem.quantity, 10),
      };
      setItems([...items, newEntry]);
    }

    setNewItem({ rawMaterialId: "", quantity: "" });
  };

  // Delete
  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      rawMaterialId: item.rawMaterialId,
      quantity: item.quantity,
    });
  };

  // Filter items
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery)
  );

  // Format price in PHP
  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Sidebar imported */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by ID, Name, or Brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border px-3 py-2 rounded-md shadow-sm"
          />
        </div>

        {/* Add/Edit Item Form */}
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editingItem ? "Update" : "Add"}
          </button>
        </form>

        {/* Inventory Table */}
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