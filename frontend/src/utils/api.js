// frontend/src/utils/api.js
const BASE_URL = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token') || '';
}
function saveToken(token) {
  if (token) localStorage.setItem('token', token);
}
function abs(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}

// 🔊 Debug wrapper
async function debugFetch(url, options = {}) {
  console.log("[api] →", options.method || "GET", url, options);
  const res = await fetch(url, options);
  const text = await res.text();
  console.log("[api] ←", res.status, res.statusText, "CT:", res.headers.get("content-type"));
  console.log("[api] raw body:", text?.slice(0, 500)); // cap to avoid noise
  return { res, text };
}

async function handleJson(res, text) {
  let data;
  try { data = text ? JSON.parse(text) : {}; }
  catch {
    // Return a shaped error so the UI shows it, not silently fail
    throw new Error("Unexpected response (not JSON).");
  }
  if (!res.ok || data?.success === false) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // src/utils/api.js
clearHomepageHero: async () => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/homepage/hero`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res, text); // { success: true }
},

  /* ---------------- Health ---------------- */
  health: async () => {
    const { res, text } = await debugFetch(`${BASE_URL}/health`);
    return handleJson(res, text);
  },

  /* ---------------- Auth ---------------- */
  login: async ({ email, password }) => {
    const { res, text } = await debugFetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleJson(res, text);
  
    // save JWT
    saveToken(data.token);
  
    // 🔑 save which user is logged in (for cart key)
    const normalizedEmail = (data.email || email || '').toLowerCase();
    if (normalizedEmail) {
      localStorage.setItem('userEmail', normalizedEmail);
    }
  
    return { success: !!data.token || !!data.success, ...data };
  },
  

  // ✅ REGISTER (needed by Createacc)
  // ✅ REGISTER (Createacc.jsx calls this)
  // inside export const api = { … }
register: async ({ firstName, lastName, email, password }) => {
  const name = `${(firstName || '').trim()} ${(lastName || '').trim()}`
    .trim()
    .replace(/\s+/g, ' ');
  const { res, text } = await debugFetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleJson(res, text);
},

  


  // ✅ ADMIN LOGIN (normalize success if token present)
  adminLogin: async ({ email, password }) => {
    const { res, text } = await debugFetch(`${BASE_URL}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleJson(res, text);
    saveToken(data.token);
    return { success: !!data.token || !!data.success, ...data };
  },

  me: async () => {
    const token = getToken();
    if (!token) return { success: false };
    const { res, text } = await debugFetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleJson(res, text);
  },

  logout: async () => {
    const token = getToken();
    await debugFetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  
    // remove auth + user marker
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail'); // we won't delete the cart itself (so cart persists for that user)
  
    return { success: true };
  },
  

  /* ---------------- Users CRUD ---------------- */
  getUsers: async (q = "") => {
    const token = getToken();
    const { res, text } = await debugFetch(`${BASE_URL}/users?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleJson(res, text);
  },

  createUser: async (payload) => {
    const token = getToken();
    const { res, text } = await debugFetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleJson(res, text);
  },

  updateUser: async (id, payload) => {
    const token = getToken();
    const { res, text } = await debugFetch(`${BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleJson(res, text);
  },

  deleteUser: async (id) => {
    const token = getToken();
    const { res, text } = await debugFetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleJson(res, text);
  },

    /* ---------------- Homepage (Hero + Featured Products + FAQs) ---------------- */
getHomepage: async () => {
  const { res, text } = await debugFetch(`${BASE_URL}/homepage`);
  return handleJson(res, text); // { hero_url, featured_product_ids, faq_ids }
},

updateHomepage: async (payload) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/homepage`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleJson(res, text);
},

// ---------------- HOMEPAGE HERO IMAGES ----------------

// Upload **single** hero image (kept for backward compatibility)
uploadHomepageHero: async (file) => {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);

  const { res, text } = await debugFetch(`${BASE_URL}/homepage/hero`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type here!
    body: fd,
  });
  return handleJson(res, text);
},

// Upload **multiple** hero images (carousel)
uploadHomepageHeroes: async (files) => {
  const token = getToken();
  const fd = new FormData();
  [...files].forEach((f) => fd.append("files", f));

  const { res, text } = await debugFetch(`${BASE_URL}/homepage/heroes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // still no content-type!
    body: fd,
  });
  return handleJson(res, text);
},

// Clear the single hero image field
clearHomepageHero: async () => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/homepage/hero`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res, text);
},

// Replace hero_urls array (save order / reorder carousel)
setHeroUrls: async (hero_urls) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/homepage/heroes`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hero_urls }),
  });
  return handleJson(res, text);
},

// Delete a single hero image at an index
deleteHeroAt: async (idx) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/homepage/heroes/${idx}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res, text);
},



// ---------------- Catalog sources (used by homepage editor) ----------------


getProducts: async () => {
  const { res, text } = await debugFetch(`${BASE_URL}/api/products`);
  const data = await handleJson(res, text);
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  return items.map(p => ({
    id: p.id,
    name: p.name,
    // use price if present, else base_price
    price: Number(p.price ?? p.base_price ?? 0),
    image_url: abs(p.image_url),
  }));
},

getFaqs: async () => {
  const { res, text } = await debugFetch(`${BASE_URL}/api/faqs`);
  const data = await handleJson(res, text);
  return Array.isArray(data?.items) ? data.items : [];
},

// --- FAQ ADMIN (requires admin token) ---
// ---------------- FAQs ADMIN (CRUD) ----------------
getFaqsAdmin: async () => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/faqs-admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res, text); // { items: [...] }
},

createFaq: async (payload) => {
  const token = getToken();
  // map is_active -> enabled if provided by the form
  const body = {
    q: payload.q,
    a: payload.a,
    // accept either `enabled` or `is_active`
    enabled:
      payload.enabled != null
        ? (payload.enabled ? 1 : 0)
        : (payload.is_active != null ? (payload.is_active ? 1 : 0) : 1),
    sort_order: payload.sort_order ?? 0,
  };
  
  const { res, text } = await debugFetch(`${BASE_URL}/api/faqs-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return handleJson(res, text);
},

updateFaq: async (id, payload) => {
  const token = getToken();
  const body = {
    ...(payload.q != null ? { q: payload.q } : {}),
    ...(payload.a != null ? { a: payload.a } : {}),
    // accept BOTH keys
    ...(payload.is_active != null ? { enabled: payload.is_active ? 1 : 0 } : {}),
    ...(payload.enabled   != null ? { enabled: payload.enabled   ? 1 : 0 } : {}),
    ...(payload.sort_order != null ? { sort_order: Number(payload.sort_order) || 0 } : {}),
  };
  const { res, text } = await debugFetch(`${BASE_URL}/api/faqs-admin/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return handleJson(res, text);
},


deleteFaq: async (id) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/faqs-admin/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res, text);
},

reorderFaqs: async (ids) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/faqs-admin/reorder`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });
  return handleJson(res, text);
},

/* ------------ about usssssssssss ----------------*/
// -------- ABOUT (public) --------
getAbout: async () => {
  const { res, text } = await debugFetch(`${BASE_URL}/api/about`);
  return handleJson(res, text); // {heading, body, images:[...]}
},

// -------- ABOUT (admin) --------
getAboutAdmin: async () => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/about-admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res, text);
},

updateAboutText: async ({ heading, body }) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/about-admin`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ heading, body }),
  });
  return handleJson(res, text);
},

uploadAboutImage: async (file) => {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  const { res, text } = await debugFetch(`${BASE_URL}/api/about-images-admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  return handleJson(res, text); // { success, url }
},

updateContactMessageStatus: async (id, body) => {
  const { res, text } = await debugFetch(`${BASE_URL}/api/contact-messages/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleJson(res, text);
},



createAboutImage: async ({ url, title, position, enabled = 1 }) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/about-images-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, title, position, enabled }),
  });
  return handleJson(res, text); // { id }
},

updateAboutImage: async (id, payload) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/about-images-admin/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleJson(res, text);
},

deleteAboutImage: async (id) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/about-images-admin/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(res, text);
},

reorderAboutImages: async (ids) => {
  const token = getToken();
  const { res, text } = await debugFetch(`${BASE_URL}/api/about-images-admin/reorder`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });
  return handleJson(res, text);
},


getContactMessages: async (params = {}) => {
  const url = new URL("http://localhost:8080/api/contact-messages");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value != null) {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString());
  const data = await res.json();
  return data; // MUST contain { items: [...] }
},



  
};



