"use client"; // required: useState, useEffect, click handlers, document/window access

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // replaces useNavigate + useLocation

const LINKS = ["home", "Work", "About", "Contact"];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter(); // was: const navigate = useNavigate();
  const pathname = usePathname(); // was: const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]); // was: [location.pathname]

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (item) => {
    router.push(item === "Home" ? "/" : `/${item.toLowerCase()}`); // was: navigate(...)
  };

  return (
    <>
      {/* ── Top bar background ── */}
      <div
        className="fixed top-0 left-0 right-0 z-[500] h-16"
        style={{
          background: scrolled ? "rgba(255,255,255,0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.05)" : "none",
          transition: "all 0.3s ease",
        }}
      />

      {/* ── Hamburger Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 right-5 z-[600] w-9 h-9 flex flex-col justify-center items-center gap-[5px]"
        aria-label="Toggle menu"
      >
        <span
          className="w-6 h-[1.5px] bg-black transition-all duration-300"
          style={{
            transform: open
              ? "translateY(6px) rotate(45deg)"
              : "translateY(0px)",
          }}
        />

        <span
          className="w-6 h-[1.5px] bg-black transition-all duration-300"
          style={{
            opacity: open ? 0 : 1,
            transform: open ? "scaleX(0)" : "scaleX(1)",
          }}
        />

        <span
          className="w-6 h-[1.5px] bg-black transition-all duration-300"
          style={{
            transform: open
              ? "translateY(-6px) rotate(-45deg)"
              : "translateY(0px)",
          }}
        />
      </button>

      {/* ── Overlay Menu ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[550] bg-white flex flex-col justify-center px-8 transition-all duration-500 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Logo */}
        <div
          className="absolute top-5 left-5 cursor-pointer"
          onClick={() => go("Home")}
        >
          <span className="text-[0.7rem] uppercase tracking-[0.2em] font-bold pl-3.25">
            Baha Architecture
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-col">
          {LINKS.map((item, i) => (
            <button
              key={item}
              onClick={() => go(item)}
              className="text-left border-b border-black py-5 overflow-hidden"
            >
              <span
                className={`block font-black uppercase transition-all duration-500 ${
                  open
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-6"
                }`}
                style={{
                  fontSize: "clamp(2.2rem, 10vw, 4.5rem)",
                  letterSpacing: "-0.02em",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                {item}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom info */}
        <div
          className={`absolute bottom-8 left-8 right-8 flex justify-between text-gray-400 text-[0.6rem] uppercase tracking-widest transition-all duration-500 ${
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <p>
            Architecture & Design
            <br />
          </p>
          <p>© Baha Arch</p>
        </div>
      </div>
    </>
  );
}