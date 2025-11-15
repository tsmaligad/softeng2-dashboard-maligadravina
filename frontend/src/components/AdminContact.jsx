// src/components/AdminContact.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { api } from "../utils/api";
import searchIcon from "../assets/search.png";
import MAdminContact from "./modals/MAdminContact"; // ✅ modal import
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { FiCheck, FiTrash2 } from "react-icons/fi";


const CATEGORY_OPTIONS = [
  "All",
  "Order Concern",
  "Product Inquiry",
  "Partnership",
  "Others",
];

// ✅ NEW: status filter options
const STATUS_FILTER_OPTIONS = [
  { key: "All", label: "All statuses" },
  { key: "Normal", label: "Normal" }, // new / no status
  { key: "Solved", label: "Solved" }, // replied
  { key: "Trash", label: "Trash" },   // archived
];

export default function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // category filter
  const [statusFilter, setStatusFilter] = useState("Normal"); // ✅ status filter

  const [activeMsg, setActiveMsg] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // reply state
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ controls modal

  // ---- HELPER: apply tab + search + status filter (FRONTEND) ----
  const applyFilter = (list, category, q, statusFilterKey) => {
    let result = Array.isArray(list) ? [...list] : [];

    // 1) Category filter (tab)
    if (category && category !== "All") {
      result = result.filter((m) => (m.inquiry_type || "") === category);
    }

    // 2) Search filter
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

    // 3) ✅ Status filter
    if (statusFilterKey && statusFilterKey !== "All") {
      result = result.filter((m) => {
        const s = (m.status || "new").toLowerCase(); // treat empty as "new"

        if (statusFilterKey === "Normal") {
          // normal inbox-ish
          return s === "new";
        }
        if (statusFilterKey === "Solved") {
          // replied / done
          return s === "replied";
        }
        if (statusFilterKey === "Trash") {
          // archived / trashed
          return s === "archived";
        }
        return true;
      });
    }

    return result;
  };

  // ---- DATA LOADING ----
  async function loadMessages(
    customFilter = filter,
    customSearch = search,
    customStatus = statusFilter,
    customPage = page
  ) {
    try {
      setLoading(true);
      const params = {};

      const q = (customSearch || "").trim();
      if (q) params.q = q;

      // ⬅️ 20 per page here
      params.page = customPage;
      params.pageSize = 20;

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

      // 🔥 apply tab + search + status filter here
      const filteredList = applyFilter(
        rawList,
        customFilter,
        customSearch,
        customStatus
      );

      setMessages(filteredList);

      // ⬇️ NEW: sync page info from backend
      if (res && typeof res.totalPages !== "undefined") {
        setTotalPages(res.totalPages || 1);
      }
      if (res && typeof res.page !== "undefined") {
        setPage(res.page || 1);
      }
      

      // keep activeMsg in sync if it still exists
      if (activeMsg) {
        const updated = rawList.find((m) => m.id === activeMsg.id);
        if (updated) {
          setActiveMsg(updated);
        } else {
          setActiveMsg(null);
          setReplySubject("");
          setReplyBody("");
          setIsModalOpen(false);
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
    setPage(1);
    loadMessages(filter, search, statusFilter, 1);
  };
  

  const handleFilterChange = (cat) => {
    setFilter(cat);
    setPage(1);
    loadMessages(cat, search, statusFilter, 1);
  };
  

  const handleStatusFilterChange = (statusKey) => {
    setStatusFilter(statusKey);
    setPage(1);
    loadMessages(filter, search, statusKey, 1);
  };
  

  const openMessage = (msg) => {
    setActiveMsg(msg);
    setReplySubject(
      msg.inquiry_type
        ? `Re: Your ${msg.inquiry_type} inquiry`
        : "Re: Your Sweet Treats inquiry"
    );
    setReplyBody("");
    setIsModalOpen(true); // ✅ open modal
  };

  const clearActive = () => {
    setActiveMsg(null);
    setReplySubject("");
    setReplyBody("");
    setIsModalOpen(false); // ✅ close modal
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
    setActiveMsg((prev) => (prev ? { ...prev, status: "replied" } : prev));

    setReplyBody("");

    alert(
      "Your email composer has been opened. After sending, this inquiry is marked as replied."
    );
  };

  const statusBadge = (status) => {
    const s = status || "new";
    if (s === "replied") {
      return (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
          Solved
        </span>
      );
    }
    if (s === "archived") {
      return (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
          Trash
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">
        Normal
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




  






  // --- STATUS HELPERS (for check + trash) ---
const updateMessageStatus = async (id, newStatus) => {
  try {
    // 🔌 If you have a backend endpoint, call it here:
    if (api.updateContactMessageStatus) {
      await api.updateContactMessageStatus(id, { status: newStatus });
    }

    // ✅ Update table list
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );

    // ✅ Update currently open message in modal (if same)
    setActiveMsg((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );
    loadMessages(filter, search, statusFilter, page);


  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Failed to update message status.");
  }
};

// For modal (active message)
const markActiveSolved = () => {
  if (!activeMsg) return;
  updateMessageStatus(activeMsg.id, "replied"); // this matches your "Solved"
};

const moveActiveToTrash = () => {
  if (!activeMsg) return;
  updateMessageStatus(activeMsg.id, "archived"); // this matches your "Trash"
};





  return (
   
  <>
    {/* 🔧 Search bar styling – copy from UserList so it looks the same */}
    <style>{`
      div.flex-1.p-6 .search-inner {
        border: 1px solid #bdaaa2 !important;
        border-radius: 9999px !important;
        overflow: hidden;
      }

      div.flex-1.p-6 .search-input {
        height: 40px;
        border: none;
      }

      div.flex-1.p-6 .search-btn {
        background: #ffc6c6;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }

      div.flex-1.p-6 .search-btn:focus {
        outline: none !important;
        box-shadow: none !important;
      }
    `}</style>






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

            
            <form onSubmit={handleSearchSubmit} className="w-full md:w-1/2 max-w-xl">
  <div className="mt-[4px] flex w-full rounded-full overflow-hidden shadow-sm border search-inner">
    <input
      type="text"
      placeholder="Search by name, email, or message..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-1 px-4 py-2 text-sm focus:outline-none search-input"
    />
    <button
      type="submit"
      className="px-4 flex items-center justify-center search-btn"
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

          {/* ✅ STATUS FILTER ROW */}
          {/* ✅ STATUS FILTER TABS (MUI, same vibe as EditPages) */}
          <div className="mt-4">
  <Box
    sx={{
      width: "100%",
      bgcolor: "#FFFFFF",          // white background like EditPages
      borderRadius: 2,
      px: 1,
      border: "1px solid #EADBD8", // soft outline
    }}
  >
    <Tabs
      value={statusFilter}
      onChange={(_event, newValue) => handleStatusFilterChange(newValue)}
      variant="scrollable"
      scrollButtons
      allowScrollButtonsMobile
      aria-label="status filter tabs"
      TabIndicatorProps={{
        style: {
          backgroundColor: "#4A3600", // same brown underline
          height: 3,
          borderRadius: 9999,
        },
      }}
      sx={{
        "& .MuiTab-root": {
          textTransform: "none",
          fontSize: 14,
          paddingInline: "24px",   // same spacing as EditPages
          paddingBlock: "10px",
          minHeight: 48,
          color: "#6B5B45",        // muted brown text
          fontWeight: 500,
        },
        "& .MuiTab-root.Mui-selected": {
          color: "#4A3600",        // deeper brown when active
          fontWeight: 600,
        },
        "& .MuiTabs-scrollButtons": {
          color: "#4A3600",
        },
      }}
    >
      {STATUS_FILTER_OPTIONS.map((opt) => (
        <Tab
          key={opt.key}
          value={opt.key}
          label={opt.label}
        />
      ))}
    </Tabs>
  </Box>
</div>



          {/* MAIN LAYOUT: TABLE ONLY (details in modal now) */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT: TABLE */}
            <div className="bg-white shadow-md rounded-2xl border border-[#EADBD8] overflow-hidden lg:col-span-2">
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
  <div className="flex flex-col items-center gap-2">

    {/* VIEW button */}
    <button
      type="button"
      onClick={() => openMessage(m)}
      className="inline-flex items-center justify-center rounded-full border border-[#F5D987] bg-[#F2E4C4] px-3 py-1 text-xs font-medium text-[#4A3600] hover:brightness-95 transition"
    >
      View
    </button>

    {/* ICON BUTTONS (Solved + Trash) */}
    <div className="flex items-center justify-center gap-2">

      {/* Mark as Solved */}
      {m.status !== "replied" && m.status !== "archived" && (
  <button
    onClick={() => updateMessageStatus(m.id, "replied")}
    className="p-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:scale-110 transition"
    title="Mark as Solved"
  >
    <FiCheck size={14} />
  </button>
)}


{m.status !== "archived" && (
  <button
    onClick={() => updateMessageStatus(m.id, "archived")}
    className="p-1.5 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110 transition"
    title="Move to Trash"
  >
    <FiTrash2 size={14} />
  </button>
)}


    </div>
  </div>
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

{/* ⬇️ PAGINATION CONTROLS */}
<div className="flex items-center justify-between px-4 py-3 border-t border-[#F1E3E3] text-xs">
  {/* PREVIOUS */}
  <button
    type="button"
    onClick={() => {
      if (page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        loadMessages(filter, search, statusFilter, newPage);
      }
    }}
    disabled={page <= 1}
    className="
      px-4 py-1.5 rounded-full border 
      bg-[#FFE1E1] border-[#F3D6D6]
      text-[#4A3600] font-medium
      hover:bg-[#FFD6D6] hover:border-[#E7B2B2]
      disabled:cursor-not-allowed
      transition
    "
  >
    ← Previous
  </button>

  {/* PAGE NUMBER */}
  <span className="text-[#4A3600] font-medium">
    Page {page} of {totalPages}
  </span>

  {/* NEXT */}
  <button
    type="button"
    onClick={() => {
      if (page < totalPages) {
        const newPage = page + 1;
        setPage(newPage);
        loadMessages(filter, search, statusFilter, newPage);
      }
    }}
    disabled={page >= totalPages}
    className="
      px-4 py-1.5 rounded-full border 
      bg-[#FFE1E1] border-[#F3D6D6]
      text-[#4A3600] font-medium
      hover:bg-[#FFD6D6] hover:border-[#E7B2B2]
      disabled:cursor-not-allowed
      transition
    "
  >
    Next →
  </button>
</div>



              




              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL: full message details + reply */}
            {/* ✅ MODAL: full message details + reply */}
            <MAdminContact
        isOpen={isModalOpen}
        closeModal={clearActive}
        message={activeMsg}
        replySubject={replySubject}
        setReplySubject={setReplySubject}
        replyBody={replyBody}
        setReplyBody={setReplyBody}
        sendingReply={sendingReply}
        handleSendReply={handleSendReply}
        statusBadge={statusBadge}
        typeChip={typeChip}
        formatDateTime={formatDateTime}
        // ⬇️ NEW: actions for the check + trash inside modal
        onMarkSolved={markActiveSolved}
        onMoveToTrash={moveActiveToTrash}
      />
    </>
  );
}

