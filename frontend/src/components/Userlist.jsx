import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import Sidebar from "./Sidebar.jsx";
import search from "../assets/search.png";

function formatDateLong(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


const UserList = () => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    role: "user",
    is_active: true,
    password: "",
  });
  const isEditing = useMemo(() => form.id !== null, [form.id]);
  const [viewUser, setViewUser] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getUsers(q);
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();   // stop page refresh
    load();               // runs your fetch using `q`
  }
  

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (isEditing) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          is_active: form.is_active ? 1 : 0,
        };
        if (form.password) payload.password = form.password;
        await api.updateUser(form.id, payload);
      } else {
        await api.createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          is_active: form.is_active ? 1 : 0,
        });
      }
      setForm({
        id: null,
        name: "",
        email: "",
        role: "user",
        is_active: true,
        password: "",
      });
      await load();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      alert(e.message);
    }
  }

  function startEdit(u) {
    setForm({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      is_active: !!u.is_active,
      password: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id) {
    if (!confirm("Delete this user?")) return;
    try {
      await api.deleteUser(id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="flex gap-10 min-h-screen bg-gradient-to-b from-[#FAF9F7] to-[#F3F1ED] text-[#332601]">
      <Sidebar />

      <main className="flex-1">
        <div className="ml-[30px] mr-[30px] mx-auto max-w-6xl px-8 py-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#332601] mb-8 mt-[30px]">
            User Management
          </h1>

          <hr className="border-t border-[#8b7760]" />

          {/* Search */}
         {/* <div className="pt-[42px] mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email…"
              className="w-full sm:max-w-md rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-[#4A3600] focus:outline-none"
            />
            <button
              onClick={load}
              className="px-2 py-1 bg-[#4A3600] text-white rounded mb-[30px]"
            >
              Search
            </button>
          </div> */}



          {/* Create / Edit Form */}
          <form
            onSubmit={onSubmit}
            className="mb-10 grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-6 rounded-2xl shadow-md border border-gray-200 mt-[40px]"
          >
            <input
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#4A3600] focus:outline-none md:col-span-2"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              type="email"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#4A3600] focus:outline-none md:col-span-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <select
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#4A3600] focus:outline-none"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
            </select>

            <label className="flex items-center gap-2 text-sm px-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
              />
              <span>Active</span>
            </label>

            <input
              type="password"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#4A3600] focus:outline-none md:col-span-3"
              placeholder={isEditing ? "New password (optional)" : "Password"}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required={!isEditing}
            />

            <button
              type="submit"
              className="rounded-xl bg-[#4A3600] text-white px-5 py-2.5 text-sm font-medium shadow-md hover:bg-[#3a2a00] transition md:col-span-3"
            >
              {isEditing ? "Save Changes" : "Add User"}
            </button>
          </form>

          {/* Search */}
<form
  onSubmit={handleSearchSubmit}
  className="pt-[42px] flex items-center justify-center"
>
  <div className="flex w-full sm:max-w-4xl rounded overflow-hidden shadow-sm border border-gray-300">
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Search name or email"
      className="flex-1 px-4 py-2 text-sm focus:outline-none"
    />
    <button
      type="submit"   // ✅ submit triggers Enter key too
      className="bg-[#FFC6C6] px-4 flex items-center justify-center"
      aria-label="Search"
      title="Search"
    >
      <img src={search} alt="" className="w-[20px] h-[20px]" />
    </button>
  </div>
</form>



          


          {/* Users Table */}
          <div className="rounded-2xl bg-white shadow-md border border-gray-200 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className=" text-gray-700 text-gray-700 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-center" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-6 py-6 text-center text-red-600"
                      colSpan={5}
                    >
                      {error}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-center" colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-3">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-3 capitalize">
                        {u.role === "user" ? "Customer" : u.role}
                      </td>
                      <td className="px-6 py-3">
                        {u.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {formatDateLong(u.created_at)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewUser(u)}
                            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-100 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => startEdit(u)}
                            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-100 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(u.id)}
                            className="rounded-lg border px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* View Modal */}
          {viewUser && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">User Details</h2>
                  <button
                    onClick={() => setViewUser(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {viewUser.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {viewUser.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>{" "}
                    {viewUser.role === "user" ? "Customer" : viewUser.role}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {viewUser.is_active ? "Active" : "Inactive"}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {formatDateLong(viewUser.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> {viewUser.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserList;
