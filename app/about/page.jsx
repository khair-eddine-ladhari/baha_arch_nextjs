"use client"; // required: useState, useEffect, IntersectionObserver, scroll/resize listeners

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileMenu from "../components/MobileMenu";

/* ── useIsMobile ─────────────────────────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
  // Guarded: window doesn't exist during Next.js's server render pass
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ── Hooks ───────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

/* ── Reveal ──────────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity .85s cubic-bezier(.16,1,.3,1) ${delay}s, transform .85s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────────────── */
const IMAGES = [
  { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80", w: "52vw", minW: 280 },
  { src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&q=80", w: "36vw", minW: 200 },
  { src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000&q=80", w: "46vw", minW: 240 },
  { src: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1000&q=80", w: "34vw", minW: 190 },
  { src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&q=80", w: "44vw", minW: 220 },
  { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80", w: "38vw", minW: 200 },
];

const STYLES = [
  {
    num: "01",
    tag: "(Solution to a Problem)",
    title: "Offices built around\nyour challenge.",
    body: "We address not just goals but chemistry and expertise — assigning optimal teams and actively collaborating with external creatives and artists.",
  },
  {
    num: "02",
    tag: "(One Goal. Infinite Ways)",
    title: "One goal.\nEndless paths.",
    body: "Every client's situation is unique. We bring craft, strategy, and spatial intelligence — spaces that are alive with purpose.",
  },
  {
    num: "03",
    tag: "(Always Evolving)",
    title: "Design that\ngrows with you.",
    body: "Post-occupancy consulting, iterative improvements, and ongoing partnership keep your space in motion.",
  },
];

const TEAM = [
  { role: "Client", headline: "Your vision,\nas the starting point.", body: "Your aspirations, tensions, and contradictions are the raw material from which every space is made." },
  { role: "Designer", headline: "Spatial thinking\nbrought to life.", body: "Our designers weave business insight and spatial craft into environments that feel inevitable." },
  { role: "Architect", headline: "Structure as\nexperience.", body: "Technical precision in service of human experience — every beam, bay, and boundary considered." },
  { role: "Partner", headline: "Creative network\nwithout limits.", body: "We collaborate with artists and specialists from outside the industry — great spaces draw from the full world." },
];

/* ── Hero with Sticky Wordmark ───────────────────────────────────────────── */
function HeroWithStickyWordmark({ heroVisible, isMobile }) {
  const containerRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setHidden(rect.top < -window.innerHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", height: isMobile ? "160vh" : "200vh", marginTop: "64px" }}>

      {/* WORDMARK */}
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
        zIndex: 1, display: hidden ? "none" : "flex",
        flexDirection: "column", pointerEvents: "none",
      }}>
        <div
          className="pl-[35px] pt-30 text-[14px] tracking-[0.01em] text-neutral-900"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(16px)",
            transition: "opacity .8s ease .2s, transform .8s ease .2s",
          }}
        >
          About
        </div>

        <div
          className="flex-1 flex items-center justify-center overflow-hidden px-2"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(60px)",
            transition: "opacity 1.1s cubic-bezier(.16,1,.3,1) .35s, transform 1.1s cubic-bezier(.16,1,.3,1) .35s",
          }}
        >
          <h1
            className="font-extrabold text-neutral-900 select-none text-center"
            style={{
              fontSize: isMobile ? "clamp(44px, 14vw, 80px)" : "clamp(80px, 10vw, 220px)",
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
            }}
          >
            BAHA ARCH<sup style={{ fontSize: "0.1em", verticalAlign: "super", fontWeight: 200, letterSpacing: 0 }}>®</sup>
          </h1>
        </div>
      </div>

      {/* GALLERY */}
      <div
        className="bg-white w-full"
        style={{ position: "absolute", top: isMobile ? "80vh" : "100vh", left: 0, right: 0, zIndex: 10 }}
      >
        <Gallery isMobile={isMobile} />
      </div>
    </div>
  );
}

/* ── Gallery ─────────────────────────────────────────────────────────────── */
function Gallery({ isMobile }) {
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const autoRef = useRef(null);
  const autoPos = useRef(0);
  const autoDir = useRef(1);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    autoRef.current = setInterval(() => {
      if (isDragging.current) return;
      autoPos.current += 0.4 * autoDir.current;
      el.scrollLeft = autoPos.current;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) autoDir.current = -1;
      if (el.scrollLeft <= 0) autoDir.current = 1;
    }, 20);

    return () => {
      clearInterval(autoRef.current);
    };
  }, []);

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-[8px] overflow-x-auto pl-2 pr-4 pb-6 sm:pb-9 select-none"
        style={{ cursor: "grab", scrollbarWidth: "none" }}
      >
        {IMAGES.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt=""
            className="flex-none object-cover block"
            style={{
              width: isMobile ? "80vw" : img.w,
              minWidth: isMobile ? 220 : img.minW,
              height: isMobile ? "85vw" : "80vh",
              transition: "transform .6s cubic-bezier(.16,1,.3,1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Style Row ───────────────────────────────────────────────────────────── */
function StyleRow({ num, tag, title, body, delay, isMobile }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`border-t border-neutral-100 py-10 sm:py-14 ${isMobile ? "flex flex-col gap-4" : "grid grid-cols-2 gap-14"} items-start sm:items-center`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(40px)",
        transition: `opacity .85s cubic-bezier(.16,1,.3,1) ${delay}s, transform .85s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      <div>
        <span
          className="font-extrabold leading-none select-none"
          style={{
            fontSize: isMobile ? "clamp(52px,16vw,100px)" : "clamp(72px,10vw,148px)",
            letterSpacing: "-0.05em",
            color: hovered ? "#e0e0e0" : "#f2f2f2",
            transition: "color .5s",
          }}
        >
          {num}
        </span>
      </div>
      <div>
        <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">{tag}</p>
        <h3
          className="pt-1.5 uppercase tracking-widest font-bold text-black"
          style={{ fontSize: isMobile ? "clamp(16px,4.5vw,24px)" : "clamp(20px,2.2vw,32px)" }}
        >
          {title}
        </h3>
        <p className="text-[14px] sm:text-[15.5px] leading-[1.95] pt-3.5 text-neutral-500 max-w-[440px]">{body}</p>
      </div>
    </div>
  );
}

/* ── Team Row ────────────────────────────────────────────────────────────── */
function TeamRow({ role, headline, body, delay, isMobile }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border-t border-neutral-100"
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "180px 1fr 1fr",
        gap: isMobile ? "8px" : "40px",
        padding: hovered && !isMobile ? "40px 36px" : isMobile ? "24px 0" : "40px 0",
        margin: hovered && !isMobile ? "0 -36px" : "0",
        background: hovered ? "#fafafa" : "transparent",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(30px)",
        transition: `opacity .8s ease ${delay}s, transform .8s ease ${delay}s, background .2s, padding .25s, margin .25s`,
      }}
    >
      <p className="text-[11.5px] text-neutral-400 tracking-[0.08em] uppercase pt-1">{role}</p>
      <h3
        className="font-normal leading-[1.4] whitespace-pre-line"
        style={{ fontSize: isMobile ? "clamp(16px,4vw,22px)" : "clamp(17px,1.8vw,26px)" }}
      >
        {headline}
      </h3>
      <p className="text-[13px] leading-[1.9] text-neutral-500 mt-1 sm:mt-0">{body}</p>
    </div>
  );
}

/* ── About Page ──────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const isMobile = useIsMobile(768);
  const scrollY = useScrollY();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white text-neutral-900 overflow-x-hidden" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* ── NAV: desktop = Navbar, mobile = MobileMenu ── */}
      {isMobile ? <MobileMenu name="About" /> : <Navbar name="About" />}

      {/* ── Hero ── */}
      <HeroWithStickyWordmark heroVisible={heroVisible} isMobile={isMobile} />

      {/* ── Content ── */}
      <div className="relative bg-white" style={{ zIndex: 10 }}>

        {/* Second Wordmark */}
        <Reveal className="text-center overflow-hidden py-16 sm:py-24 pl-2 pr-4">
          <div
            className="font-extrabold select-none"
            style={{
              fontSize: isMobile ? "clamp(28px,8vw,52px)" : "clamp(52px,6vw,190px)",
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
              padding: isMobile ? "0 8px" : "0 60px",
              color: "black",
            }}
          >
            The office is alive.{"\n\n"}The office is a place.
            <sup style={{ fontSize: ".18em", verticalAlign: "super", fontWeight: 400 }}>®</sup>
          </div>
        </Reveal>

        {/* Style section */}
        <section className="pl-2 pr-4 sm:pl-9 sm:pr-9 pb-20 sm:pb-28">
          <Reveal>
            <p className="text-[12px] tracking-[0.14em] uppercase text-neutral-400 mb-10 sm:mb-[72px]">Style</p>
          </Reveal>
          {STYLES.map((s, i) => (
            <StyleRow key={i} {...s} delay={i * 0.1} isMobile={isMobile} />
          ))}
          <div className="border-t border-neutral-100" />
        </section>

        {/* Team section */}
        <section className="pl-2 pr-4 sm:pl-9 sm:pr-9 pb-20 sm:pb-28">
          <Reveal>
            <p className="text-[12px] tracking-[0.14em] uppercase text-neutral-400 mb-10 sm:mb-[72px]">Team</p>
          </Reveal>
          {TEAM.map((t, i) => (
            <TeamRow key={i} {...t} delay={i * 0.08} isMobile={isMobile} />
          ))}
          <div className="border-t border-neutral-100" />
        </section>

        <Footer />
      </div>
    </div>
  );
}