// src/components/modals/MAdminContact.jsx
import React from "react";
import "./Modal.css";
import { FiCheck, FiTrash2 } from "react-icons/fi";

const MAdminContact = ({
  isOpen,
  closeModal,
  message,
  replySubject,
  setReplySubject,
  replyBody,
  setReplyBody,
  sendingReply,
  handleSendReply,
  onMarkSolved,
  onMoveToTrash,
}) => {
  if (!isOpen || !message) return null;

  const onSubmit = (e) => {
    handleSendReply(e);
  };

  const fullName =
    `${message.first_name || ""} ${message.last_name || ""}`.trim() ||
    "Unnamed Sender";

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-content admin-contact-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#332601]">
                {fullName}
              </h2>
              {message.email && (
                <a
                  href={`mailto:${message.email}`}
                  className="text-xs text-blue-700 underline break-all"
                >
                  {message.email}
                </a>
              )}
              {message.contact_number && (
                <div className="text-xs text-[#6B5B45] mt-1">
                  {message.contact_number}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="text-xs text-[#6B5B45] hover:text-[#332601]"
            >
              Close ✕
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 items-center text-[11px] text-[#6B5B45]">
            {message.inquiry_type && (
              <span className="inline-flex items-center rounded-full bg-[#FFE1E1] px-2 py-0.5 text-[11px] font-medium text-[#4A3600]">
                {message.inquiry_type}
              </span>
            )}
            {message.created_at && (
              <span>{new Date(message.created_at).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* MESSAGE DISPLAY */}
        <div className="mb-4 max-h-40 overflow-y-auto rounded-lg bg-[#FBF3F3]/60 border border-[#E9DDD1] px-3 py-2 text-xs text-[#332601] whitespace-pre-wrap">
          {message.message || "No message content."}
        </div>

        {/* REPLY FORM */}
        <form onSubmit={onSubmit} className="mt-auto space-y-2 text-xs">
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

          {/* BUTTONS ROW */}
          <div className="flex items-center justify-between pt-1">
            {/* LEFT SIDE: Solved + Trash */}
            <div className="flex items-center gap-3">
  {(() => {
    const s = message.status || "new"; // treat empty as "Normal"

    // ✅ SHOW CHECK ONLY FOR "Normal"
    if (s !== "replied" && s !== "archived") {
      return (
        <>
          <button
            type="button"
            title="Mark as Solved"
            className="p-2 rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:scale-110 transition"
            onClick={() => onMarkSolved && onMarkSolved()}
          >
            <FiCheck size={16} />
          </button>

          <button
            type="button"
            title="Move to Trash"
            className="p-2 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110 transition"
            onClick={() => onMoveToTrash && onMoveToTrash()}
          >
            <FiTrash2 size={16} />
          </button>
        </>
      );
    }

    // ✅ "Solved" (replied) → ONLY TRASH
    if (s === "replied") {
      return (
        <button
          type="button"
          title="Move to Trash"
          className="p-2 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110 transition"
          onClick={() => onMoveToTrash && onMoveToTrash()}
        >
          <FiTrash2 size={16} />
        </button>
      );
    }

    // ✅ "Trash" (archived) → NO BUTTONS
    return null;
  })()}
</div>



            {/* RIGHT SIDE: Cancel + Send */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-[#D7C9B9] bg-white px-4 py-1.5 text-xs text-[#332601] hover:bg-[#F3F1ED]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={sendingReply}
                className="rounded-full bg-[#4A3600] px-5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[#3A2A00] disabled:opacity-60"
              >
                {sendingReply ? "Sending…" : "Send Reply"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MAdminContact;
