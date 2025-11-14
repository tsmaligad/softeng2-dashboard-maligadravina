// src/components/UserList.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { api } from "../utils/api";
import searchIcon from "../assets/search.png"

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",     // "user" = Customer
    is_active: 1,     // 1 = active, 0 = inactive
  });

  const [editingId, setEditingId] = useState(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const list = await api.getUsers(search); // backend supports ?q=
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        is_active: parseInt(form.is_active, 10),
      };

      if (editingId) {
        await api.updateUser(editingId, payload);
      } else {
        await api.createUser(payload);
      }

      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        is_active: 1,
      });
      setEditingId(null);
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role || "user",
      is_active: u.is_active ? 1 : 0,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  return (
    <>
      {/* ===== Scoped CSS to mimic Inventory / RawMaterials ===== */}
      <style>{`
        /* Page bg like Inventory */
        div.flex-1.p-6 {
          background: #f5efef;
        }

        /* Card around table */
        div.flex-1.p-6 .table-wrapper {
          border: 1px solid #eadbd8;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          border-radius: 16px !important;
        }

        /* Form card */
        div.flex-1.p-6 form.user-form {
          background: #fff;
          border: 1px solid #eadbd8;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }

        /* Inputs/selects inside form */
        div.flex-1.p-6 form.user-form input,
        div.flex-1.p-6 form.user-form select {
          border-color: #bdaaa2 !important;
          border-radius: 9999px !important;
          height: 40px;
        }

        /* Primary button in form */
        div.flex-1.p-6 form.user-form button[type="submit"] {
          background: #ffc6c6 !important;
          color: #332601 !important;
          border: 1px solid #e7b2b2;
          border-radius: 9999px !important;
          padding: 10px 20px;
          font-weight: 600;
        }
        div.flex-1.p-6 form.user-form button[type="submit"]:hover {
          filter: brightness(0.97);
        }

        /* Search pill */
        div.flex-1.p-6 .search-inner {
  border: 1px solid #bdaaa2 !important;
  border-radius: 9999px !important;
  overflow: hidden;      /* ✨ fixes the black line */
}

        div.flex-1.p-6 .search-input {
          height: 40px;
          border: none;
        }
        div.flex-1.p-6 .search-btn {
  background: #ffc6c6;
  border: none !important;       /* ✨ no borders at all */
  outline: none !important;      /* ✨ remove black focus halo */
  box-shadow: none !important;   /* ✨ remove hover shadow */
}
div.flex-1.p-6 .search-btn:focus {
  outline: none !important;
  box-shadow: none !important;
}


        /* Table header (soft peach) */
        div.flex-1.p-6 table.user-table thead tr {
          background: #ffe1e1 !important;
        }
        div.flex-1.p-6 table.user-table thead th {
          color: #4a3600;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-color: #f3d6d6 !important;
        }

        /* Table rows */
        div.flex-1.p-6 table.user-table tbody td {
          border-color: #f1e3e3 !important;
        }
        div.flex-1.p-6 table.user-table tbody tr:hover {
          background: #fcf7f7;
        }

        /* Action buttons */
        div.flex-1.p-6 table.user-table tbody button {
          border-radius: 9999px !important;
          padding: 6px 12px;
          border: 1px solid transparent;
        }
        div.flex-1.p-6 table.user-table tbody button.btn-edit {
          background: #f2e4c4 !important;
          color: #4a3600 !important;
          border-color: #f5d987;
        }
        div.flex-1.p-6 table.user-table tbody button.btn-delete {
          background: #ffd1d1 !important;
          color: #7a1f1f !important;
          border-color: #f3bbbb;
        }

        /* Heading tone */
        div.flex-1.p-6 > h1 {
          color: #332601;
          margin-top: 6px;
          margin-bottom: 18px;
        }
      `}</style>

      <div className="flex bg-[#F5EFEF] min-h-screen">
        <Sidebar />

        <div className="flex-1 p-6 mt-[30px] ml-[30px] mr-[30px]">
          <h1 className="text-3xl font-bold mb-3">User Management</h1>

          {/* ADD / EDIT FORM – 1st row: name/email/role; 2nd row: password/active/button */}
          <form
  onSubmit={handleSave}
  className="user-form bg-white shadow-md p-4 mb-6 flex flex-wrap gap-4 rounded-lg"
>
  {/* ROW 1 — Full name, email, password */}
  <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
    <input
      type="text"
      placeholder="Full name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      className="border px-3 py-2 flex-1 min-w-[220px]"
    />

    <input
      type="email"
      placeholder="Email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      className="border px-3 py-2 flex-1 min-w-[220px]"
    />

    <input
      type="password"
      placeholder={editingId ? "New Password (optional)" : "Password"}
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      className="border px-3 py-2 flex-1 min-w-[220px]"
    />
  </div>

  {/* ROW 2 — Role, Active/Inactive, Button */}
<div className="flex w-full flex-wrap md:flex-nowrap gap-4 items-center justify-between">

{/* LEFT SIDE (dropdowns) */}
<div className="flex gap-4 flex-wrap">
  <select
    value={form.role}
    onChange={(e) => setForm({ ...form, role: e.target.value })}
    className="border pr-[10px] px-3 py-2 min-w-[200px]"
  >
    <option value="user">Customer</option>
    <option value="admin">Admin</option>
  </select>

  <select
    value={form.is_active}
    onChange={(e) => setForm({ ...form, is_active: e.target.value })}
    className="border px-3 py-2 min-w-[200px]"
  >
    <option value={1}>Active</option>
    <option value={0}>Inactive</option>
  </select>
</div>

{/* RIGHT SIDE (button) */}
<button
  type="submit"
  className="px-6 py-2 min-w-[150px]"
>
  {editingId ? "Update" : "Add User"}
</button>
</div>

</form>


          {/* SEARCH BAR – like Inventory */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="mt-[20px] flex w-full rounded-full overflow-hidden shadow-sm border search-inner">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 text-sm focus:outline-none search-input"
              />
              <button type="submit" className="px-4 flex items-center justify-center search-btn">
  <img src={searchIcon} alt="search" className="w-[18px] h-[18px] opacity-70" />
</button>
            </div>
          </form>

          {/* USERS TABLE – styled like Inventory table */}
          <div className=" mt-[20px] bg-white shadow-md rounded-lg overflow-hidden table-wrapper mt-[10px]">
            <table className="w-full text-left border-collapse user-table">
              <thead>
                <tr>
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Role</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Created</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">
                      Loading…
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{u.id}</td>
                      <td className="p-3 border">{u.name}</td>
                      <td className="p-3 border">{u.email}</td>
                      <td className="p-3 border capitalize">{u.role}</td>
                      <td className="p-3 border">
                        {u.is_active ? "Active" : "Inactive"}
                      </td>
                      <td className="p-3 border">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-3 border text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(u)}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      No users found
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
}
