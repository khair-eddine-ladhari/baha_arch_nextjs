"use client"; // required: useState, useEffect, sessionStorage, recharts, event handlers

import { useState, useEffect } from "react";
import axios from "axios";
import VerticalMenuAdmin from "../components/verticalmenuadmin";
import VerticalMenuAdminmobile from "../components/verticalmenuadminmobile";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LABEL = "text-[0.65rem] uppercase tracking-widest font-bold";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-black bg-white px-3 py-2">
      <p className={`${LABEL} text-gray-400 mb-1`}>{label}</p>
      <p className="text-base font-bold">{payload[0].value}</p>
    </div>
  );
};

const MENU_ITEMS = [
  { id: "projects", label: "Manage Projects" },
  { id: "news",     label: "Manage News" },
  { id: "messages", label: "Manage Messages" },
  { id: "settings", label: "Settings" },
  { id: "logout", label: "Logout" },
];

export default function AdminDashboard({ setPage }) {
  const [stats, setStats]       = useState({ projects: null, news: null, messages: null, visitors: null  });
  const [visitorData, setVisitorData] = useState([]);
  const [range, setRange]       = useState(30);
  const [, setMenuOpen]         = useState(false);

  useEffect(() => {
    const token   = sessionStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_URL}/api/nbprojects`).catch(() => null),
      axios.get(`${API_URL}/api/news`).catch(() => null),
      axios.get(`${API_URL}/api/admin/messages`, { headers }).catch(() => null),
      axios.get(`${API_URL}/api/visitors`).catch(() => null),
    ]).then(([p, n, m, v]) => {
      setStats({
        projects: p ? (Array.isArray(p.data) ? p.data.length : p.data?.projects?.length ?? 0) : "—",
        news:     n ? (Array.isArray(n.data) ? n.data.length : n.data?.news?.length     ?? 0) : "—",
        messages: m ? (Array.isArray(m.data) ? m.data.length : m.data?.messages?.length ?? 0) : "—",
        visitors: v ? v.data?.totalVisits ?? 0 : "—"
      });
      setVisitorData(v?.data?.dailyVisits || []);
    });
  }, []);

  const chartData = visitorData.slice(-range);

  const handleNav = (id) => {
    setPage(id);
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── TITLE ── */}
      <div className="border-b border-black px-6 sm:px-12 pt-8 pb-6">
        <p className={`${LABEL} text-gray-400 mb-1`}>Baha Architecture</p>
        <h1 className="text-2xl font-bold uppercase tracking-widest">Overview</h1>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-px bg-black border-b border-black">
        {[
          { label: "Visits",   value: stats.visitors,               note: "total" },
          { label: "Messages", value: stats.messages,               note: "inbox" },
          { label: "Projects", value: stats.projects,               note: "portfolio" },
          { label: "News",     value: stats.news,                   note: "articles" },
        ].map((s) => (
          <div key={s.label} className="bg-white px-6 py-5 flex flex-col gap-1">
            <span className={`${LABEL} text-gray-400`}>{s.label}</span>
            <span className="text-3xl font-bold tracking-tight">{s.value ?? "—"}</span>
            <span className={`${LABEL} text-gray-300`}>{s.note}</span>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ── */}
      <div className="border-b border-black flex">
        {["Overview", "Details"].map((f) => (
          <button
            key={f}
            className={`px-6 py-3 ${LABEL} cursor-pointer transition-colors duration-200
              ${f === "Overview" ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        <VerticalMenuAdmin />

        {/* ── RIGHT: chart ── */}
        <div className="flex-1 px-6 sm:px-8 py-6 flex flex-col gap-4 overflow-auto">

          {/* chart header */}
          <div className="flex items-center justify-between">
            <p className={`${LABEL} text-gray-400`}>
              Visitors — last {range} days
            </p>
            <div className="flex border border-black">
              {[7, 30].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 ${LABEL} transition-colors duration-[250ms]
                    ${range === r ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>

          {/* chart */}
          <div className="w-full h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="20%"  stopColor="#000" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 8, fontWeight: 700, fill: "#d1d5db" }}
                  tickLine={false}
                  axisLine={{ stroke: "#000", strokeWidth: 0.5 }}
                  interval={range === 7 ? 0 : 5}
                />
                <YAxis
                  tick={{ fontSize: 8, fontWeight: 700, fill: "#d1d5db" }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#000", strokeWidth: 0.5, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#000"
                  strokeWidth={1.5}
                  fill="url(#vg)"
                  dot={false}
                  activeDot={{ r: 3, fill: "#000", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className={`${LABEL} text-gray-300`}>* live visitor data</p>
        </div>
      </div>

      {/* ── MOBILE MENU — bottom bar ── */}
      <VerticalMenuAdminmobile />

    </div>
  );
}