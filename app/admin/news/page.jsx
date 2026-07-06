"use client"; // required: useState, useEffect, sessionStorage, axios, event handlers

import { useState, useEffect } from "react";
import axios from "axios";
import VerticalMenuAdmin from "../../components/verticalmenuadmin";
import Verticalmenuadminmobile from "../../components/verticalmenuadminmobile";

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

// Reads the token fresh each time it's called, and only ever gets called
// from useEffect or event handlers — both client-only, so this is safe
// under Next.js SSR (unlike reading sessionStorage directly in render).
function getAuthHeaders() {
  const token = sessionStorage.getItem("adminToken");
  return { Authorization: `Bearer ${token}` };
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

// ── News Form Modal (Create / Edit) ──
function NewsFormModal({ initial, onSave, onCancel }) {
  const [title,     setTitle]     = useState(initial?.title   ?? "");
  const [content,   setContent]   = useState(initial?.content ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  const isEdit = !!initial;

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      return setError("Title is required");
    }

    if (trimmedTitle.length < 3) {
      return setError("Title must be at least 3 characters");
    }

    if (!trimmedContent) {
      return setError("Content is required");
    }

    if (trimmedContent.length < 10) {
      return setError("Content must be at least 10 characters");
    }

    setError("");
    setSaving(true);

    try {
      await onSave({
        title: trimmedTitle,
        content: trimmedContent,
        published,
      });
    } catch (e) {
      const backendError =
        e?.response?.data?.errors?.[0]?.msg ||
        e?.response?.data?.message ||
        "Something went wrong.";

      setError(backendError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white border border-black w-full max-w-lg flex flex-col">

        {/* Header */}
        <div className="border-b border-black px-6 py-4 flex items-center justify-between">
          <p className={`${LABEL} text-gray-800`}>{isEdit ? "Edit News" : "New Article"}</p>
          <button onClick={onCancel} className={`${LABEL} text-gray-400 hover:text-black cursor-pointer transition-colors`}>✕ Close</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className={`${LABEL} text-red-500 border border-red-200 px-3 py-2`}>{error}</p>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className={`${LABEL} text-gray-400`}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title…"
              className="border border-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1">
            <label className={`${LABEL} text-gray-400`}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Article content…"
              rows={6}
              className="border border-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-black flex">
          <button
            onClick={onCancel}
            className={`flex-1 py-3 ${LABEL} text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors border-r border-black`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`flex-1 py-3 ${LABEL} bg-black text-white hover:bg-gray-900 cursor-pointer transition-colors disabled:opacity-50`}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function ManageNews({ setPage }) {
  const [news,     setNews]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("all"); // all | published

  const [loading,  setLoading]  = useState(true);
  const [confirm,  setConfirm]  = useState(null);  // { type, id } | null
  const [form,     setForm]     = useState(null);  // null | "create" | article obj

  // ── Fetch ──
  useEffect(() => {
    axios.get(`${API_URL}/api/news`, { headers: getAuthHeaders() })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.news ?? [];
        setNews(data);
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ──
  const publishedCount = news.filter((n) => n.published).length;
  const draftCount     = news.filter((n) => !n.published).length;

  const filtered = news.filter((n) =>
    filter === "all"       ? true :
    filter === "published" ? n.published :
    !n.published
  );

  // ── Create ──
  const handleCreate = async (payload) => {
    const res = await axios.post(`${API_URL}/api/admin/news`, payload, { headers: getAuthHeaders() });
    const created = res.data?.news ?? res.data;
    setNews((prev) => [created, ...prev]);
    setForm(null);
  };

  // ── Edit ──
  const handleEdit = async (payload) => {
    const id = form._id;
    const res = await axios.patch(`${API_URL}/api/admin/news/${id}`, payload, { headers: getAuthHeaders() });
    const updated = res.data?.news ?? res.data;
    setNews((prev) => prev.map((n) => n._id === id ? updated : n));
    if (selected?._id === id) setSelected(updated);
    setForm(null);
  };

  // ── Delete ──
  const deleteNews = (id) => {
    axios.delete(`${API_URL}/api/admin/news/${id}`, { headers: getAuthHeaders() }).catch(() => {});
    setNews((prev) => prev.filter((n) => n._id !== id));
    if (selected?._id === id) setSelected(null);
    setConfirm(null);
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── TITLE ── */}
      <div className="border-b border-black px-6 sm:px-12 pt-8 pb-6 flex items-end justify-between">
        <div>
          <p className={`${LABEL} text-gray-400 mb-1`}>Baha Architecture</p>
          <h1 className="text-2xl font-bold uppercase tracking-widest">News</h1>
        </div>
        <div className="flex items-center gap-3">

          <button
            onClick={() => setForm("create")}
            className={`${LABEL} bg-black text-white px-3 py-1.5 hover:bg-gray-900 cursor-pointer transition-colors`}
          >
            + New Article
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-px border-black  text-black">
        {[
          { label: "Published", value: publishedCount, note: "articles" },
          { label: "Drafts", value: draftCount, note: "unpublished" },
          { label: "Total", value: news.length, note: "all" },
          { label: "Views", value: "—", note: "analytics" },
        ].map((s) => (
          <div key={s.label} className="bg-white px-6 py-5 flex flex-col gap-1">
            <span className={`${LABEL} text-white`}>{s.label}</span>
            <span className="text-3xl font-bold  text-white tracking-tight">{s.value}</span>
            <span className={`${LABEL}  text-white`}>{s.note}</span>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ── */}
      <div className="border-b border-black flex">
        {[
          { key: "all",       label: `All (${news.length})` }

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

        {/* ── NEWS LIST + DETAIL ── */}
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
                <span className={`${LABEL} text-gray-300 text-center`}>No articles in this category</span>
              </div>
            ) : (
              filtered.map((article) => (
                <button
                  key={article._id}
                  onClick={() => setSelected(article)}
                  className={`w-full text-left px-5 py-4 border-b border-black cursor-pointer transition-colors duration-150
                    ${selected?._id === article._id ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!article.published && selected?._id !== article._id && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-0.5" />
                      )}
                      <span className={`${LABEL} truncate
                        ${selected?._id === article._id ? "text-white" : "text-gray-800"}`}>
                        {article.title}
                      </span>
                    </div>

                    <span className={`flex-shrink-0 text-[0.55rem] font-bold uppercase tracking-wider
                      ${selected?._id === article._id ? "text-gray-400" : "text-gray-300"}`}>
                      {formatDate(article.date ?? article.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs truncate
                    ${selected?._id === article._id ? "text-gray-400" : "text-gray-400"}`}>
                    {article.content}
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
                    <path d="M4 4h16v4H4z"/><path d="M4 10h10"/><path d="M4 14h8"/><path d="M4 18h6"/>
                  </svg>
                  <span className={`${LABEL} text-gray-200`}>Select an article</span>
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
                      {/* NOTE: this space is empty in the original — looked like a published/draft
                          status badge (similar to the Read/Unread badge in ManageMessages) was
                          removed at some point. Left blank as-is; add a badge here if you want
                          selected.published reflected in the detail view. */}
                    </div>
                    <p className={`${LABEL} text-gray-300 mt-1`}>
                      {formatDate(selected.date ?? selected.createdAt)} · {formatTime(selected.date ?? selected.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 border border-black">

                    <button
                      onClick={() => setForm(selected)}
                      className={`px-3 py-2 ${LABEL} text-gray-500 hover:bg-black hover:text-white cursor-pointer transition-colors border-r border-black`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirm({ type: "delete", id: selected._id })}
                      className={`px-3 py-2 ${LABEL} text-gray-500 hover:bg-black hover:text-white cursor-pointer  transition-colors`}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="px-6 sm:px-8 py-4 border-b border-black">
                  <p className={`${LABEL} text-gray-400 mb-1`}>Title</p>
                  <p className="text-base font-bold tracking-tight">{selected.title}</p>
                </div>

                {/* Content */}
                <div className="px-6 sm:px-8 py-6 flex-1">
                  <p className={`${LABEL} text-gray-400 mb-3`}>Content</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── MOBILE BOTTOM MENU ── */}
      <Verticalmenuadminmobile />

      {/* ── CONFIRM MODAL ── */}
      {confirm?.type === "delete" && (
        <ConfirmModal
          message="Permanently delete this article? This action cannot be undone."
          onConfirm={() => deleteNews(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── FORM MODAL ── */}
      {form && (
        <NewsFormModal
          initial={form === "create" ? null : form}
          onSave={form === "create" ? handleCreate : handleEdit}
          onCancel={() => setForm(null)}
        />
      )}

    </div>
  );
}