// src/components/AdminContact.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { api } from "../utils/api";
import searchIcon from "../assets/search.png";

const CATEGORY_OPTIONS = [
  "All",
  "Order Concern",
  "Product Inquiry",
  "Partnership",
  "Others",
];

export default function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [activeMsg, setActiveMsg] = useState(null);

  // reply state
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // ---- HELPER: apply tab + search filter (FRONTEND) ----
  const applyFilter = (list, category, q) => {
    let result = Array.isArray(list) ? [...list] : [];

    // Category filter (tab)
    if (category && category !== "All") {
      result = result.filter(
        (m) => (m.inquiry_type || "") === category
      );
    }

    // Search filter
    const term = (q || "").trim().toLowerCase();
    if (term) {
      result = result.filter((m) => {
        const fullName = `${m.first_name || ""} ${m.last_name || ""}`;
        return (
          fullName.toLowerCase().includes(term) ||
          (m.email || "").toLowerCase().includes(term) ||
          (m.message || "").toLowerCase().includes(term) ||
          (m.contact_number || "").toLowerCase().includes(term)
        );
      });
    }

    return result;
  };

  // ---- DATA LOADING ----
  async function loadMessages(customFilter = filter, customSearch = search) {
    try {
      setLoading(true);
      const params = {};

      const q = (customSearch || "").trim();
      if (q) params.q = q;

      // ⛔ Do NOT rely on backend inquiry_type; filter on frontend instead
      // if (customFilter && customFilter !== "All") {
      //   params.inquiry_type = customFilter;
      // }

      const res = await (api.getContactMessages
        ? api.getContactMessages(params)
        : Promise.resolve([]));

      const rawList = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res)
        ? res
        : [];

      // newest first
      rawList.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });

      // 🔥 apply tab + search filter here
      const filteredList = applyFilter(rawList, customFilter, customSearch);

      setMessages(filteredList);

      // keep activeMsg in sync if it still exists
      if (activeMsg) {
        const updated = rawList.find((m) => m.id === activeMsg.id);
        if (updated) {
          setActiveMsg(updated);
        } else {
          // if it disappeared (e.g., no longer matches filter), close the detail
          setActiveMsg(null);
          setReplySubject("");
          setReplyBody("");
        }
      }
    } catch (err) {
      console.error("Failed to load contact messages:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMessages(filter, search);
  };

  const handleFilterChange = (cat) => {
    setFilter(cat);
    // reload and apply filter as "tab"
    loadMessages(cat, search);
  };

  const openMessage = (msg) => {
    setActiveMsg(msg);
    setReplySubject(
      msg.inquiry_type
        ? `Re: Your ${msg.inquiry_type} inquiry`
        : "Re: Your Sweet Treats inquiry"
    );
    setReplyBody("");
  };

  const clearActive = () => {
    setActiveMsg(null);
    setReplySubject("");
    setReplyBody("");
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeMsg) return;
  
    if (!replySubject.trim() || !replyBody.trim()) {
      alert("Please fill in both subject and message before sending.");
      return;
    }
  
    if (!activeMsg.email) {
      alert("This message has no email address to reply to.");
      return;
    }
  
    // ✉️ Open default email app with subject + body
    const mailto = `mailto:${encodeURIComponent(
      activeMsg.email
    )}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(
      replyBody
    )}`;
  
    window.location.href = mailto;
  
    // ✅ Locally mark as replied so the badge changes
    setMessages((prev) =>
      prev.map((m) =>
        m.id === activeMsg.id ? { ...m, status: "replied" } : m
      )
    );
    setActiveMsg((prev) =>
      prev ? { ...prev, status: "replied" } : prev
    );
  
    // clear textarea after
    setReplyBody("");
  
    alert("Your email composer has been opened. After sending, this inquiry is marked as replied.");
  };
  




  const statusBadge = (status) => {
    const s = status || "new";
    if (s === "replied") {
      return (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
          Replied
        </span>
      );
    }
    if (s === "archived") {
      return (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
          Archived
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">
        New
      </span>
    );
  };

  const typeChip = (type) => {
    if (!type) return null;
    return (
      <span className="inline-flex items-center rounded-full bg-[#FFE1E1] px-2 py-0.5 text-[11px] font-medium text-[#4A3600]">
        {type}
      </span>
    );
  };

  const formatDateTime = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="flex min-h-screen bg-[#F5EFEF]">
      <Sidebar />

      <div className="flex-1 p-6 mt-[30px] ml-[30px] mr-[30px]">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-3 text-[#332601]">
          Contact Messages
        </h1>
        <p className="text-sm text-[#6B5B45] mb-4">
          View inquiries sent from the contact form, filter by category, and
          reply via email.
        </p>

        {/* SEARCH + FILTER ROW */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-4">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full md:w-1/2 max-w-xl"
          >
            <div className="mt-[4px] flex w-full rounded-full overflow-hidden shadow-sm border border-[#BDAAA2] bg-white">
              <input
                type="text"
                placeholder="Search by name, email, or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 text-sm focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="px-4 flex items-center justify-center bg-[#FFC6C6]"
              >
                <img
                  src={searchIcon}
                  alt="search"
                  className="w-[18px] h-[18px] opacity-70"
                />
              </button>
            </div>
          </form>

          {/* Category filter pills (tabs) */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleFilterChange(cat)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[13px] transition ${
                  filter === cat
                    ? "bg-[#FFC6C6] border-[#E7B2B2] font-semibold text-[#332601]"
                    : "bg-[#FFFAF8] border-[#DECAC2] text-[#4A3600] hover:bg-[#FFEFEF]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN LAYOUT: TABLE + DETAIL */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: TABLE */}
          <div className="bg-white shadow-md rounded-2xl border border-[#EADBD8] overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-sm font-semibold text-[#332601]">
                Messages
              </h2>
              {loading && (
                <span className="text-xs text-gray-500">Loading…</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FFE1E1]">
                    <th className="px-3 py-2 border border-[#F3D6D6] text-xs">
                      Date
                    </th>
                    <th className="px-3 py-2 border border-[#F3D6D6] text-xs">
                      Sender
                    </th>
                    <th className="px-3 py-2 border border-[#F3D6D6] text-xs">
                      Inquiry
                    </th>
                    <th className="px-3 py-2 border border-[#F3D6D6] text-xs">
                      Status
                    </th>
                    <th className="px-3 py-2 border border-[#F3D6D6] text-xs">
                      Message
                    </th>
                    <th className="px-3 py-2 border border-[#F3D6D6] text-xs text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        Loading messages…
                      </td>
                    </tr>
                  ) : messages.length ? (
                    messages.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-[#FCF7F7] transition-colors"
                      >
                        {/* DATE */}
                        <td className="px-3 py-2 border border-[#F1E3E3] align-top">
                          <div className="text-xs text-[#4A3600]">
                            {formatDateTime(m.created_at)}
                          </div>
                        </td>

                        {/* SENDER (name + email) */}
                        <td className="px-3 py-2 border border-[#F1E3E3] align-top">
                          <div className="font-medium text-xs text-[#332601]">
                            {(m.first_name + " " + m.last_name).trim() || "—"}
                          </div>
                          <div className="text-[11px] text-[#6B5B45] break-all">
                            {m.email || "—"}
                          </div>
                          {m.contact_number && (
                            <div className="text-[11px] text-[#6B5B45]">
                              {m.contact_number}
                            </div>
                          )}
                        </td>

                        {/* INQUIRY TYPE */}
                        <td className="px-3 py-2 border border-[#F1E3E3] align-top">
                          {typeChip(m.inquiry_type)}
                        </td>

                        {/* STATUS */}
                        <td className="px-3 py-2 border border-[#F1E3E3] align-top">
                          {statusBadge(m.status)}
                        </td>

                        {/* MESSAGE preview */}
                        <td className="px-3 py-2 border border-[#F1E3E3] align-top">
                          <div className="text-[11px] text-[#6B5B45] line-clamp-2">
                            {m.message || "—"}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-3 py-2 border border-[#F1E3E3] align-top text-center">
                          <button
                            type="button"
                            onClick={() => openMessage(m)}
                            className="inline-flex items-center justify-center rounded-full border border-[#F5D987] bg-[#F2E4C4] px-3 py-1 text-xs font-medium text-[#4A3600] hover:brightness-95"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No messages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: DETAILS + REPLY */}
          <div className="bg-white shadow-md rounded-2xl border border-[#EADBD8] p-5 flex flex-col min-h-[320px]">
            {!activeMsg ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-[#6B5B45] px-4">
                <p className="mb-1 font-medium">
                  Select a message from the table to view details.
                </p>
                <p className="text-xs">
                  You’ll be able to see the full message and send a reply via
                  email here.
                </p>
              </div>
            ) : (
              <>
                {/* Header / meta */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-[#332601]">
                        {`${activeMsg.first_name || ""} ${
                          activeMsg.last_name || ""
                        }`.trim() || "Unnamed Sender"}
                      </h2>
                      {activeMsg.email && (
                        <a
                          href={`mailto:${activeMsg.email}`}
                          className="text-xs text-blue-700 underline break-all"
                        >
                          {activeMsg.email}
                        </a>
                      )}
                      {activeMsg.contact_number && (
                        <div className="text-xs text-[#6B5B45] mt-1">
                          {activeMsg.contact_number}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={clearActive}
                      className="text-xs text-[#6B5B45] hover:text-[#332601]"
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    {typeChip(activeMsg.inquiry_type)}
                    {statusBadge(activeMsg.status)}
                    <span className="text-[11px] text-[#6B5B45]">
                      {formatDateTime(activeMsg.created_at)}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4 max-h-40 overflow-y-auto rounded-lg bg-[#FBF3F3]/60 border border-[#E9DDD1] px-3 py-2 text-xs text-[#332601] whitespace-pre-wrap">
                  {activeMsg.message || "No message content."}
                </div>

                {/* Reply form */}
                <form
                  onSubmit={handleSendReply}
                  className="mt-auto space-y-2 text-xs"
                >
                  <div>
                    <label className="mb-1 block font-medium text-[#332601]">
                      Reply Subject
                    </label>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full rounded-full border border-[#BDAAA2] bg-[#FDFBF9] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A3600]"
                      placeholder="Re: Your Sweet Treats inquiry"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-[#332601]">
                      Reply Message
                    </label>
                    <textarea
                      rows={4}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      className="w-full rounded-2xl border border-[#BDAAA2] bg-[#FDFBF9] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A3600] resize-none"
                      placeholder="Type your reply here..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={clearActive}
                      className="rounded-full border border-[#D7C9B9] bg-white px-4 py-1.5 text-xs text-[#332601] hover:bg-[#F3F1ED]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="rounded-full bg-[#4A3600] px-5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[#3A2A00] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {sendingReply ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
