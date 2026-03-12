import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import ayushImg from "./assets/AYUSH.png";

/* ── Palette ── */
const LIME = "#B8FF1A";
const VIOLET = "#7D39EB";

/* ── Global Styles ── */
function useGlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        background: #000;
        color: #fff;
        font-family: 'Syne', sans-serif;
        cursor: none;
        overflow-x: hidden;
      }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: #000; }
      ::-webkit-scrollbar-thumb { background: ${LIME}; }
      a, button { cursor: none !important; }
      @keyframes mq-ltr { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes mq-rtl { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.7);} }
      .mq-ltr { animation: mq-ltr 28s linear infinite; white-space: nowrap; display: flex; }
      .mq-rtl { animation: mq-rtl 32s linear infinite; white-space: nowrap; display: flex; }
      .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
    `;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
}

/* ── Animated Canvas Background ── */
function BgCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.2 + 0.3,
          a: Math.random() * 0.35 + 0.05,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      const gs = 90;
      for (let x = 0; x < canvas.width; x += gs) {
        const alpha = 0.025 + Math.sin(t * 0.4 + x * 0.008) * 0.015;
        ctx.strokeStyle = `rgba(184,255,26,${alpha})`;
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gs) {
        const alpha = 0.025 + Math.cos(t * 0.3 + y * 0.008) * 0.015;
        ctx.strokeStyle = `rgba(184,255,26,${alpha})`;
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Diagonal accent lines
      for (let i = 0; i < 3; i++) {
        const offset = (t * 30 + i * 300) % (canvas.width + canvas.height);
        ctx.strokeStyle = `rgba(125,57,235,0.06)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(offset - canvas.height, 0);
        ctx.lineTo(offset, canvas.height);
        ctx.stroke();
      }

      // Radial violet glow
      const g = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.35, 0, canvas.width / 2, canvas.height * 0.35, canvas.width * 0.55);
      g.addColorStop(0, `rgba(125,57,235,0.07)`);
      g.addColorStop(1, `transparent`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,255,26,${p.a})`;
        ctx.fill();
      });

      t += 0.007;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* ── Custom Cursor ── */
function Cursor() {
  const mx = useMotionValue(-200), my = useMotionValue(-200);
  const sx = useSpring(mx, { damping: 22, stiffness: 220 });
  const sy = useSpring(my, { damping: 22, stiffness: 220 });
  const [state, setState] = useState({ big: false, label: "" });

  useEffect(() => {
    const onMove = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    const onOver = (e) => {
      const el = e.target.closest("[data-cur]");
      if (el) setState({ big: true, label: el.dataset.cur || "" });
    };
    const onOut = () => setState({ big: false, label: "" });
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <>
      <motion.div
        style={{ position: "fixed", left: sx, top: sy, x: "-50%", y: "-50%", zIndex: 99999, pointerEvents: "none", mixBlendMode: "difference" }}
      >
        <motion.div
          animate={{ width: state.big ? 68 : 13, height: state.big ? 68 : 13 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          style={{ borderRadius: "50%", background: LIME, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
        >
          {state.label ? (
            <span style={{ fontSize: 8, color: "#000", fontFamily: "IBM Plex Mono", fontWeight: 600, whiteSpace: "nowrap", letterSpacing: 0.5 }}>
              {state.label}
            </span>
          ) : null}
        </motion.div>
      </motion.div>
      <motion.div
        style={{ position: "fixed", left: sx, top: sy, x: "-50%", y: "-50%", zIndex: 99998, pointerEvents: "none", width: 38, height: 38, borderRadius: "50%", border: `1px solid rgba(184,255,26,0.25)` }}
        animate={{ scale: state.big ? 1.4 : 1, opacity: state.big ? 0.4 : 0.25 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      />
    </>
  );
}

/* ── Fade-up wrapper ── */
function FU({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ y: 55, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Section Label ── */
const SL = ({ n, label }) => (
  <div style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: LIME, letterSpacing: 3, marginBottom: 16 }}>
    {n} / {label}
  </div>
);

/* ── Nav ── */
function Nav({ show }) {
  return (
    <motion.nav
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span style={{ fontFamily: "Bebas Neue", fontSize: 22, color: LIME, letterSpacing: 5 }}>ASHMONEYKASH</span>
      <div style={{ display: "flex", gap: 36 }}>
        {["About", "Work", "Skills", "Contact"].map(item => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            data-cur={item}
            style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontFamily: "IBM Plex Mono", fontSize: 11, letterSpacing: 2, transition: "color 0.3s" }}
            onMouseEnter={e => (e.target.style.color = LIME)}
            onMouseLeave={e => (e.target.style.color = "rgba(255,255,255,0.55)")}
          >
            {item.toUpperCase()}
          </a>
        ))}
      </div>
      <motion.button
        onClick={() => window.open("https://drive.google.com/file/d/1Fv2QDyPxeTayY3Qo9d73-rF2gWbFmnRO/view?usp=sharing", "_blank")}
        whileHover={{ scale: 1.04, boxShadow: `0 0 24px ${LIME}55` }}
        whileTap={{ scale: 0.96 }}
        data-cur="Hire"
        style={{ background: LIME, color: "#000", border: "none", padding: "10px 22px", fontFamily: "Syne", fontWeight: 700, fontSize: 13, borderRadius: 3, letterSpacing: 1 }}
      >
        RESUME
      </motion.button>
    </motion.nav>
  );
}

/* ── Hero ── */
function Hero({ onReveal }) {
  const [clicked, setClicked] = useState(false);
  const [morphed, setMorphed] = useState(false);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    setTimeout(() => setMorphed(true), 900);
    setTimeout(() => onReveal(), 1800);
  };

  return (
    <motion.section
      animate={morphed ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "#000", overflow: "hidden",
        pointerEvents: morphed ? "none" : "auto",
      }}
    >
      {/* Top marquee */}
      <motion.div
        animate={clicked ? { opacity: 0, y: -24 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{ position: "absolute", top: "15%", left: 0, right: 0, overflow: "hidden" }}
      >
        <div className="mq-ltr" style={{ fontFamily: "Bebas Neue", fontSize: "clamp(60px, 10vw, 130px)", color: "rgba(255,255,255,0.045)", letterSpacing: 10 }}>
          {"DATA SCIENCE — FULL STACK DEVELOPER — DESIGNER — ".repeat(4)}
        </div>
      </motion.div>

      {/* Bottom marquee */}
      <motion.div
        animate={clicked ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        style={{ position: "absolute", bottom: "15%", left: 0, right: 0, overflow: "hidden" }}
      >
        <div className="mq-rtl" style={{ fontFamily: "Bebas Neue", fontSize: "clamp(60px, 10vw, 130px)", color: "rgba(184,255,26,0.04)", letterSpacing: 10 }}>
          {"PYTHON — DJANGO — FLASK — POSTGRESQL — JAVASCRIPT — ".repeat(4)}
        </div>
      </motion.div>

      {/* Portrait */}
      <motion.div
        animate={clicked ? { scale: 1.07 } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        onClick={handleClick}
        data-cur="Enter"
        style={{
          width: 210, height: 268,
          borderRadius: 10,
          background: "linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 50%, #0a0a0a 100%)",
          border: `1px solid rgba(184,255,26,0.18)`,
          position: "relative", overflow: "hidden",
          boxShadow: `0 0 60px rgba(125,57,235,0.25), 0 0 120px rgba(125,57,235,0.08)`,
          zIndex: 10,
        }}
      >
        {/* Inner glow */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(125,57,235,0.12) 0%, transparent 60%, rgba(184,255,26,0.04) 100%)" }} />
        {/* Scanlines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 5px)", pointerEvents: "none" }} />
        {/* Figure silhouette */}
        <img src={ayushImg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        <div className="pulse-dot" style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: "50%", background: LIME, boxShadow: `0 0 12px ${LIME}` }} />
        {/* CTA */}
        <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", fontFamily: "IBM Plex Mono", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ color: LIME, marginRight: 4 }}>▶</span>CLICK TO ENTER
        </div>
      </motion.div>

      {/* Name */}
      <div style={{ marginTop: 28, zIndex: 10, textAlign: "center" }}>
        <AnimatePresence mode="wait">
          {!clicked ? (
            <motion.h1
              key="a"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, scale: 1.06 }}
              transition={{ duration: 0.45 }}
              style={{ fontFamily: "Bebas Neue", fontSize: "clamp(36px, 7.5vw, 92px)", letterSpacing: 14, color: "#fff", margin: 0 }}
            >
              AYUSH SALARIA
            </motion.h1>
          ) : (
            <motion.h1
              key="b"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontFamily: "Bebas Neue", fontSize: "clamp(36px, 7.5vw, 92px)", letterSpacing: 14, color: LIME, margin: 0, textShadow: `0 0 50px ${LIME}88` }}
            >
              ASHMONEYKASH
            </motion.h1>
          )}
        </AnimatePresence>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.38 }}
          transition={{ delay: 1.2 }}
          style={{ fontFamily: "IBM Plex Mono", fontSize: 11, letterSpacing: 5, marginTop: 10, color: "#fff" }}
        >
          DATA SCIENCE · FULL STACK · DESIGN
        </motion.p>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", fontFamily: "IBM Plex Mono", fontSize: 10, letterSpacing: 3, opacity: 0.25, color: "#fff" }}
      >
        ↓ SCROLL
      </motion.div>
    </motion.section>
  );
}

/* ── About ── */
function About() {
  const techs = ["Python", "Django", "Flask", "PostgreSQL", "REST APIs", "JavaScript"];
  const socials = [
    { label: "GitHub", icon: "◈", href: "https://github.com/ashmoneykash" },
    { label: "LinkedIn", icon: "◉", href: "https://www.linkedin.com/in/ashmoneykash/" },
    { label: "Instagram", icon: "◎", href: "https://www.instagram.com/ashmoneykash/" },
    { label: "Email", icon: "◷", href: "mailto:ayushsalaria321@gmail.com" },
  ];

  return (
    <section id="about" style={{ padding: "160px 80px", position: "relative", zIndex: 10 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center" }}>

        <FU>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "100%", paddingBottom: "125%",
              borderRadius: 14,
              background: "linear-gradient(145deg, #0c0c0c 0%, #161616 60%, #0a0a0a 100%)",
              border: "1px solid rgba(184,255,26,0.12)",
              position: "relative", overflow: "hidden",
              boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 60px rgba(125,57,235,0.12)`,
            }}>
              <img src={ayushImg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", borderRadius: 14 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(125,57,235,0.1) 0%, transparent 55%, rgba(184,255,26,0.04) 100%)" }} />
              <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 5px)" }} />
              {/* Bottom gradient */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />
              {/* Corner grid accent */}
              <div style={{ position: "absolute", bottom: 24, left: 24, fontFamily: "IBM Plex Mono", fontSize: 10, color: "rgba(184,255,26,0.4)", lineHeight: 2 }}>
                <div>$ cat skills.json</div>
                <div style={{ color: "rgba(255,255,255,0.25)" }}>{`{ "stack": "full" }`}</div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{ position: "absolute", top: -14, right: -14, background: LIME, color: "#000", padding: "8px 16px", borderRadius: 3, fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 600, letterSpacing: 1 }}
            >
              Available ✓
            </motion.div>

            {/* Side accent line */}
            <div style={{ position: "absolute", left: -16, top: "20%", bottom: "20%", width: 2, background: `linear-gradient(180deg, transparent, ${LIME}, transparent)`, borderRadius: 1 }} />
          </div>
        </FU>

        <FU delay={0.18}>
          <div>
            <SL n="01" label="ABOUT" />
            <h2 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.92, marginBottom: 32, letterSpacing: 3 }}>
              BUILDING<br /><span style={{ color: LIME }}>SCALABLE</span><br />SOLUTIONS
            </h2>

            <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28, marginBottom: 28 }}>
              <p style={{ lineHeight: 1.85, opacity: 0.75, fontSize: 14.5, marginBottom: 14 }}>
                Computer Science student and full-stack developer passionate about building scalable web applications and solving complex problems.
              </p>
              <p style={{ lineHeight: 1.85, opacity: 0.5, fontSize: 13.5 }}>
                Experience with Python, Django, Flask, PostgreSQL and REST APIs. Enjoy building data-driven applications and exploring new technologies.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {techs.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ background: LIME, color: "#000", borderColor: LIME }}
                  style={{ padding: "5px 13px", border: `1px solid rgba(184,255,26,0.28)`, borderRadius: 2, fontFamily: "IBM Plex Mono", fontSize: 11, color: LIME, transition: "all 0.25s" }}
                >
                  {s}
                </motion.span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              {socials.map(s => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-cur={s.label}
                  whileHover={{ y: -5 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "IBM Plex Mono", fontSize: 9, letterSpacing: 1, transition: "color 0.3s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = LIME)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                >
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  {s.label}
                </motion.a>
              ))}
            </div>
          </div>
        </FU>
      </div>
    </section>
  );
}

/* ── Projects ── */
const PROJECTS = [
  {
    name: "NexGen",
    url: "https://nexgen-6whl.onrender.com/home/",
    sub: "E-commerce Platform",
    tech: "Django · PostgreSQL · Redis",
    desc: "Full-featured e-commerce platform with real-time inventory management, Stripe payment integration, and an analytics dashboard tracking customer behavior.",
    accent: LIME,
    bg: "linear-gradient(145deg, #090f00 0%, #050a00 100%)",
  },
  {
    name: "FinanceBoard",
    url: "https://github.com/ashmoneykash/finance-dashboard",
    sub: "Expense Tracker",
    tech: "Flask · SQLAlchemy · Chart.js",
    desc: "Intelligent personal finance tracker with ML-powered spending insights.",
    accent: VIOLET,
    bg: "linear-gradient(145deg, #0b0014 0%, #06000c 100%)",
  },
  {
    name: "EVBoard",
    url: "https://github.com/ashmoneykash/DATA-SCIENCE-PROJECT",
    sub: "EV Data Dashboard",
    tech: "Python · Pandas · Plotly",
    desc: "Interactive analytics for EV market data with real-time trend analysis.",
    accent: "#00d4ff",
    bg: "linear-gradient(145deg, #00101a 0%, #000d14 100%)",
  },
];

function PCard({ p, large }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      onClick={() => window.open(p.url, "_blank")}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      whileHover={{ scale: 1.012, y: -4 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      data-cur="View"
      style={{
        borderRadius: 12,
        background: p.bg,
        border: `1px solid ${p.accent}1a`,
        padding: large ? "56px 48px" : "36px 32px",
        height: large ? "100%" : "auto",
        minHeight: large ? 480 : 200,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        animate={{ opacity: hov ? 1 : 0 }}
        style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 40% 40%, ${p.accent}0e, transparent 70%)`, pointerEvents: "none" }}
      />
      {/* Corner bracket */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, borderLeft: `1px solid ${p.accent}22`, borderBottom: `1px solid ${p.accent}22`, borderBottomLeftRadius: 10 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderRight: `1px solid ${p.accent}15`, borderTop: `1px solid ${p.accent}15`, borderTopRightRadius: 6 }} />

      <div style={{ fontFamily: "IBM Plex Mono", fontSize: 10, color: `${p.accent}88`, letterSpacing: 2, marginBottom: 14 }}>{p.tech}</div>
      <h3 style={{ fontFamily: "Bebas Neue", fontSize: large ? "clamp(44px, 5vw, 80px)" : 42, letterSpacing: 5, margin: "0 0 6px", color: "#fff", lineHeight: 1 }}>{p.name}</h3>
      <div style={{ fontFamily: "Syne", fontSize: 13, color: p.accent, marginBottom: large ? 22 : 0, fontWeight: 600 }}>{p.sub}</div>
      {large && <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.55, maxWidth: 340 }}>{p.desc}</p>}

      <motion.div
        animate={{ opacity: hov ? 1 : 0, x: hov ? 0 : 12 }}
        transition={{ duration: 0.3 }}
        style={{ position: "absolute", bottom: 28, right: 28, background: p.accent, color: "#000", padding: "9px 18px", borderRadius: 3, fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 600, letterSpacing: 1 }}
      >
        VIEW →
      </motion.div>
    </motion.div>
  );
}

function Work() {
  return (
    <section id="work" style={{ padding: "120px 80px", position: "relative", zIndex: 10 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <FU>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 72 }}>
            <div>
              <SL n="02" label="WORK" />
              <h2 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(48px, 6.5vw, 100px)", lineHeight: 0.88, letterSpacing: 5, margin: 0 }}>
                SELECTED<br />PROJECTS
              </h2>
            </div>
            <span style={{ fontFamily: "IBM Plex Mono", fontSize: 11, opacity: 0.3, letterSpacing: 1 }}>03 Projects</span>
          </div>
        </FU>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>
          <FU style={{ gridRow: "span 2" }}>
            <PCard p={PROJECTS[0]} large />
          </FU>
          <FU delay={0.1}>
            <PCard p={PROJECTS[1]} large={false} />
          </FU>
          <FU delay={0.18}>
            <PCard p={PROJECTS[2]} large={false} />
          </FU>
        </div>
      </div>
    </section>
  );
}

/* ── Skills ── */
const SKILLS = [
  "Python", "C++", "JavaScript", "Django",
  "Flask", "PostgreSQL", "MySQL", "REST APIs",
  "Git", "GitHub", "Postman", "Render",
];

function SkillCell({ skill, i }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      animate={{ background: hov ? LIME : "rgba(255,255,255,0.018)" }}
      style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "28px 22px", position: "relative", overflow: "hidden" }}
    >
      {hov && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ position: "absolute", inset: 0, background: LIME, zIndex: 0, borderRadius: 4 }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "IBM Plex Mono", fontSize: 9, opacity: 0.35, letterSpacing: 2, marginBottom: 8, color: hov ? "#000" : "#fff" }}>
          {String(i + 1).padStart(2, "0")}
        </div>
        <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 17, letterSpacing: 0.5, color: hov ? "#000" : "#fff" }}>
          {skill}
        </div>
      </div>
    </motion.div>
  );
}

function Skills() {
  return (
    <section id="skills" style={{ padding: "120px 80px", position: "relative", zIndex: 10 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <FU>
          <div style={{ marginBottom: 72 }}>
            <SL n="03" label="SKILLS" />
            <h2 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(48px, 6.5vw, 100px)", lineHeight: 0.88, letterSpacing: 5, margin: 0 }}>
              TECH<br /><span style={{ color: LIME }}>STACK</span>
            </h2>
          </div>
        </FU>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {SKILLS.map((s, i) => (
            <FU key={s} delay={i * 0.03}>
              <SkillCell skill={s} i={i} />
            </FU>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Achievements ── */
const ACH = [
  { title: "7th Rank", sub: "Hackathon CTF", desc: "Competed against 200+ teams in a cybersecurity Capture The Flag event, placing 7th overall.", icon: "🏆" },
  { title: "Champion", sub: "Brigade Badminton League", desc: "Clinched the Brigade level badminton league championship through skill and determination.", icon: "🏸" },
];

function Achievements() {
  return (
    <section style={{ padding: "120px 80px", position: "relative", zIndex: 10 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <FU>
          <div style={{ marginBottom: 72 }}>
            <SL n="04" label="ACHIEVEMENTS" />
            <h2 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(48px, 6.5vw, 100px)", lineHeight: 0.88, letterSpacing: 5, margin: 0 }}>
              WINS &amp;<br /><span style={{ color: LIME }}>GLORY</span>
            </h2>
          </div>
        </FU>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {ACH.map((a, i) => (
            <FU key={a.title} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -8, borderColor: `${LIME}55` }}
                style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "44px 40px", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", transition: "border-color 0.3s" }}
              >
                <div style={{ fontSize: 44, marginBottom: 18 }}>{a.icon}</div>
                <h3 style={{ fontFamily: "Bebas Neue", fontSize: 56, letterSpacing: 4, margin: "0 0 8px", color: LIME }}>{a.title}</h3>
                <div style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 16 }}>{a.sub}</div>
                <p style={{ opacity: 0.55, lineHeight: 1.75, fontSize: 14 }}>{a.desc}</p>
              </motion.div>
            </FU>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Education ── */
function Education() {
  return (
    <section id="education" style={{ padding: "120px 80px", position: "relative", zIndex: 10 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <FU>
          <div style={{ marginBottom: 72 }}>
            <SL n="05" label="EDUCATION" />
            <h2 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(48px, 6.5vw, 100px)", lineHeight: 0.88, letterSpacing: 5, margin: 0 }}>
              KNOWLEDGE<br /><span style={{ color: LIME }}>BASE</span>
            </h2>
          </div>
        </FU>
        <FU delay={0.15}>
          <div style={{ display: "flex", gap: 40 }}>
            <div style={{ width: 1, background: `linear-gradient(180deg, ${LIME} 0%, transparent 100%)`, flexShrink: 0, position: "relative", marginTop: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: LIME, position: "absolute", top: 0, left: -5.5, boxShadow: `0 0 20px ${LIME}` }} />
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "44px 40px" }}>
              <div style={{ fontFamily: "IBM Plex Mono", fontSize: 10, color: LIME, letterSpacing: 2, marginBottom: 12 }}>2023 → PRESENT</div>
              <h3 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: 3, margin: "0 0 12px", color: "#fff" }}>
                LOVELY PROFESSIONAL UNIVERSITY
              </h3>
              <div style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 17, color: "rgba(255,255,255,0.65)", marginBottom: 16 }}>
                BTech — Computer Science Engineering
              </div>
              <p style={{ opacity: 0.45, lineHeight: 1.75, fontSize: 13.5, maxWidth: 480 }}>
                Pursuing rigorous computer science curriculum with focus on data structures, algorithms, system design, and full-stack web development.
              </p>
            </div>
          </div>
        </FU>

        <FU delay={0.25}>
          <div style={{ display: "flex", gap: 40, marginTop: 24 }}>
            <div style={{ width: 1, background: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)`, flexShrink: 0, position: "relative", marginTop: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: `1px solid rgba(255,255,255,0.4)`, position: "absolute", top: 0, left: -5.5 }} />
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "44px 40px" }}>
              <div style={{ fontFamily: "IBM Plex Mono", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 12 }}>2020 → 2022</div>
              <h3 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: 3, margin: "0 0 12px", color: "rgba(255,255,255,0.75)" }}>
                ARMY PUBLIC SCHOOL KALUCHAK
              </h3>
              <div style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 17, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                Higher Secondary — Science (PCM + CS)
              </div>
              <p style={{ opacity: 0.35, lineHeight: 1.75, fontSize: 13.5, maxWidth: 480 }}>
                Completed senior secondary education with Physics, Chemistry, Mathematics and Computer Science, building the foundation for engineering studies.
              </p>
            </div>
          </div>
        </FU>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer id="contact" style={{ padding: "120px 80px 72px", position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <FU>
          <h2 style={{
            fontFamily: "Bebas Neue",
            fontSize: "clamp(64px, 14vw, 200px)",
            lineHeight: 0.82,
            letterSpacing: 6,
            margin: "0 0 64px",
          }}>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>ASH</span>
            <br />
            <span style={{ color: LIME, textShadow: `0 0 80px ${LIME}44` }}>MONEY</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.15)" }}>KASH</span>
          </h2>
        </FU>

        <FU delay={0.1}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 40, marginBottom: 72 }}>
            <div>
              <p style={{ opacity: 0.35, fontSize: 13, marginBottom: 24, fontFamily: "IBM Plex Mono", letterSpacing: 1 }}>
                Open to opportunities · Phagwara, India
              </p>
              <div style={{ display: "flex", gap: 28 }}>
                {[
                  { label: "GitHub",    href: "https://github.com/ashmoneykash" },
                  { label: "LinkedIn",  href: "https://linkedin.com/in/ashmoneykash" },
                  { label: "Instagram", href: "https://instagram.com/ashmoneykash" },
                  { label: "Email",     href: "mailto:ayushsalaria321@gmail.com" },
                ].map(s => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cur={s.label}
                    whileHover={{ color: LIME }}
                    style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "IBM Plex Mono", fontSize: 11, letterSpacing: 2, transition: "color 0.3s" }}
                  >
                    {s.label}
                  </motion.a>
                ))}
              </div>
            </div>

            <motion.button
              onClick={() => window.open("mailto:ayushsalaria321@gmail.com", "_blank")}
              whileHover={{ scale: 1.04, boxShadow: `0 0 50px ${LIME}55` }}
              whileTap={{ scale: 0.96 }}
              data-cur="👋 Hi"
              style={{ background: LIME, color: "#000", border: "none", padding: "20px 52px", fontFamily: "Bebas Neue", fontSize: 26, letterSpacing: 5, borderRadius: 4 }}
            >
              LET'S CONNECT
            </motion.button>
          </div>
        </FU>

        <div style={{ paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", opacity: 0.22, fontFamily: "IBM Plex Mono", fontSize: 10, letterSpacing: 1 }}>
          <span>© 2025 Ayush Salaria</span>
          <span>Built with React + Framer Motion</span>
        </div>
      </div>
    </footer>
  );
}

/* ── Stats Strip ── */
function StatsStrip({ show }) {
  const stats = ["3 Projects", "2 Hackathons", "5+ Technologies", "1 Championship"];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={show ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0", overflow: "hidden" }}
    >
      <div className="mq-ltr" style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 4, padding: "14px 0" }}>
        {[...stats, ...stats, ...stats, ...stats].map((s, i) => (
          <span key={i} style={{ marginRight: 60 }}>
            <span style={{ color: `${LIME}66`, marginRight: 10 }}>◆</span>{s}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ── App ── */
export default function Portfolio() {
  const [revealed, setRevealed] = useState(false);

  useGlobalStyles();

  return (
    <div style={{ background: "#000", minHeight: "100vh", position: "relative" }}>
      <BgCanvas />
      <Cursor />

      <AnimatePresence>
        {!revealed && <Hero onReveal={() => setRevealed(true)} />}
      </AnimatePresence>

      <Nav show={revealed} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.85, delay: 0.25 }}
        style={{ position: "relative", zIndex: 10 }}
      >
        <div style={{ height: 80 }} />
        <StatsStrip show={revealed} />
        <About />
        <Work />
        <Skills />
        <Achievements />
        <Education />
        <Footer />
      </motion.div>
    </div>
  );
}
