"use client"; // required: useState, form handling, onClick/onChange

import { useState, useEffect } from "react";
import axios from "axios";
// Note: `Link` from react-router-dom was imported in the original but never used — removed.
import Navbar from "../components/Navbarcontact";
import Footer from "../components/Footer";
import MobileMenu from "../components/MobileMenu";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // was: import.meta.env.VITE_API_URL

function useIsMobile(breakpoint = 768) {
  // Guarded: window doesn't exist during Next.js's server render pass
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  // FIX: the original used `useState(() => {...})` here instead of
  // `useEffect(() => {...})`. That meant the cleanup function returned by
  // the callback was being stored as state instead of actually running on
  // unmount — the media query listener was never properly cleaned up.
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

function ArrowRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContactPage() {
  const isMobile = useIsMobile(768);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [newErrors, setErrors] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const funsubscribe = async () => {
    let errors = {};

    if (!form.name || form.name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!form.email) {
      errors.email = "Email is required.";
    } else if (!form.email.includes("@")) {
      errors.email = "Email must be valid.";
    }

    if (!form.message || form.message.length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }

    setErrors(errors);

    try {
      await axios.post(`${API_URL}/api/messages`, {
        firstName: form.name,
        email: form.email,
        message: form.message,
      });

      setForm({ name: "", email: "", message: "" });
      setErrors({});
      setSuccess(true);
    } catch (error) {
      console.error("Error sending:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] font-[Helvetica,Arial,sans-serif] text-[#222]">

      {/* ─── NAV: desktop = Navbar, mobile = MobileMenu ─── */}
      {isMobile ? <MobileMenu name="Contact" /> : <Navbar />}

      {/* ─── MAIN ─── */}
      <main className="pt-[60px]">
        <div className="w-full px-4 sm:px-10 lg:px-20 pt-12 sm:pt-20 md:pt-[120px] pb-16 md:pb-[120px]">
          <div className="grid grid-cols-1 md:grid-cols-[42%_58%] gap-12 md:gap-0">

            {/* ── Left: Info ── */}
            <div className="pl-2 md:pr-12">
              <h1 className="text-[20px] sm:text-[24px] tracking-[0.25em] uppercase mb-8 md:mb-16">
                CONTACT
              </h1>

              <div className="flex flex-col gap-5 sm:gap-6">
                <a
                  href="mailto:info@minimalstudio.es"
                  className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600 hover:opacity-50 transition-opacity"
                >
                  info@minimalstudio.es
                </a>

                <div className="flex flex-col gap-1">
                  <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">Calle Teodor Canet, 8</p>
                  <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">07400 Puerto de Alcudia. (Baleares) España</p>
                </div>

                <a
                  href="tel:+34660671878"
                  className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600 hover:opacity-50 transition-opacity"
                >
                  +34 660 671 878
                </a>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="pl-2 md:pl-0">
              <div className="flex flex-col gap-8 sm:gap-10">

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] tracking-[0.08em]" htmlFor="name">Name *</label>
                  <input
                    id="name" name="name" type="text"
                    value={form.name} onChange={handleChange}
                    className="bg-transparent border-0 border-b border-[#999] outline-none text-[13px] py-2 focus:border-[#222] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] tracking-[0.08em]" htmlFor="email">Email *</label>
                  <input
                    id="email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    className="bg-transparent border-0 border-b border-[#999] outline-none text-[13px] py-2 focus:border-[#222] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] tracking-[0.08em]" htmlFor="message">Message *</label>
                  <textarea
                    id="message" name="message" rows={4}
                    value={form.message} onChange={handleChange}
                    className="bg-transparent border-0 border-b border-[#999] outline-none text-[13px] py-2 resize-none focus:border-[#222] transition-colors"
                  />
                </div>
                {/* Errors */}
                <div className="flex flex-col gap-1">
                  {Object.values(newErrors).map((err, index) => (
                    <span key={index} className="text-[0.65rem] uppercase tracking-widest font-bold text-red-500">
                      {err}
                    </span>
                  ))}
                </div>

                {/* Success message */}
                {success && (
                  <div className="border-t border-b border-black py-4">
                    <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">
                      Message sent — we'll be in touch soon.
                    </p>
                  </div>
                )}

                {/* Send button */}
                <div>
                  <button
                    onClick={funsubscribe}
                    className="flex items-center gap-2 text-[11px] tracking-[0.2em] cursor-pointer  uppercase border-b border-[#222] pb-0.5 hover:opacity-50 transition-opacity"
                  >
                    SEND
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <footer className="bg-[#efefef] border-t border-[#ddd] pl-3.5">
          <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8 sm:gap-0 pl-5 pr-4 sm:pr-10 lg:pr-20 py-10 sm:py-14">

            {/* Logo */}
            <div>
              <a href="/" className="text-[1.6rem] sm:text-[2.65rem] uppercase tracking-widest font-bold text-black hover:opacity-50 transition-opacity">
                BAHA ARCH
              </a>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-2">
              <a href="tel:+34600655350" className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600 hover:opacity-50 transition-opacity">
                +34 600 655 350
              </a>
              <a href="mailto:info@minimalstudio.es" className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600 hover:opacity-50 transition-opacity">
                info@minimalstudio.es
              </a>
              <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">Calle Teodor Canet, 8, 07400</p>
              <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">Puerto de Alcudia, Mallorca</p>
            </div>

          </div>
        </footer>
      </main>
    </div>
  );
}