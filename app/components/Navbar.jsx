"use client"; // required: onClick handler + navigation inside KaanLogo

import { useRouter } from "next/navigation"; // replaces react-router-dom's useNavigate

const Navbar = ({ name }) => {
  // Guarded: window doesn't exist during Next.js's server render pass.
  // Note: this value is computed once at render and never updates on
  // scroll (no listener attached) — same behavior as the original.
  const headerScrolled = typeof window !== "undefined" && window.scrollY > 10;

  const HEADER_H = 57.6;

  function KaanLogo() {
    const router = useRouter(); // was: const navigate = useNavigate();
    return (
      <div>
        <p className="cursor-pointer text-[0.65rem] uppercase tracking-widest font-bold" onClick={() => router.push('/')}>
          BAHA ARCHITECTURE
        </p>
      </div>
    );
  }

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: HEADER_H, zIndex: 500,
      background: headerScrolled ? "rgba(255,255,255,0.93)" : "#fff",
      backdropFilter: headerScrolled ? "blur(10px)" : "none",
      borderBottom: "1px solid #e0e0e0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2.2rem", transition: "background 0.25s",
    }}>
      <KaanLogo width={80} />
      <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {["home", "Work", "About", "Contact"].map(n => (
          <a
            key={n}
            href={`/${n.toLowerCase()}`}
            className="text-[0.65rem] uppercase tracking-widest font-bold text-black hover:opacity-40 transition-opacity duration-[250ms]"
            style={{
              textDecoration: "none",
              borderBottom: n === name ? "1px solid #000" : "none",
              paddingBottom: 1,
            }}
          >
            {n}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;