"use client"; // required: uses useState, useEffect, browser APIs, and navigation

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // replaces react-router-dom's useNavigate
import Footer from "./components/Footer";
import Navbar from "./components/Navbarhomepage";
import MobileMenu from "./components/MobileMenu";
import EntryScreen from "./components/EntryScreen";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Next.js env vars need NEXT_PUBLIC_ prefix to be readable in the browser
const FONT = { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" };


/* ─── News accordion item ─────────────────────────────────────────── */
function NewsItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-t border-black">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 grid grid-cols-[5rem_1fr] gap-3 group"
      >
        <span className="text-[0.6rem] uppercase tracking-widest font-bold text-gray-400 pt-0.5 tabular-nums">
          {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
        </span>
        <span className="text-[0.6rem] uppercase tracking-widest font-bold leading-snug group-hover:opacity-50 transition-opacity duration-300">
          {item.title}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[0.6rem] uppercase tracking-widest font-bold text-gray-400 leading-relaxed pb-5 pl-[calc(5rem+0.75rem)] pr-2">
          {item.body}
        </p>
      </div>
    </li>
  );
}

/* ─── Project card ────────────────────────────────────────────────── */
function ProjectTeaser({ project, index, titleRef }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const router = useRouter(); // was: const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => router.push(`/Projectmodal/${project.slug}`)} // was: navigate(`/Projectmodal/${project.slug}`)
      className={`group cursor-pointer transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 120}ms`, marginBottom: "2rem" }}
    >
      <div ref={titleRef} style={{ height: 0 }} />
      <div className="flex justify-between items-baseline border-t border-black py-2 gap-4">
        <h3 className="text-[0.6rem] uppercase tracking-widest font-bold truncate">
          {project.title}
        </h3>
        <span className="text-[0.6rem] uppercase tracking-widest font-bold text-gray-400 shrink-0">
          {project.location}
        </span>
      </div>
      <div className="overflow-hidden w-full" style={{ aspectRatio: "16/10" }}>
        <img
          src={project.cover_image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ─── Home page ───────────────────────────────────────────────────── */
export default function Home({ user }) {
  const [heroVisible, setHeroVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [news, setNews]         = useState([]);
  const [passedCount, setPassedCount] = useState(0);
  const [showEntry, setShowEntry] = useState(true);
  const titleRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, newsRes] = await Promise.all([
          axios.get(`${API_URL}/api/projects`),
          axios.get(`${API_URL}/api/news`),
        ]);
        setProjects(projRes.data);
        setNews(newsRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let count = 0;
      titleRefs.current.forEach((ref) => {
        if (ref && ref.getBoundingClientRect().top < 0) count++;
      });
      setPassedCount(count);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [projects]);

  return (
    <div className="bg-white text-black" style={FONT}>

      {showEntry && <EntryScreen onDone={() => setShowEntry(false)} />}

      {/* ── Desktop navbar (hidden on mobile/tablet) ── */}
      <div className="hidden lg:block">
        <Navbar user={user} />
      </div>

      {/* ── Mobile/tablet hamburger + overlay ── */}
      <div className="lg:hidden">
        <MobileMenu />
      </div>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <header className="relative w-full bg-black overflow-hidden" style={{ height: "100svh" }}>
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          autoPlay muted loop playsInline
          src="https://kaanarchitecten.com/media/_960xauto-q60/KAAN-Architecten_The-Learnd_cut_30s-3-2-02.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />

        <div
          className={`absolute top-20 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 ease-out ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <span
            className="text-white font-black uppercase tracking-[0.15em] whitespace-nowrap"
            style={{ fontSize: "clamp(1.6rem, 4vw, 5rem)" }}
          >
            Baha Arch
          </span>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-white/60 text-[0.55rem] uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-[1px] h-8 bg-white/40 animate-pulse" />
        </div>
      </header>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: "100vh" }}>

        <div
          className="hidden lg:flex flex-col justify-start pt-7 px-6"
          style={{ width: "50%", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}
        >
          <nav>
            <ul>
              {["Work", "About", "Contact"].map((item) => (
                <li key={item} className="border-b border-black">
                  <a
                  
                    href={`/${item.toLowerCase()}`}
                    className="block font-black leading-none py-2 uppercase hover:opacity-30 transition-opacity duration-300"
                    style={{ fontSize: "clamp(2.8rem, 5.5vw, 5.5rem)", letterSpacing: "-0.02em" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {passedCount > 0 && (
            <div className="mt-6">
              {projects.slice(0, passedCount).map((p) => (
                <div key={p._id || p.id} className="flex justify-between border-t border-black py-1.5">
                  <span className="text-[0.6rem] uppercase tracking-widest font-bold truncate">
                    {p.title}
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-widest font-bold text-gray-400 ml-4 shrink-0">
                    {p.location}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/2 px-5 lg:px-6 pb-24" style={{ paddingTop: "1.75rem" }}>
          <div className="lg:hidden mb-6 border-b border-black pb-3">
            <span className="text-[0.6rem] uppercase tracking-widest font-bold text-gray-400">
              Selected Work
            </span>
          </div>

          <section>
            {projects.map((project, i) => (
              <ProjectTeaser
                key={project._id || project.slug || i}
                project={project}
                index={i}
                titleRef={(el) => (titleRefs.current[i] = el)}
              />
            ))}
          </section>

          <section className="mt-16">
            <h2 className="text-[0.6rem] uppercase tracking-widest font-bold text-gray-400 mb-0">
              News
            </h2>
            <ul>
              {news.map((item) => (
                <NewsItem key={item._id || item.title} item={item} />
              ))}
            </ul>
            <div className="border-t border-black pt-4" />
          </section>
        </div>
      </div>

      {/* ══ WORDMARK ══════════════════════════════════════════════════ */}
      <div className="flex items-end justify-center overflow-hidden select-none" style={{ padding: "4rem 0" }}>
        <span
          className="font-black uppercase text-black leading-none"
          style={{ fontSize: "clamp(3rem, 10vw, 16rem)", letterSpacing: "-0.03em" }}
        >
          BAHA ARCH
        </span>
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}