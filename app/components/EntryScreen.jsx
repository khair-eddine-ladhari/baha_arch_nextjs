"use client"; // required: useState, useEffect, setTimeout/setInterval

import { useEffect, useState } from "react";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function EntryScreen({ onDone }) {
  const [go, setGo]               = useState(false);
  const [wiping, setWiping]       = useState(false);
  const [count, setCount]         = useState(0);
  const [showCount, setShowCount] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setGo(true), 30);

    let n = 0;
    const tick = setInterval(() => {
      n++;
      setCount(n);
      if (n >= 100) clearInterval(tick);
    }, 18);

    const t2 = setTimeout(() => setShowCount(false), 1900);
    const t3 = setTimeout(() => setWiping(true),     2100);
    const t4 = setTimeout(() => onDone?.(),          2900);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      clearInterval(tick);
    };
  }, []);

  return (
    <div style={{
      position:"fixed", inset:0, background:"#fff",
      zIndex:9999, overflow:"hidden", fontFamily:FONT,
    }}>

      <style>{`
        @keyframes wipeAway {
          from { transform: scaleY(1); }
          to   { transform: scaleY(0); }
        }
      `}</style>

      {/* Exit wipe — slides UP from bottom at the end */}
      {wiping && (
        <div style={{
          position:"absolute", inset:0,
          background:"#fff", zIndex:20,
          transformOrigin:"top",
          animation:"wipeAway 0.75s cubic-bezier(0.76,0,0.24,1) forwards",
        }}/>
      )}

      {/* Grid */}
      <svg style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        opacity: go ? 1 : 0, transition:"opacity 0.6s 0.1s", zIndex:0,
      }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0L0 0L0 60" fill="none" stroke="#f5f5f5" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      {/* Rings */}
      {[180, 300].map((size, i) => (
        <div key={i} style={{
          position:"absolute", top:"50%", left:"50%",
          width:size, height:size,
          margin:`-${size/2}px 0 0 -${size/2}px`,
          borderRadius:"50%", border:"0.5px solid #efefef",
          transform: go ? "scale(1)" : "scale(0)",
          transition:`transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.05+i*0.1}s`,
          zIndex:1,
        }}/>
      ))}

      {/* Side lines */}
      {["left","right"].map((side, i) => (
        <div key={side} style={{
          position:"absolute", top:0, [side]:0,
          width:1, height: go ? "100%" : "0%",
          background:"#ebebeb",
          transition:`height 1s cubic-bezier(0.4,0,0.2,1) ${0.05+i*0.1}s`,
        }}/>
      ))}

      {/* Top line */}
      <div style={{
        position:"absolute", top:0, left:0,
        height:1, width: go ? "100%" : "0%",
        background:"#000",
        transition:"width 0.9s cubic-bezier(0.4,0,0.2,1) 0.05s",
      }}/>

      {/* Corner brackets */}
      {[
        { top:14,    left:14,  borderWidth:"1px 0 0 1px" },
        { top:14,    right:14, borderWidth:"1px 1px 0 0" },
        { bottom:14, left:14,  borderWidth:"0 0 1px 1px" },
        { bottom:14, right:14, borderWidth:"0 1px 1px 0" },
      ].map((s, i) => (
        <div key={i} style={{
          position:"absolute", width:14, height:14,
          borderColor:"#ccc", borderStyle:"solid", ...s,
          opacity: go ? 1 : 0,
          transition:"opacity 0.4s 0.2s",
        }}/>
      ))}

      {/* Center */}
      <div style={{
        position:"absolute", inset:0, zIndex:2,
        display:"flex", alignItems:"center",
        justifyContent:"center", flexDirection:"column",
      }}>
        {/* Logo */}
        <div style={{ overflow:"hidden" }}>
          <span style={{
            display:"block",
            fontSize:"clamp(1.8rem,5vw,3.8rem)",
            fontWeight:900, letterSpacing:"0.2em",
            textTransform:"uppercase", color:"#000",
            transform: go ? "translateY(0)" : "translateY(110%)",
            transition:"transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s",
          }}>
            Baha Arch
          </span>
        </div>

        {/* Tagline */}
        <div style={{ overflow:"hidden", marginTop:14 }}>
          <span style={{
            display:"block", fontSize:"0.58rem",
            letterSpacing:"0.4em", textTransform:"uppercase", color:"#aaa",
            transform: go ? "translateY(0)" : "translateY(110%)",
            transition:"transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s",
          }}>
            Architecture & Design
          </span>
        </div>

        {/* Dot */}
        <div style={{
          width:5, height:5, borderRadius:"50%",
          background:"#000", marginTop:22,
          transform: go ? "scale(1)" : "scale(0)",
          transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.35s",
        }}/>
      </div>

      {/* Progress bar */}
      <div style={{
        position:"absolute", bottom:0, left:0,
        height:2, width: go ? "100%" : "0%",
        background:"#000", zIndex:5,
        transition:"width 1.8s cubic-bezier(0.4,0,0.2,1) 0.1s",
      }}/>

      {/* Counter */}
      <div style={{
        position:"absolute", bottom:20, right:24, zIndex:3,
        fontSize:"0.52rem", letterSpacing:"0.2em",
        color:"#ccc", fontWeight:500,
        opacity: showCount ? 1 : 0, transition:"opacity 0.4s",
      }}>
        {String(count).padStart(2,"0")}
      </div>

      {/* Est label */}
      <div style={{
        position:"absolute", bottom:20, left:24, zIndex:3,
        fontSize:"0.52rem", letterSpacing:"0.2em",
        color:"#ddd", textTransform:"uppercase",
        opacity: go ? 1 : 0, transition:"opacity 0.4s 0.2s",
      }}>
        Est. 2024
      </div>

    </div>
  );
}