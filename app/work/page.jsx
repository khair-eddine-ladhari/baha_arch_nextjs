"use client"; // required: useState, useEffect, useRef, useCallback, window/DOM access

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import NaNvbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileMenu from "../components/MobileMenuworkpage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const HEADER_H  = 57.6;
const SECTION_H = 44;
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// ─── HOOK: detect mobile ──────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  // Guarded for SSR: window isn't available on the server, default to false
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    // Sync once on mount in case SSR default was wrong
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

// ─── IMG ──────────────────────────────────────────────────────────────────────
function Img({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="work-image">
      {src && (
        <img
          src={src} alt={alt} loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", display: "block", filter: "grayscale(100%)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s, transform 0.55s, filter 0.35s",
          }}
          className="kaan-img"
        />
      )}
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ item, delay, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const coverImage = typeof item.cover_image === "object" ? item.cover_image?.url : item.cover_image;
  const firstGalleryImage = typeof item.images?.[0] === "object" ? item.images?.[0]?.url : item.images?.[0];
  const imageSrc = item.img || item.image || coverImage || firstGalleryImage;
  const year = item.year || item.date;
  const meta = [item.location, year, item.category].filter(Boolean).join(" / ");

  const cardInner = (
    <>
      <Img src={imageSrc} alt={item.title} />
      <div className="work-card-meta">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{meta}</span>
      </div>
      <h3 className="work-card-title">{item.title}</h3>
    </>
  );

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="kaan-card" style={{
      opacity: visible ? 1 : 0, cursor: "pointer",
      transform: visible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
    }}>
      {item.slug ? (
        <Link href={`/Projectmodal/${item.slug}`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
          {cardInner}
        </Link>
      ) : cardInner}
    </div>
  );
}

// ─── GRID ─────────────────────────────────────────────────────────────────────
function WorkGrid({ items, keyPrefix, delayStep }) {
  return (
    <div className="kaan-work-grid">
      {items.map((item, i) => (
        <Card
          key={item._id || item.id || item.slug || `${keyPrefix}-${i}`}
          item={item}
          delay={i * delayStep}
          index={i}
        />
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function KAANWork() {
  const isMobile = useIsMobile(768);

  const [RESIDENTIAL, setResidential] = useState([]);
  const [COMMERCIAL, setCommercial]   = useState([]);
  const [MEDICAL_ITEMS, setMedicalItems] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/residential`).then((r) => setResidential(r.data)).catch(console.error);
    axios.get(`${API_URL}/api/commercial`).then((r) => setCommercial(r.data)).catch(console.error);
    axios.get(`${API_URL}/api/medical`).then((r) => setMedicalItems(r.data)).catch(console.error);
  }, []);

  const commercialRef = useRef(null);
  const medicalRef    = useRef(null);

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((ref, topOffset) => {
    if (!ref.current) return;
    const y = ref.current.getBoundingClientRect().top + window.scrollY - topOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const [activeSection, setActiveSection] = useState("residential");
  useEffect(() => {
    if (!commercialRef.current || !medicalRef.current) return;
    const pTop = commercialRef.current.getBoundingClientRect().top + window.scrollY - HEADER_H - SECTION_H;
    const iTop = medicalRef.current.getBoundingClientRect().top   + window.scrollY - HEADER_H - SECTION_H * 2;
    if (scrollY >= iTop - 20)      setActiveSection("medical");
    else if (scrollY >= pTop - 20) setActiveSection("commercial");
    else                           setActiveSection("residential");
  }, [scrollY]);

  const stickyBar = (top, zIndex) => ({
    position: "sticky", top, zIndex,
    background: "#fff", borderBottom: "1px solid #000",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 2.2rem", height: SECTION_H,
    marginLeft: 0, marginRight: 0,
  });

  const stickyTitle = {
    fontSize: "1.55rem", fontFamily: FONT, fontWeight: 400,
    textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1, margin: 0,
  };

  // On mobile collapse stickyTitle slightly
  const stickyTitleMobile = isMobile
    ? { ...stickyTitle, fontSize: "1.1rem" }
    : stickyTitle;

  const bottomBars = [
    { label: "Commercial", key: "commercial", topOffset: HEADER_H + SECTION_H },
    { label: "Medical",    key: "medical",    topOffset: HEADER_H + SECTION_H * 2 },
  ].filter(item => {
    if (activeSection === "residential") return true;
    if (activeSection === "commercial") return item.key === "medical";
    return false;
  });

  return (
    <>
      <style>{`
        .kaan-root, .kaan-root * { box-sizing: border-box; }
        html, body { height: 100%; }
        body {
          background: #fff; color: #000;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        #kaan-root {
          min-height: 100vh;
        }

        /* ── Card hover ── */
        .kaan-card:hover .kaan-img { filter: grayscale(0%) !important; transform: scale(1.04); }
        .kaan-card .kaan-img { will-change: transform, filter; }

        /* ── Image box ── */
        .work-image {
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #d8d8d8;
          position: relative;
        }

        /* ── Grid: 3 col default ── */
        .kaan-work-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 2.6rem 1rem;
          padding: 1.25rem 2.2rem 3rem;
        }
        .kaan-work-grid .kaan-card {
          width: 100%;
          border-top: 1px solid rgba(0,0,0,0.22);
          padding-top: 0.55rem;
        }
        .kaan-work-grid .kaan-card a { height: 100%; }

        /* ── Meta / title ── */
        .work-card-meta {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          min-height: 1.2rem;
          margin-top: 0.65rem;
          color: #8b8b8b;
          font-family: ${FONT};
          font-size: 0.62rem;
          line-height: 1.3;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .work-card-meta span:last-child {
          overflow: hidden;
          text-align: right;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .work-card-title {
          min-height: 2.35rem;
          margin-top: 0.28rem;
          color: #000;
          font-family: ${FONT};
          font-size: clamp(0.86rem, 1.1vw, 1.08rem);
          font-weight: 400;
          line-height: 1.16;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .kaan-card:hover .work-card-title {
          text-decoration: underline;
          text-underline-offset: 0.16em;
          text-decoration-thickness: 1px;
        }

        /* ── Breakpoints ── */
        @media (min-width: 1400px) {
          .kaan-work-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 980px) {
          .kaan-work-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .kaan-work-grid {
            grid-template-columns: 1fr;
            gap: 1.6rem;
            padding: 1rem 1rem 2.5rem;
          }
          .work-card-title { min-height: auto; font-size: 0.95rem; }
          .work-card-meta span:last-child { max-width: 68%; }
        }
      `}</style>

      {/* ── NAVBAR: desktop = NaNvbar, mobile = MobileMenu ── */}
      {isMobile ? <MobileMenu name="Work" /> : <NaNvbar name="Work" />}

      <div id="kaan-root" style={{ paddingTop: HEADER_H }}>

        {/* Residential bar */}
        <div style={stickyBar(HEADER_H, 30)}>
          <h2 style={stickyTitleMobile}>Residential</h2>
        </div>
        <WorkGrid items={RESIDENTIAL} keyPrefix="residential" delayStep={0.055} />

        {/* Commercial bar */}
        <div ref={commercialRef} style={stickyBar(HEADER_H + SECTION_H, 20)}>
          <h2 style={stickyTitleMobile}>Commercial</h2>
        </div>
        <WorkGrid items={COMMERCIAL} keyPrefix="commercial" delayStep={0.05} />

        {/* Medical bar */}
        <div ref={medicalRef} style={stickyBar(HEADER_H + SECTION_H * 2, 10)}>
          <h2 style={stickyTitleMobile}>Medical</h2>
        </div>
        <WorkGrid items={MEDICAL_ITEMS} keyPrefix="medical" delayStep={0.035} />


        <div className="relative z-10">
          <Footer />
        </div>
      </div>

      {/* Fixed bottom nav */}
      {bottomBars.length > 0 && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500,
          background: "#fff", display: "flex", flexDirection: "column",
          boxShadow: "0 -1px 0 #000",
        }}>
          {bottomBars.map(({ label, key, topOffset }) => (
            <button
              key={key}
              onClick={() => scrollTo(key === "commercial" ? commercialRef : medicalRef, topOffset)}
              style={{
                background: "#fff", border: "none", borderBottom: "1px solid #000",
                cursor: "pointer", height: SECTION_H, width: "100%",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 2.2rem", color: "#000", textAlign: "left",
              }}
            >
              <span style={stickyTitleMobile}>{label}</span>
              <span style={{
                fontSize: "0.72rem", fontFamily: FONT, fontWeight: 400,
                letterSpacing: "0.06em", textTransform: "uppercase", color: "#9a9a9a",
              }}>
                View
              </span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
}