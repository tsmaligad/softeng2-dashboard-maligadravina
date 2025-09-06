import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import { api } from "../utils/api"; // getAdmins, createAdmin

export default function UserList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // inline form state
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [formOk, setFormOk] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getAdmins(); // ✅ only admins from DB
        if (mounted) setAdmins(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Failed to load admins.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFormErr("");
    setFormOk("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErr("");
    setFormOk("");

    // basic client-side validation; server should still validate + hash
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormErr("All fields are required.");
      return;
    }

    try {
      setSaving(true);
      const newAdmin = await api.createAdmin({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // Prepend to table
      setAdmins((prev) => [newAdmin, ...prev]);
      setForm({ name: "", email: "", password: "" });
      setFormOk("Admin created successfully.");
    } catch (e2) {
      console.error(e2);
      setFormErr(e2?.message || "Failed to create admin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6">
        {/* Header (matches your Dashboard/MainContent style) */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl text-gray-800">Admins</h1>
            <h2 className="text-lg text-gray-600 mt-2">User List</h2>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white p-4 rounded-[15px] shadow-md mb-6">
          <div className="grid grid-cols-4 gap-4 font-semibold text-gray-500 border-b pb-2 mb-2">
            <div>#</div>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
          </div>

          {loading && <div className="py-6 text-gray-500">Loading admins…</div>}
          {err && !loading && <div className="py-6 text-red-600">{err}</div>}
          {!loading && !err && admins.length === 0 && (
            <div className="py-6 text-gray-500">No admins found.</div>
          )}

          {!loading &&
            !err &&
            admins.map((a, idx) => (
              <div
                key={a.id ?? `${a.email}-${idx}`}
                className="grid grid-cols-4 gap-4 py-2 border-b text-gray-700"
              >
                <div>{idx + 1}</div>
                <div>{a.name ?? "—"}</div>
                <div>{a.email}</div>
                <div>{a.role ?? "admin"}</div>
              </div>
            ))}
        </div>

        {/* Inline Add Admin form card */}
        <div className="bg-white p-4 rounded-[15px] shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Admin</h3>

          {formErr && <div className="mb-3 text-sm text-red-600">{formErr}</div>}
          {formOk && <div className="mb-3 text-sm text-green-700">{formOk}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="e.g., Jane Admin"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="jane@company.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="••••••••"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#1D1B20] text-white font-semibold"
                disabled={saving}
              >
                {saving ? "Creating…" : "Create admin"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
