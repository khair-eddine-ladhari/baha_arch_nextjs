"use client"; // required: heavy interactivity — state, effects, document/window, IntersectionObserver

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // replaces react-router-dom's useParams + useNavigate
import axios from "axios";
import Footer from "../../components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // was: import.meta.env.VITE_API_URL

const C = {
  bg:        "#f7f5f2",
  bgCard:    "#ffffff",
  ink:       "#111010",
  inkMid:    "#555250",
  inkFaint:  "#a09d9a",
  inkGhost:  "#ccc9c5",
  border:    "rgba(0,0,0,0.08)",
  borderMid: "rgba(0,0,0,0.14)",
};
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ── tiny responsive hook ── */
function useIsMobile() {
  // Guarded: window doesn't exist during Next.js's initial server render pass
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

const ProjectModal = () => {
  const { slug } = useParams(); // works the same way as react-router-dom's version
  const router = useRouter(); // was: const navigate = useNavigate();
  const isMobile  = useIsMobile();

  const [project,   setProject]   = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const [loaded,    setLoaded]    = useState({});
  const [revealed,  setRevealed]  = useState(false);
  const [scrollY,   setScrollY]   = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/projects/${slug}`)
      .then(res => { setProject(res.data); setTimeout(() => setRevealed(true), 60); })
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    // hide hamburger while modal is open
    const btn = document.querySelector('[aria-label="Toggle menu"]');
    if (btn) btn.style.display = "none";
    return () => {
      document.body.style.overflow = "";
      if (btn) btn.style.display = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = e => {
      if (e.key === "Escape") activeImg !== null ? setActiveImg(null) : onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeImg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [project]);

  const onClose    = () => router.back(); // was: navigate(-1)
  const markLoaded = id => setLoaded(p => ({ ...p, [id]: true }));

  /* ── Loading ── */
  if (!project) return (
    <div style={{ position:"fixed", inset:0, background:C.bg,
      display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT }}>
      <div style={{ display:"flex", gap:8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:C.inkGhost,
            animation:`pulse 1.2s ease-in-out ${i*0.18}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );

  const imgs = project.images || [];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:C.bg, fontFamily:FONT, color:C.ink }}>

      {/* ── LIGHTBOX ── */}
      {activeImg !== null && (
        <div onClick={() => setActiveImg(null)} style={{
          position:"fixed", inset:0, zIndex:100,
          background:"rgba(247,245,242,0.97)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"zoom-out", animation:"fadeIn 0.2s ease",
        }}>
          <img
            src={getUrl(imgs[activeImg])} alt=""
            style={{
              maxWidth: isMobile ? "96vw" : "88vw",
              maxHeight: isMobile ? "80vh" : "88vh",
              objectFit:"contain",
              boxShadow:"0 4px 48px rgba(0,0,0,0.1)",
              animation:"scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          />

          {/* arrows — tighter on mobile */}
          {activeImg > 0 && (
            <button onClick={e => { e.stopPropagation(); setActiveImg(activeImg-1); }}
              style={arrowBtn("left", isMobile)}
              onMouseEnter={e => e.currentTarget.style.color = C.ink}
              onMouseLeave={e => e.currentTarget.style.color = C.inkFaint}
            >←</button>
          )}
          {activeImg < imgs.length-1 && (
            <button onClick={e => { e.stopPropagation(); setActiveImg(activeImg+1); }}
              style={arrowBtn("right", isMobile)}
              onMouseEnter={e => e.currentTarget.style.color = C.ink}
              onMouseLeave={e => e.currentTarget.style.color = C.inkFaint}
            >→</button>
          )}

          <button onClick={() => setActiveImg(null)} style={{
            position:"absolute", top: isMobile ? 16 : 24, right: isMobile ? 16 : 28,
            background:"none", border:"none", cursor:"pointer",
            fontSize:"0.52rem", letterSpacing:"0.22em", textTransform:"uppercase",
            color:C.inkFaint, fontFamily:FONT, fontWeight:600,
            transition:"color 0.2s", padding:"0.5rem",
          }}
            onMouseEnter={e => e.currentTarget.style.color = C.ink}
            onMouseLeave={e => e.currentTarget.style.color = C.inkFaint}
          >ESC</button>

          <div style={{
            position:"absolute", bottom:26,
            fontSize:"0.5rem", letterSpacing:"0.22em",
            color:C.inkFaint, textTransform:"uppercase",
          }}>{activeImg+1} / {imgs.length}</div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, zIndex:60,
        padding: isMobile ? "1rem 1.1rem" : "1.2rem 1.5rem",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"rgba(247,245,242,0.80)",
        backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        maskImage:"linear-gradient(to bottom, black 70%, transparent 100%)",
        WebkitMaskImage:"linear-gradient(to bottom, black 70%, transparent 100%)",
      }}>
        <span style={{
          fontSize: isMobile ? "0.48rem" : "0.52rem",
          letterSpacing:"0.26em", textTransform:"uppercase",
          color:C.inkFaint, fontWeight:600,
        }}>
          {project.category || "Architecture"}
        </span>
        <button onClick={onClose} style={{
          background:"none", border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", gap:"0.5rem",
          color:C.inkMid, fontSize: isMobile ? "0.48rem" : "0.52rem",
          letterSpacing:"0.22em", textTransform:"uppercase", fontWeight:600,
          transition:"color 0.2s", padding:0, fontFamily:FONT,
        }}
          onMouseEnter={e => e.currentTarget.style.color = C.ink}
          onMouseLeave={e => e.currentTarget.style.color = C.inkMid}
        >
          <span>Close</span>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <path d="M4 16L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 4L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div ref={containerRef} style={{ height:"100vh", overflowY:"auto", overflowX:"hidden" }}>

        {/* ── HERO ── */}
        <div style={{ position:"relative", height:"100svh", overflow:"hidden" }}>
          <img
            src={project.cover_image?.url || project.cover_image}
            alt={project.title}
            style={{
              width:"100%", height:"115%", objectFit:"cover",
              marginTop:"-7.5%",
              opacity: revealed ? 1 : 0,
              transform: revealed ? `translateY(${scrollY * 0.28}px)` : "translateY(10px)",
              transition:"opacity 1.5s ease, transform 1.5s cubic-bezier(0.16,1,0.3,1)",
              willChange:"transform",
              filter:"brightness(0.88)",
            }}
          />
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to bottom, rgba(247,245,242,0.05) 0%, rgba(247,245,242,0) 25%, rgba(247,245,242,0.85) 100%)",
          }} />

          {/* title block — stacks on mobile */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            padding: isMobile ? "2rem 1.2rem 2.2rem" : "3rem 1.5rem 2.8rem",
          }}>
            <div style={{
              display:"flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent:"space-between",
              alignItems: isMobile ? "flex-start" : "flex-end",
              gap: isMobile ? "1.2rem" : 0,
              maxWidth:1300, margin:"0 auto",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(16px)",
              transition:"opacity 1s ease 0.35s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.35s",
            }}>
              <h1 style={{
                fontSize: isMobile ? "clamp(2rem,11vw,3rem)" : "clamp(2.6rem,7vw,6.5rem)",
                fontWeight:200, color:C.ink, margin:0,
                letterSpacing:"-0.035em", lineHeight:0.92,
                textTransform:"uppercase",
                maxWidth: isMobile ? "100%" : "68%",
              }}>
                {project.title}
              </h1>

              <div style={{
                display:"flex", flexDirection: isMobile ? "row" : "column",
                alignItems: isMobile ? "center" : "flex-end",
                gap: isMobile ? "1rem" : "0.4rem",
                flexWrap:"wrap",
                paddingBottom: isMobile ? 0 : "0.5rem",
              }}>
                {project.location && (
                  <span style={{
                    fontSize: isMobile ? "0.65rem" : "1.22rem",
                    letterSpacing:"0.18em", color:C.ink,
                    textTransform:"uppercase",
                  }}>{project.location}</span>
                )}
                {project.year && (
                  <span style={{
                    fontSize: isMobile ? "0.65rem" : "1.22rem",
                    letterSpacing:"0.18em", color:C.ink,
                    textTransform:"uppercase", opacity:0.5,
                  }}>{project.year}</span>
                )}
                {project.size && (
                  <span style={{
                    fontSize: isMobile ? "0.65rem" : "1.52rem",
                    letterSpacing:"0.18em", color:C.ink,
                    textTransform:"uppercase",
                  }}>{project.size}</span>
                )}
              </div>
            </div>
          </div>

          {/* scroll cue */}
          <div style={{
            position:"absolute", bottom:"2.2rem", left:"50%", transform:"translateX(-50%)",
            opacity: scrollY < 50 ? 0.3 : 0, transition:"opacity 0.4s",
            display:"flex", flexDirection:"column", alignItems:"center",
          }}>
            <div style={{ width:1, height:36, background:C.inkMid, animation:"scrollPulse 2s ease-in-out infinite" }} />
          </div>
        </div>

        {/* ── DESCRIPTION ── */}
        <div style={{
          maxWidth:780,
          padding: isMobile ? "4rem 1.2rem 3.5rem" : "7rem 1.5rem 6rem",
        }}>
          <div style={{ width:24, height:1, background:C.inkGhost, marginBottom:"2.5rem" }} />
          <p style={{
            fontSize:"clamp(0.95rem, 2vw, 1.32rem)",
            color:C.inkMid, lineHeight:1.75, fontWeight:300,
            letterSpacing:"0.012em", margin:0,
          }}>
            {project.description}
          </p>
          {project.descriptionFull && (
            <p style={{
              fontSize:"clamp(0.82rem, 1.3vw, 1rem)",
              color:C.inkFaint, lineHeight:1.9, fontWeight:300,
              letterSpacing:"0.01em", margin:"2.5rem 0 0",
            }}>
              {project.descriptionFull}
            </p>
          )}
        </div>

        {/* ── IMAGE MOSAIC ── */}
        {imgs.length > 0 && (
          <div style={{ padding: isMobile ? "0 0.4rem 0.4rem" : "0 0.6rem 0.6rem", maxWidth:1600, margin:"0 auto" }}>
            {/* First image — full bleed, shorter ratio on mobile */}
            <RevealBlock index={0} style={{ marginBottom: isMobile ? "0.4rem" : "0.5rem" }}>
              <div onClick={() => setActiveImg(0)} style={{
                aspectRatio: isMobile ? "4/3" : "21/9",
                overflow:"hidden", background:"#e8e5e1",
                cursor:"zoom-in", position:"relative",
              }}>
                <img src={getUrl(imgs[0])} alt=""
                  onLoad={() => markLoaded("i0")}
                  style={{
                    width:"100%", height:"100%", objectFit:"cover", display:"block",
                    opacity: loaded["i0"] ? 1 : 0,
                    transform:"scale(1.01)",
                    transition:"opacity 0.9s ease, transform 8s ease",
                  }}
                  loading="lazy"
                />
              </div>
            </RevealBlock>

            <MosaicGrid
              images={imgs.slice(1)}
              startIndex={1}
              loaded={loaded}
              onLoad={markLoaded}
              onOpen={i => setActiveImg(i+1)}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* ── INFO STRIP ── */}
        {project.info && Object.keys(project.info).length > 0 && (
          <div style={{
            borderTop:`1px solid ${C.border}`,
            borderBottom:`1px solid ${C.border}`,
            margin: isMobile ? "3rem 0" : "5rem 0",
            padding: isMobile ? "2.5rem 1.2rem" : "3.5rem 2.2rem",
            background:C.bgCard,
          }}>
            <div style={{
              maxWidth:1200, margin:"0 auto",
              display:"grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(auto-fit, minmax(140px, 1fr))",
              gap: isMobile ? "2rem 1.5rem" : "3rem",
            }}>
              {Object.entries(project.info).map(([key, val]) => (
                <div key={key}>
                  <div style={{
                    fontSize:"0.48rem", letterSpacing:"0.26em",
                    textTransform:"uppercase", color:C.inkGhost,
                    marginBottom:"0.6rem", fontWeight:600,
                  }}>{key}</div>
                  <div style={{
                    fontSize: isMobile ? "0.75rem" : "0.82rem",
                    letterSpacing:"0.06em", textTransform:"uppercase",
                    color:C.inkMid, fontWeight:300, lineHeight:1.5,
                  }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Footer />
      </div>

      <style>{`
        @keyframes fadeIn   { from{opacity:0}          to{opacity:1} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(0.975)} to{opacity:1;transform:scale(1)} }
        @keyframes scrollPulse { 0%,100%{transform:scaleY(0.35);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} }
        * { -webkit-font-smoothing: antialiased; }
      
        [aria-label="Toggle menu"] { display: none !important; }
      `}</style>
    </div>
  );
};

/* ── helpers ── */
function getUrl(img) {
  return typeof img === "string" ? img : img?.url || img?.secure_url || img?.path || "";
}

function arrowBtn(side, isMobile) {
  return {
    position:"absolute", [side]: isMobile ? 8 : 24, top:"50%", transform:"translateY(-50%)",
    background:"none", border:"none",
    color:"rgba(17,16,16,0.3)",
    fontSize: isMobile ? "1rem" : "1.3rem",
    cursor:"pointer", padding: isMobile ? "0.75rem" : "1rem",
    transition:"color 0.2s",
    fontFamily:"'Helvetica Neue', Helvetica, Arial, sans-serif",
  };
}

/* ── Intersection reveal ── */
function RevealBlock({ children, index = 0, style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.04 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      ...style,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(20px)",
      transition:`opacity 0.8s ease ${index*0.07}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${index*0.07}s`,
    }}>
      {children}
    </div>
  );
}

/* ── Image tile ── */
function ImgTile({ img, id, loaded, onLoad, onClick, aspectRatio, index }) {
  return (
    <RevealBlock index={index}>
      <div onClick={onClick} style={{
        aspectRatio, overflow:"hidden",
        background:"#e8e5e1", cursor:"zoom-in", position:"relative",
      }}>
        <img src={getUrl(img)} alt="" onLoad={() => onLoad(id)}
          style={{
            width:"100%", height:"100%", objectFit:"cover", display:"block",
            opacity: loaded[id] ? 1 : 0,
            transition:"opacity 0.9s ease, transform 0.55s ease",
            transform:"scale(1.01)",
          }}
          loading="lazy"
        />
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", transition:"background 0.3s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
        />
      </div>
    </RevealBlock>
  );
}

/* ── Mosaic layout — single column on mobile ── */
function MosaicGrid({ images, startIndex, loaded, onLoad, onOpen, isMobile }) {
  if (!images.length) return null;
  const rows = [];
  let i = 0;
  const gap = isMobile ? "0.4rem" : "0.5rem";

  while (i < images.length) {
    // On mobile: always single column, alternating tall/wide ratios
    if (isMobile) {
      const ratio = i % 2 === 0 ? "4/3" : "3/2";
      rows.push(
        <div key={i} style={{ marginBottom: gap }}>
          <ImgTile img={images[i]} id={`i${startIndex+i}`} loaded={loaded}
            onLoad={onLoad} onClick={() => onOpen(i)} aspectRatio={ratio} index={startIndex+i} />
        </div>
      );
      i += 1;
      continue;
    }

    // Desktop: original mosaic patterns
    const pattern = rows.length % 4;
    if (pattern === 0 && images[i+1] !== undefined) {
      rows.push(
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap, marginBottom:gap }}>
          <ImgTile img={images[i]}   id={`i${startIndex+i}`}   loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i)}   aspectRatio="4/3" index={startIndex+i} />
          <ImgTile img={images[i+1]} id={`i${startIndex+i+1}`} loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i+1)} aspectRatio="4/3" index={startIndex+i+1} />
        </div>
      );
      i += 2;
    } else if (pattern === 1 && images[i+1] !== undefined) {
      rows.push(
        <div key={i} style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap, marginBottom:gap }}>
          <ImgTile img={images[i]}   id={`i${startIndex+i}`}   loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i)}   aspectRatio="16/10" index={startIndex+i} />
          <ImgTile img={images[i+1]} id={`i${startIndex+i+1}`} loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i+1)} aspectRatio="16/10" index={startIndex+i+1} />
        </div>
      );
      i += 2;
    } else if (pattern === 2 && images[i+2] !== undefined) {
      rows.push(
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap, marginBottom:gap }}>
          <ImgTile img={images[i]}   id={`i${startIndex+i}`}   loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i)}   aspectRatio="3/4" index={startIndex+i} />
          <ImgTile img={images[i+1]} id={`i${startIndex+i+1}`} loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i+1)} aspectRatio="3/4" index={startIndex+i+1} />
          <ImgTile img={images[i+2]} id={`i${startIndex+i+2}`} loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i+2)} aspectRatio="3/4" index={startIndex+i+2} />
        </div>
      );
      i += 3;
    } else {
      rows.push(
        <div key={i} style={{ marginBottom:gap }}>
          <ImgTile img={images[i]} id={`i${startIndex+i}`} loaded={loaded} onLoad={onLoad} onClick={() => onOpen(i)} aspectRatio="16/7" index={startIndex+i} />
        </div>
      );
      i += 1;
    }
  }
  return <>{rows}</>;
}

export default ProjectModal;