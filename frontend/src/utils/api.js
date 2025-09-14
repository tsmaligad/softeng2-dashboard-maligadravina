// frontend/src/utils/api.js
const BASE_URL = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token') || '';
}
function saveToken(token) {
  if (token) localStorage.setItem('token', token);
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
    saveToken(data.token);
    return { success: !!data.token || !!data.success, ...data };
  },

  // ✅ REGISTER (needed by Createacc)
  register: async ({ firstName, lastName, email, password }) => {
    const { res, text } = await debugFetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
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
    localStorage.removeItem('token');
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
};
