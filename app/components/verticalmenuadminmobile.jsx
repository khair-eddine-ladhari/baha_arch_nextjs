"use client"; // required: sessionStorage, click handlers, navigation

import { useRouter, usePathname } from "next/navigation"; // replaces useNavigate + useLocation
// Note: axios, useState, useEffect, and API_URL were imported/defined in the
// original but never used anywhere in this component — removed.

const VerticalMenuAdminMobile = () => {
    const router = useRouter(); // was: const navigate = useNavigate();
    const pathname = usePathname(); // was: const location = useLocation();
    const LABEL = "text-[0.65rem] uppercase tracking-widest font-bold";

    const handleNav = (id) => {
      if (id === "logout") {
        sessionStorage.removeItem("adminToken");
        router.push(`/login`); // was: navigate(`/login`)
        return;
      }
      if (id === "") {
        router.push("/admin"); // FIXED: was "/Admin" (capital A) — must match app/admin
        return;
      }
      router.push(`/admin/${id}`); // was: navigate(`/admin/${id}`)
    };

    const MENU_ITEMS = [
      { id: "",   label: "Dashboard", path: "/admin" }, // FIXED: was "/Admin"
      { id: "projects", label: "Manage Projects", path: "/admin/projects" },
      { id: "news",     label: "Manage News", path: "/admin/news" },
      { id: "messages", label: "Manage Messages", path: "/admin/messages" },
      { id: "logout",   label: "Logout" },
    ];

    const isActive = (path) => {
      return pathname === path; // was: location.pathname === path
    };

    return (
      <div className="sm:hidden border-t border-black">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`w-full text-left px-6 py-4 border-b border-black ${LABEL} transition-colors duration-250 cursor-pointer
              ${isActive(item.path) ? "bg-black text-white" : "text-gray-500 hover:bg-black hover:text-white"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
};
export default VerticalMenuAdminMobile;