"use client"; // required: useState, useEffect, sessionStorage, axios, event handlers

import { useState, useEffect } from "react";
import axios from "axios";
import VerticalMenuAdmin from "../../components/verticalmenuadmin";
import VerticalMenuAdminmenu from "../../components/verticalmenuadminmobile";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LABEL = "text-[0.65rem] uppercase tracking-widest font-bold";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ── Confirmation modal ──
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-black w-80 p-6 flex flex-col gap-4">
        <p className={`${LABEL} text-gray-400`}>Confirm Action</p>
        <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        <div className="flex border border-black">
          <button onClick={onCancel} className={`flex-1 py-2 ${LABEL} text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors border-r border-black`}>Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2 ${LABEL} bg-black text-white hover:bg-gray-900 cursor-pointer
           transition-colors`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function ManageMessages({ setPage }) {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("all"); // all | unread | read
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState(null); // { type, id } | null

  // ── Fetch ──
  useEffect(() => {
    const token   = sessionStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${API_URL}/api/admin/messages`, { headers })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.messages ?? [];
        setMessages(data);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ──
  const filtered = messages.filter((m) =>
    filter === "all" ? true : filter === "unread" ? !m.read : m.read
  );
  const unreadCount = messages.filter((m) => !m.read).length;

  // ── Actions ──
  const markRead = (id) => {
    const token   = sessionStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };
    axios.patch(`${API_URL}/api/admin/messages/${id}/read`, {}, { headers }).catch(() => {});
    setMessages((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m));
    if (selected?._id === id) setSelected((s) => ({ ...s, read: true }));
  };

  const deleteMsg = (id) => {
    const token   = sessionStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };
    axios.delete(`${API_URL}/api/admin/messages/${id}`, { headers }).catch(() => {});
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
    setConfirm(null);
  };

  const openMessage = (msg) => {
    setSelected(msg);
  };

  const markAllRead = () => {
    messages.forEach((m) => { if (!m.read) markRead(m._id); });
    setConfirm(null);
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── TITLE ── */}
      <div className="border-b border-black px-6 sm:px-12 pt-8 pb-6 flex items-end justify-between">
        <div>
          <p className={`${LABEL} text-gray-400 mb-1`}>Baha Architecture</p>
          <h1 className="text-2xl font-bold uppercase tracking-widest">Messages</h1>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className={`${LABEL} bg-black text-white px-2 py-0.5`}>{unreadCount} unread</span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={() => setConfirm({ type: "markAll" })}
              className={`${LABEL} text-gray-400 hover:text-black transition-colors border border-transparent hover:border-black px-2 py-0.5`}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-px  text-white border-b border-black">
        {[
          { label: "Total", value: messages.length, note: "all messages" },
          { label: "Unread", value: unreadCount, note: "inbox" },
          { label: "Read", value: messages.length - unreadCount, note: "archived" },
          { label: "Senders", value: "—", note: "contacts" },
        ].map((s) => (
          <div key={s.label} className="bg-white px-6 py-5 flex flex-col gap-1">
            <span className={`${LABEL}  text-white`}>{s.label}</span>
            <span className="text-3xl font-bold tracking-tight">{s.value}</span>
            <span className={`${LABEL}  text-white`}>{s.note}</span>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ── */}
      <div className="border-b border-black flex">
        {[
          { key: "all",    label: `All (${messages.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "read",   label: `Read (${messages.length - unreadCount})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-6 py-3 ${LABEL} cursor-pointer transition-colors duration-200
              ${filter === f.key ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        <VerticalMenuAdmin />

        {/* ── MESSAGE LIST + DETAIL ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* LIST */}
          <div className={`flex flex-col border-r border-black overflow-y-auto
            ${selected ? "hidden sm:flex sm:w-72 lg:w-80" : "flex w-full sm:w-72 lg:w-80"}`}
          >
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <span className={`${LABEL} text-gray-300`}>Loading…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-8">
                <span className={`${LABEL} text-gray-300 text-center`}>No messages in this category</span>
              </div>
            ) : (
              filtered.map((msg, i) => (
                <button
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left px-5 py-4 border-b border-black cursor-pointer transition-colors duration-150
                    ${selected?._id === msg._id ? "bg-black text-white" : "bg-white hover:bg-gray-50"}
                    ${i === 0 ? "" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read && selected?._id !== msg._id && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-black mt-0.5" />
                      )}
                      <span className={`${LABEL} truncate
                        ${selected?._id === msg._id ? "text-white" : "text-gray-800"}`}>
                        {msg.name}
                      </span>
                    </div>
                    <span className={`flex-shrink-0 text-[0.55rem] font-bold uppercase tracking-wider
                      ${selected?._id === msg._id ? "text-gray-400" : "text-gray-300"}`}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs font-semibold mb-0.5 truncate
                    ${selected?._id === msg._id ? "text-gray-300" : "text-gray-600"}`}>
                    {msg.subject}
                  </p>
                  <p className={`text-xs truncate
                    ${selected?._id === msg._id ? "text-gray-500" : "text-gray-400"}`}>
                    {msg.message}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* DETAIL PANEL */}
          <div className={`flex-1 flex flex-col overflow-y-auto
            ${selected ? "flex" : "hidden sm:flex"}`}
          >
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 px-8">
                <div className="border border-dashed border-gray-200 px-10 py-10 flex flex-col items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200">
                    <path d="M4 4h16v13H4z"/><path d="M4 4l8 8 8-8"/>
                  </svg>
                  <span className={`${LABEL} text-gray-200`}>Select a message</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">

                {/* Detail header */}
                <div className="border-b border-black px-6 sm:px-8 pt-6 pb-5 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">

                    {/* Back button (mobile) */}
                    <button
                      onClick={() => setSelected(null)}
                      className={`sm:hidden ${LABEL} text-gray-400 hover:text-black cursor-pointer mb-2 flex items-center gap-1 transition-colors`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2L4 6l4 4"/></svg>
                      Back
                    </button>

                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-bold uppercase tracking-widest">{selected.name}</h2>
                      {selected.read
                        ? <span className={`${LABEL} text-gray-300 border border-gray-200 px-2 py-0.5`}>Read</span>
                        : <span className={`${LABEL} bg-black text-white px-2 py-0.5`}>Unread</span>
                      }
                    </div>
                    <a
                      href={`mailto:${selected.email}`}
                      className={`${LABEL} text-gray-400 hover:text-black transition-colors`}
                    >
                      {selected.email}
                    </a>
                    <p className={`${LABEL} text-gray-300 mt-1`}>
                      {formatDate(selected.createdAt)} · {formatTime(selected.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 border border-black">
                    {!selected.read && (
                      <button
                        onClick={() => markRead(selected._id)}
                        className={`px-3 py-2 ${LABEL} text-gray-500 hover:bg-black hover:text-white cursor-pointer transition-colors border-r border-black`}
                        title="Mark as read"
                      >
                        ✓ Read
                      </button>
                    )}

                    <button
                      onClick={() => setConfirm({ type: "delete", id: selected._id })}
                      className={`px-3 py-2 ${LABEL} text-gray-500 hover:bg-black hover:text-white cursor-pointer transition-colors`}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <div className="px-6 sm:px-8 py-4 border-b border-black">
                  <p className={`${LABEL} text-gray-400 mb-1`}>Name</p>
                  {/* NOTE: uses selected.firstName here but selected.name everywhere else above —
                      pre-existing inconsistency, left as-is. Change to selected.name if your API
                      doesn't return a separate firstName field. */}
                  <p className="text-base font-bold tracking-tight">{selected.firstName}</p>
                </div>

                {/* Body */}
                <div className="px-6 sm:px-8 py-6 flex-1">
                  <p className={`${LABEL} text-gray-400 mb-3`}>Message</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── MOBILE BOTTOM MENU ── */}
      <VerticalMenuAdminmenu />

      {/* ── CONFIRM MODAL ── */}
      {confirm?.type === "delete" && (
        <ConfirmModal
          message="Are you sure you want to delete this message? "
          onConfirm={() => deleteMsg(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === "markAll" && (
        <ConfirmModal
          message={`Are you sure you want to mark all ${unreadCount} unread messages as read?`}
          onConfirm={markAllRead}
          onCancel={() => setConfirm(null)}
        />
      )}

    </div>
  );
}