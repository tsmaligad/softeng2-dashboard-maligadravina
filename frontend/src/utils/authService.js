// src/utils/authService.js
const STORAGE_KEY = "demo_users";

function readUsers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function writeUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function signup({ firstName, lastName, email, password }) {
  const users = readUsers();
  const key = email.toLowerCase().trim();

  if (users[key]) {
    throw new Error("An account with this email already exists.");
  }

  users[key] = { firstName, lastName, email: key, password };
  writeUsers(users);
  return users[key];
}

export function login({ email, password }) {
  const users = readUsers();
  const key = email.toLowerCase().trim();
  const user = users[key];

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }

  // very basic “session”
  localStorage.setItem("demo_session", JSON.stringify({ email: key, ts: Date.now() }));
  return user;
}

export function logout() {
  localStorage.removeItem("demo_session");
}

export function getSession() {
  const raw = localStorage.getItem("demo_session");
  return raw ? JSON.parse(raw) : null;
}
