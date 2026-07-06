

"use client"; // required: useState, useEffect, click handlers, document/window access

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // replaces useNavigate + useLocation

const LINKS = ["home", "Work", "About", "Contact"];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter(); // was: const navigate = useNavigate();
  const pathname = usePathname(); // was: const location = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]); // was: [location.pathname]

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Track scroll for navbar appearance
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
      {/* ── Persistent top navbar bar ── */}
      <div
        className="fixed top-0 left-0 right-0 z-[500] h-16"
        style={{
          // Frosted glass that works on both light & dark backgrounds
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(10px)",

          transition:
            "background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease",
        }}
      />

      {/* ── Hamburger button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 right-5 z-[600] flex flex-col justify-center items-center w-9 h-9 gap-[5px]"
        aria-label="Toggle menu"
      >
        {/* Bar color: black when menu open (white bg), white otherwise (adapts to page) */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-[1.5px] w-6 transition-all duration-300 origin-center"
            style={{
              backgroundColor: open ? "#000" : "black",
              // mix-blend-mode makes it auto-adapt to any background
              mixBlendMode: open ? "normal" : "difference",
              transform:
                i === 0 && open
                  ? "rotate(45deg) translateY(6.5px)"
                  : i === 2 && open
                  ? "rotate(-45deg) translateY(-6.5px)"
                  : "none",
              opacity: i === 1 && open ? 0 : 1,
              scaleX: i === 1 && open ? 0 : 1,
            }}
          />
        ))}
      </button>

      {/* ── Full-screen overlay menu ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[550] bg-white flex flex-col justify-center px-8 transition-all duration-500 ease-in-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        
        {/* Logo top left */}
        <div
          className="absolute top-5 left-5 cursor-pointer"
          onClick={() => go("Home")}
        >
          <span className="text-[0.7rem] uppercase tracking-[0.2em] font-bold text-black pl-3.5">
            Baha Architecture
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0">
          {LINKS.map((item, i) => (
            <button
              key={item}
              onClick={() => go(item)}
              className="text-left border-b border-black py-5"
              style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
            >
              <span
                className={`block font-black uppercase leading-none transition-all duration-500 ${
                  open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{
                  fontSize: "clamp(2.2rem, 10vw, 4.5rem)",
                  letterSpacing: "-0.02em",
                  transitionDelay: open ? `${i * 70 + 80}ms` : "0ms",
                }}
              >
                {item}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom info */}
        <div
          className={`absolute bottom-8 left-8 right-8 flex justify-between items-end transition-all duration-500 ${
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: open ? "350ms" : "0ms" }}
        >
          <p className="text-[0.6rem] uppercase tracking-widest text-gray-400 leading-relaxed">
            Architecture & Design<br />
          </p>
          <p className="text-[0.6rem] uppercase tracking-widest text-gray-400">
            © Baha Arch
          </p>
        </div>
      </div>
    </>
  );
}