// No "use client" needed — no hooks, no event handlers, no interactivity.
// Note: `headerScrolled` is computed once at render and never updates on
// scroll (no listener was ever attached) — kept exactly as in the original.

const Navbar = ({ name }) => {

  // Guarded with typeof window check so this doesn't crash during
  // Next.js's server render pass (window doesn't exist on the server).
  // Behavior is unchanged from before: computed once, not reactive.
  const headerScrolled = typeof window !== "undefined" && window.scrollY > 10;

  const HEADER_H = 57.6;
  const SECTION_H = 44;
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const LINK_CLS = "text-[0.65rem] uppercase tracking-widest font-bold text-black hover:opacity-40 transition-opacity duration-[250ms]";

  function KaanLogo() {
    return (
      <div>
        <p>BAHA ARCHITECTURE</p>
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
        padding: "0 0.75rem", transition: "background 0.25s",
      }}>
         <KaanLogo width={80} />
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {["home", "Work", "Contact", "About"].map(n => (
            <a key={n} href={`${n.toLowerCase()}`} style={{
              fontSize: "0.72rem", fontFamily: FONT, fontWeight: 400,
              letterSpacing: "0.02em", textDecoration: "none", color: "#000",
              borderBottom: n === name ? "1px solid #000" : "none", paddingBottom: 1,
            }}>{n}</a>
          ))}
        </nav>
      </header>
  );
}
export default Navbar;