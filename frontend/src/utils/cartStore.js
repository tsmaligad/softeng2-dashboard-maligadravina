// src/utils/cartStore.js
const API = import.meta?.env?.VITE_API_BASE || "http://localhost:8080";
function getCartKey() {
  const email = localStorage.getItem("userEmail");
  return email ? `cart_${email}` : "cart_guest";
}


function getToken() {
  return localStorage.getItem("token");
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(getCartKey()) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(items) {
  localStorage.setItem(getCartKey(), JSON.stringify(items));
}


export const cartStore = {
  // for guests: store locally; for logged-in: also mirror to server
  async add({ product_id, qty = 1, unit_price = 0, notes = "" }) {
    const token = getToken();
    // always update local so guests see cart too
    const items = readLocal();
    const idx = items.findIndex(
      (it) => it.product_id === product_id && (it.notes || "") === (notes || "")
    );
    if (idx >= 0) items[idx].qty += qty;
    else items.push({ product_id, qty, unit_price, notes });
    writeLocal(items);

    if (token) {
      await fetch(`${API}/api/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id, qty, unit_price, notes }),
      }).catch(() => {});
    }
  },

  readLocal() { return readLocal(); },

  async syncToServer() {
    const token = getToken();
    if (!token) return;
    const items = readLocal();
    if (!items.length) return;

    await fetch(`${API}/api/cart/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    }).catch(() => {});

    // after syncing, you can clear local or keep it mirrored
    writeLocal([]); // clear guest cart after merge
  },

  async fetchServer() {
    const token = getToken();
    if (!token) return null;
    const r = await fetch(`${API}/api/cart`, { headers: { Authorization: `Bearer ${token}` }});
    if (!r.ok) throw new Error("Failed to load server cart");
    return r.json(); // { items, total }
  },

  async updateServerItem(itemId, patch) {
    const token = getToken();
    if (!token) return;
    await fetch(`${API}/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    });
  },

  async deleteServerItem(itemId) {
    const token = getToken();
    if (!token) return;
    await fetch(`${API}/api/cart/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
};
