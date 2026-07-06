"use client"; // required: sessionStorage, click handlers, navigation

import { useRouter, usePathname } from "next/navigation"; // replaces useNavigate + useLocation
import Link from "next/link"; // replaces react-router-dom's Link

const VerticalMenuAdmin = () => {
    const router = useRouter(); // was: const navigate = useNavigate();
    const pathname = usePathname(); // was: const location = useLocation();
    const LABEL = "text-[0.65rem] uppercase tracking-widest font-bold";
    const MENU_ITEMS = [
      { id: "projects", label: "Manage Projects", path: "/admin/projects" },
      { id: "news",     label: "Manage News", path: "/admin/news" },
      { id: "messages", label: "Manage Messages", path: "/admin/messages" },
      { id: "logout", label: "Logout" },
    ];

    const handleNav = (id) => {
      if (id === "logout") {
        sessionStorage.removeItem("adminToken");
        router.push(`/login`); // was: navigate(`/login`)
        return;
      }
      router.push(`/admin/${id}`); // was: navigate(`/admin/${id}`)
    };

    const isActive = (path) => {
      return pathname === path; // was: location.pathname === path
    };

    return (
      <aside className="hidden sm:flex flex-col border-r border-black w-48 shrink-0 h-screen">
        {/* FIXED: was href="/Admin" (capital A) — your actual route folder is
            lowercase "admin", so this now correctly matches app/admin/page.jsx */}
        <Link href="/admin" className={`${LABEL} text-black px-6 py-4 border-b border-black ${isActive("/admin") ? "bg-black text-white" : "hover:bg-gray-100"} transition-colors`}>
          <p className={`${LABEL} ${isActive("/admin") ? "text-white" : "text-gray-600 hover:text-gray-500"}`}>Dashboard</p>
        </Link>

        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`text-left px-6 py-4 border-t border-black ${LABEL} transition-colors duration-250 cursor-pointer
              ${isActive(item.path) ? "bg-black text-white" : "text-gray-500 hover:bg-black hover:text-white"}`}
          >
            {item.label}
          </button>
        ))}
      </aside>
    );
};
export default VerticalMenuAdmin;