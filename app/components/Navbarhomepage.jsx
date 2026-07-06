

"use client"; // required: uses useState, useEffect, useRef, window.scrollY

import { useState, useEffect, useRef } from "react";
// Note: useNavigate and Link were imported in the original but never used — removed.

const HEADER_H = 57.6;

const Navbar = ({ name, user }) => {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_H,
        zIndex: 500,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(1px)",
        WebkitBackdropFilter: "blur(4px)",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 2.2rem",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s, background 0.25s",
      }}
    >
      <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {["home", "Work", "About", "Contact"].map((n) => (
          <a
            key={n}
            href={`/${n.toLowerCase()}`}
            className="text-[0.65rem] uppercase tracking-widest font-bold text-black hover:opacity-40 transition-opacity duration-[250ms]"
            style={{ textDecoration: "none", paddingBottom: 1 }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.2")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            {n}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;