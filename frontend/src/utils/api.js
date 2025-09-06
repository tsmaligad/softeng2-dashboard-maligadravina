// frontend/src/utils/api.js
const BASE_URL = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function handleJson(res) {
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'Invalid JSON' }; }
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  health: async () => handleJson(await fetch(`${BASE_URL}/api/health`)),

  adminLogin: async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleJson(res);
    if (data.token) localStorage.setItem('token', data.token);
    return data; // { success, token, user }
  },

  adminMe: async () => {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${BASE_URL}/api/admins/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleJson(res);
  },

  getAdmins: async () => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/api/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleJson(res);
  },

  createAdmin: async (payload) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/api/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleJson(res); // { success, id }
  },

  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  },
};
