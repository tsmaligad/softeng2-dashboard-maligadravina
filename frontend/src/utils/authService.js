// src/utils/authService.js
// Frontend auth helper that talks to your Express backend (users table).
// One login for everyone (admin & customer). Stores JWT + a tiny session.

const BASE = import.meta?.env?.VITE_BACKEND_URL || "http://localhost:8080";

const TOKEN_KEY = "auth_token";            // JWT
const SESSION_KEY = "auth_session";        // { email, role, name }

/* ---------------- helpers ---------------- */

function saveAuth({ token, email, role, name }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: email ?? null, role: role ?? null, name: name ?? null })
  );
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null; // { email, role, name }
}

export function setSession(partial) {
  const cur = getSession() || {};
  const next = { ...cur, ...partial };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  return next;
}

/** Clear local auth state and (optionally) ping backend */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  // Optional: tell backend (does nothing for pure JWT but harmless)
  fetch(`${BASE}/logout`, { method: "POST" }).catch(() => {});
}

/** Fetch wrapper that auto-attaches Authorization header (if token exists) */
export async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(
    path.startsWith("http") ? path : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`,
    { ...options, headers }
  );
  return res;
}

/* ---------------- API calls ---------------- */

/**
 * Login (POST /login)
 * Body: { email, password }
 * Success: { success, token, email, role, name }
 */
export async function login({ email, password }) {
  const r = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // Handle non-JSON / server errors gracefully
  if (!r.ok) {
    let msg = "Login failed.";
    try {
      const err = await r.json();
      msg = err?.message || err?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  let res;
  try {
    res = await r.json();
  } catch {
    throw new Error("Server returned invalid JSON.");
  }

  if (!res?.success || !res?.token) {
    throw new Error(res?.message || "Invalid email or password.");
  }

  saveAuth({
    token: res.token,
    email: res.email,
    role: res.role,    // 'admin' | 'customer'
    name: res.name,
  });

  return { email: res.email, role: res.role, name: res.name };
}

/**
 * Who am I? (GET /me)
 * Returns: { success, role, user_id? }
 * Also refreshes local session role if valid.
 */
export async function me() {
  const token = getToken();
  if (!token) return { success: false };

  const r = await authFetch("/me");
  if (!r.ok) return { success: false };

  let res;
  try {
    res = await r.json();
  } catch {
    return { success: false };
  }

  if (res?.success && res?.role) {
    const current = getSession() || {};
    saveAuth({
      token,
      email: current.email || null,
      role: res.role,
      name: current.name || null,
    });
  }

  return res;
}

/** Convenience helper */
export function isAuthed() {
  return !!getToken();
}
