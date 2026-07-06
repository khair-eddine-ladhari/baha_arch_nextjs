"use client"; // required: useState, useEffect, useMemo, sessionStorage, file inputs, axios

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import VerticalMenuAdmin from "../../components/verticalmenuadmin";
import VerticalMenuAdminmobile from "../../components/verticalmenuadminmobile";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CATS = ["Residential", "Commercial", "Homepage", "Medical"];
const CAT_ABBR = { Residential: "RES", Commercial: "COM", Homepage: "HP", Medical: "MED" };
const LABEL = "text-[0.65rem] uppercase tracking-widest font-bold";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = () => ({
  title: "", location: "", description: "",
  year: new Date().getFullYear(),
  category: "Residential",
  buildings: "",
  cover_image: "",
  cover_image_file: null,
  image_files: [],
  existing_images: [], // ✅ existing URLs from DB
});

// ─── Reusable UI ────────────────────────────────────────────────────────────

function Label({ children, className = "" }) {
  return (
    <span className={`text-[0.6rem] font-bold uppercase tracking-[0.12em] ${className}`}>
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-black px-3 py-2 font-mono text-[0.75rem] bg-white focus:bg-gray-100 outline-none";

// ─── Modal ──────────────────────────────────────────────────────────────────

function Modal({ title, onClose, footer, children }) {
  return (
    <div
      className="absolute inset-0 bg-transparent flex items-start justify-center px-4 py-8 z-50 min-h-full"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border border-black w-full max-w-[560px]">
        <div className="flex items-center justify-between border-b border-black px-5 py-4">
          <Label>{title}</Label>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer transition-colors p-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>
        {children}
        <div className="flex border-t border-black">{footer}</div>
      </div>
    </div>
  );
}

function ModalBtn({ children, onClick, variant = "default", disabled = false }) {
  const base = "flex-1 py-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.1em] border-r border-black last:border-r-0 transition-colors cursor-pointer";
  const variants = {
    default: "bg-white text-black hover:bg-zinc-100",
    primary: "bg-black text-white hover:bg-zinc-800",
    danger: "bg-white text-red-600 hover:bg-red-50",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled} // ✅ prevents double clicking
    >
      {children}
    </button>
  );
}
// ─── Project Form ────────────────────────────────────────────────────────────

function ProjectForm({ form, onChange }) {
  return (
    <div className="p-5 flex flex-col gap-4">
      <Field label="Title *">
        <input className={inputCls} value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Project title" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Location">
          <input className={inputCls} value={form.location} onChange={(e) => onChange("location", e.target.value)} placeholder="City, Country" />
        </Field>
        <Field label="Year">
          <input className={inputCls} type="number" value={form.year} onChange={(e) => onChange("year", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select className={inputCls} value={form.category} onChange={(e) => onChange("category", e.target.value)}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

      </div>

      <Field label="Description">
        <textarea className={`${inputCls} min-h-[70px] resize-y`} value={form.description} onChange={(e) => onChange("description", e.target.value)} />
      </Field>

      {/* Cover Image */}
      <Field label="Cover Image">
        <input
          className={inputCls}
          type="file"
          accept="image/*"
          onChange={(e) => onChange("cover_image_file", e.target.files[0] || null)}
        />
        {/* ✅ show new file preview OR existing cover */}
        {form.cover_image_file ? (
          <img
            src={URL.createObjectURL(form.cover_image_file)}
            className="mt-2 h-24 object-cover border border-zinc-200"
          />
        ) : form.cover_image ? (
          <div className="relative mt-2 inline-block">
            <img
              src={form.cover_image}
              className="h-24 object-cover border border-zinc-200"
            />
            <span className="absolute bottom-0 left-0 bg-black/60 text-white text-[0.55rem] px-1.5 py-0.5 font-mono uppercase">
              Current
            </span>
          </div>
        ) : null}
      </Field>

      {/* Images */}
      {/* Existing images (edit mode) */}
      {(form.existing_images?.length > 0) && (
        <Field label={`Existing Images (${form.existing_images.length})`}>
          <div className="flex flex-wrap gap-2 mt-1">
            {form.existing_images.map((url, i) => (
              <div key={i} className="relative">
                <img
                  src={url}
                  className="h-16 w-16 object-cover border border-zinc-200"
                />
                <button
                  onClick={() => onChange("existing_images", form.existing_images.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 bg-black text-white rounded-full w-4 h-4 text-[0.6rem] flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Field>
      )}

      {/* New images */}
      <Field label={`Add New Images (${form.image_files?.length ?? 0} selected)`}>
        <input
          className={inputCls}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const newFiles = Array.from(e.target.files);
            onChange("image_files", [...(form.image_files || []), ...newFiles]);
          }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {(form.image_files || []).map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                className="h-16 w-16 object-cover border border-zinc-200"
              />
              <button
                onClick={() => onChange("image_files", form.image_files.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 bg-black text-white rounded-full w-4 h-4 text-[0.6rem] flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}
// ─── Delete Confirm ──────────────────────────────────────────────────────────

function DeleteModal({ project, onClose, onConfirm }) {
  return (
    <Modal title="Delete Project" onClose={onClose} footer={
      <>
        <ModalBtn onClick={onClose}>Cancel</ModalBtn>
        <ModalBtn variant="danger" onClick={onConfirm}>Delete</ModalBtn>
      </>
    }>
      <div className="px-5 py-4 border-b border-gray-200">
        <p className="font-bold text-sm text-black mb-1">{project.title}</p>
        <p className="text-[0.78rem] text-gray-600">
          This will permanently remove the project and all associated data. This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}

// ─── Project Row ─────────────────────────────────────────────────────────────

function ProjectRow({ project, onEdit, onDelete, onTogglePublish }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="grid grid-cols-[56px_1fr_90px_60px_90px] gap-px bg-gray-100 border-b border-black group">
      {/* Thumb */}
      <div className="bg-white p-1 flex items-center">
        {project.cover_image && !imgErr ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-12 h-9 object-cover border border-gray-200"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-12 h-9 bg-gray-100 border border-gray-200 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="bg-white group-hover:bg-gray-50 px-3 py-2.5 flex flex-col justify-center gap-0.5 transition-colors">
        <span className="font-bold text-[0.75rem] leading-tight">{project.title}</span>
        <Label className="text-gray-400">{project.location} · {project.year}</Label>
      </div>

      {/* Category */}
      <div className="bg-white group-hover:bg-gray-50 px-3 py-2.5 flex items-center transition-colors">
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-gray-600">{project.category}</span>
      </div>

      {/* Actions */}
      <div className="bg-white group-hover:bg-gray-50 flex items-center transition-colors">
        <button
          onClick={() => onEdit(project)}
          className="flex-1 h-full flex items-center cursor-pointer justify-center text-gray-400 hover:text-black transition-colors border-r border-black cursor-pointer"
          title="Edit"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(project)}
          className="flex-1 h-full flex items-center cursor-pointer justify-center text-gray-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProjectsDashboard() {

  const [projects, setProjects] = useState([]);
  // NOTE: nextId/setNextId are declared but never referenced anywhere else
  // in this component — dead state, carried over unchanged from the original.
  const [nextId, setNextId] = useState(5);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | {type, project?}
  const [form, setForm] = useState(EMPTY_FORM());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // ✅ add this
  const [err, setErr] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/nbprojects`).then((res) => {
      setProjects(Array.isArray(res.data) ? res.data : res.data.projects ?? []);
    }).catch((err) => {
      console.error("Failed to fetch projects:", err);
    }).finally(() => { setLoading(false); });
  }, []);

  const catCounts = useMemo(() => {
    const c = {};
    CATS.forEach((cat) => { c[cat] = projects.filter((p) => p.category === cat).length; });
    return c;
  }, [projects]);

  const totalPub = projects.filter((p) => p.published).length;

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchCat = filter === "All" || p.category === filter;
      const q = search.trim().toLowerCase();
      const matchQ = !q
        || (p.title ?? "").toLowerCase().includes(q)
        || (p.location ?? "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [projects, filter, search]);

  function openAdd() {
    setForm(EMPTY_FORM());
    setModal({ type: "add" });
  }

  // ✅ EMPTY_FORM already has buildings: "" — good.
  // Fix openEdit to guard undefined fields:
  function openEdit(p) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setForm({
      ...EMPTY_FORM(),
      ...p,
      buildings: p.buildings ?? "",
      cover_image_file: null,
      image_files: [],
      existing_images: [...(p.images || [])], // ✅ load existing images
    });
    setModal({ type: "edit", project: p });
  }
  function openDelete(p) {
    setModal({ type: "delete", project: p });
  }

  function closeModal() { setModal(null); }

  function handleFormChange(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function saveProject() {
    // ✅ frontend validation
    if (!form.title || form.title.length < 3) {
      alert("Title is required and must be at least 3 characters");
      return;
    }
    if (!form.location) {
      alert("Location is required");
      return;
    }
    if (!form.description) {
      alert("Description is required");
      return;
    }
    if (!form.year || form.year < 1900 || form.year > 2100) {
      alert("Year is required and must be between 1900 and 2100");
      return;
    }
    if (modal.type === "add" && !form.cover_image_file) {
      alert("Cover image is required");
      return;
    }

    const token = sessionStorage.getItem("adminToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    const data = new FormData();
    data.append("title", form.title);
    data.append("location", form.location);
    data.append("description", form.description);
    data.append("year", form.year);
    data.append("category", form.category);
    data.append("buildings", form.buildings || "index");
    data.append("existing_images", JSON.stringify(form.existing_images || [])); // ✅ add here

    if (form.cover_image_file) {
      data.append("cover_image", form.cover_image_file);
    }
    (form.image_files || []).forEach((file) => {
      data.append("images", file);
    });

    setSaving(true); // ✅ start
    try {
      if (modal.type === "add") {
        await axios.post(`${API_URL}/api/admin/projects`, data, { headers });
      } else {
        await axios.put(`${API_URL}/api/admin/projects/${form._id}`, data, { headers });
      }
      const res = await axios.get(`${API_URL}/api/nbprojects`);
      setProjects(Array.isArray(res.data) ? res.data : res.data.projects ?? []);
      closeModal();
    } catch (err) {
      setErr(err);
      console.error("Save failed:", err.response?.status, err.response?.data);
    } finally {
      setSaving(false); // ✅ stop
    }
  }
  async function deleteProject() {

    const token = sessionStorage.getItem("adminToken");

    try {
      const res = await axios.delete(
        `${API_URL}/api/admin/projects/${modal.project._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects((ps) => ps.filter((p) => String(p._id) !== String(modal.project._id)));
    } catch (err) {
      console.error("Delete failed:", err.response?.status, err.response?.data);
    } finally {
      closeModal();
    }
  }
  function togglePublish(p) {
    setProjects((ps) => ps.map((x) => x._id === p._id ? { ...x, published: !x.published } : x));
  }

  const STATS = [
    { label: "Total", value: projects.length, note: "projects" },
    ...CATS.map((c) => ({ label: CAT_ABBR[c], value: catCounts[c], note: c.toLowerCase() })),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── TITLE ── */}
      <div className="border-b border-black px-6 sm:px-12 pt-8 pb-6 flex items-end justify-between">
        <div>
          <p className={`${LABEL} text-gray-400 mb-1`}>Baha Architecture</p>
          <h1 className="text-2xl font-bold uppercase tracking-widest">Projects</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-black py-2 pl-3 pr-8 text-[0.75rem] bg-white focus:bg-gray-100 outline-none w-44"
            />
            <svg className="absolute right-2.5 text-gray-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-black text-white cursor-pointer px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.1em] hover:bg-gray-800 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Project
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-px bg- border-b border-black">
        {[
          { label: "Total", value: projects.length, note: "projects" },
          { label: "Categories", value: CATS.length, note: "types" },

        ].map((s) => (
          <div key={s.label} className="bg-white px-6 py-5 flex flex-col gap-1">
            <span className={`${LABEL} text-gray-400`}>{s.label}</span>
            <span className="text-3xl font-bold tracking-tight">{s.value}</span>
            <span className={`${LABEL} text-gray-300`}>{s.note}</span>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex border-b border-black">
        {["All", ...CATS].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-6 py-3 ${LABEL} cursor-pointer transition-colors duration-200
              ${filter === c ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
          >
            {c} ({c === "All" ? projects.length : catCounts[c]})
          </button>
        ))}
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <VerticalMenuAdmin />

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0 overflow-auto">
          {/* Table header */}
          <div className="grid grid-cols-[56px_1fr_90px_60px_90px] gap-px bg-black border-b border-black">
            {["", "Title / Location", "Category", "Actions", "/"].map((h) => (
              <Label key={h} className="text-gray-400">{h}</Label>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-12 text-center">
              <Label className="text-gray-300">Loading…</Label>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((p) => (
              <ProjectRow
                key={p._id}
                project={{
                  ...p,
                  title: p.title ?? "",
                  location: p.location ?? "",
                  category: p.category ?? "",
                  year: p.year ?? "",
                  images: p.images ?? [],
                  cover_image: p.cover_image ?? "",
                }}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <Label className="text-gray-300">No projects found</Label>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-black">
            <Label className="text-gray-300">{filtered.length} of {projects.length} shown</Label>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal?.type === "delete" && (
        <DeleteModal project={modal.project} onClose={closeModal} onConfirm={deleteProject} />
      )}

      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal
          title={modal.type === "edit" ? "Edit Project" : "Add Project"}
          onClose={closeModal}
          footer={
            <>
              <ModalBtn onClick={closeModal} className="cursor-pointer">
                Cancel
              </ModalBtn>
              <ModalBtn variant="primary" onClick={saveProject} disabled={saving}>
                {saving
                  ? modal.type === "edit" ? "Saving…" : "Uploading…"
                  : modal.type === "edit" ? "Save Changes" : "Add Project"
                }
              </ModalBtn>
            </>
          }
        >
          <ProjectForm form={form} onChange={handleFormChange} />
        </Modal>
      )}

      {/* ── MOBILE MENU — bottom bar ── */}
      <VerticalMenuAdminmobile />
    </div>
  );
}