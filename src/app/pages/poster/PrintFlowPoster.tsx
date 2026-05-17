/* ─── PrintFlow Promotional Poster · 76.2 × 152.4 mm (3 × 6 in) ─── */
import React from 'react';

/* ── SVG QR Code ──────────────────────────────────────────────────── */
function QRCode({ size = 80 }: { size?: number }) {
  const G = 21;
  const isOn = (r: number, c: number): boolean => {
    const finder = (br: number, bc: number) => {
      const lr = r - br, lc = c - bc;
      if (lr < 0 || lr > 6 || lc < 0 || lc > 6) return null;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };
    for (const [br, bc] of [[0,0],[0,14],[14,0]] as [number,number][]) {
      const v = finder(br, bc); if (v !== null) return v;
    }
    if (r === 6 || c === 6) return (r + c) % 2 === 0;
    if ((r === 7 && c <= 7) || (c === 7 && r <= 7)) return false;
    if ((r === 7 && c >= 13) || (c === 13 && r <= 7)) return false;
    const lr = r - 14, lc = c - 16;
    if (lr >= 0 && lr <= 2 && lc >= 0 && lc <= 2)
      return lr === 0 || lr === 2 || lc === 0 || lc === 2;
    return (r * 31 + c * 17 + r * c * 7) % 100 > 34;
  };
  const dots: [number, number][] = [];
  for (let r = 0; r < G; r++)
    for (let c = 0; c < G; c++)
      if (isOn(r, c)) dots.push([r, c]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${G} ${G}`} shapeRendering="crispEdges">
      {dots.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="white" />
      ))}
    </svg>
  );
}

/* ── Phone SVG Illustration (viewBox 0 0 140 280 → rendered 130×260) ── */
function PhoneSVG() {
  const days = [['M',20],['T',21],['W',22],['T',23],['F',24],['S',25],['S',26]] as [string,number][];
  const slots = [['8 AM', false],['11 AM', false],['2 PM', true]] as [string,boolean][];

  return (
    <svg
      viewBox="0 0 140 280"
      width={130}
      height={260}
      style={{ filter: 'drop-shadow(0 8px 22px rgba(0,46,44,0.42))', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="ph_hg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#002E2C" />
          <stop offset="100%" stopColor="#00736D" />
        </linearGradient>
        <linearGradient id="ph_frame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c3a3a" />
          <stop offset="100%" stopColor="#111f1f" />
        </linearGradient>
        <clipPath id="ph_screen_clip">
          <rect x="7" y="7" width="126" height="266" rx="14" />
        </clipPath>
      </defs>

      {/* Frame */}
      <rect x="0" y="0" width="140" height="280" rx="22" fill="url(#ph_frame)" />
      {/* Power button */}
      <rect x="138" y="70" width="4" height="26" rx="2" fill="#0d1a1a" />
      {/* Volume buttons */}
      <rect x="-2" y="58" width="4" height="18" rx="2" fill="#0d1a1a" />
      <rect x="-2" y="82" width="4" height="18" rx="2" fill="#0d1a1a" />
      {/* Screen */}
      <rect x="7" y="7" width="126" height="266" rx="14" fill="white" />
      {/* Dynamic island */}
      <rect x="49" y="10" width="42" height="8" rx="4" fill="#111f1f" />
      {/* Home bar */}
      <rect x="52" y="271" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />

      {/* STATUS BAR */}
      <rect x="7" y="7" width="126" height="19" fill="#002E2C" clipPath="url(#ph_screen_clip)" />
      <text x="13" y="19.5" fill="rgba(255,255,255,0.72)" fontSize="7.5" fontWeight="700" fontFamily="Inter,sans-serif">9:41</text>
      {/* battery icon */}
      <rect x="116" y="11" width="14" height="7" rx="1.5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <rect x="130.2" y="13" width="1.5" height="3" rx="0.5" fill="rgba(255,255,255,0.4)" />
      <rect x="117" y="12" width="10" height="5" rx="0.8" fill="white" fillOpacity="0.6" />

      {/* APP HEADER */}
      <rect x="7" y="26" width="126" height="26" fill="url(#ph_hg)" />
      <text x="13" y="35" fill="rgba(255,255,255,0.5)" fontSize="4.8" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="0.6">WELCOME BACK</text>
      <text x="13" y="47" fill="white" fontSize="9.5" fontWeight="900" fontFamily="Inter,sans-serif">Student 👋</text>
      {/* Avatar placeholder */}
      <circle cx="127" cy="39" r="7" fill="rgba(255,255,255,0.12)" />
      <circle cx="127" cy="37" r="2.8" fill="rgba(255,255,255,0.5)" />
      <path d="M121 47c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="rgba(255,255,255,0.35)" />

      {/* TOGGLE */}
      <rect x="9" y="56" width="122" height="16" rx="8" fill="#E6F1F0" />
      <rect x="11" y="58" width="59" height="12" rx="6" fill="url(#ph_hg)" />
      <text x="40.5" y="67.2" fill="white" fontSize="5.8" fontWeight="900" fontFamily="Inter,sans-serif" textAnchor="middle">Print Now</text>
      <text x="101" y="67.2" fill="#80B9B6" fontSize="5.8" fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">Schedule</text>

      {/* CALENDAR LABEL */}
      <text x="9" y="81" fill="#002E2C" fontSize="6.2" fontWeight="900" fontFamily="Inter,sans-serif">Select Date</text>
      <text x="131" y="81" fill="#80B9B6" fontSize="4.8" fontWeight="600" fontFamily="Inter,sans-serif" textAnchor="end">May 2026</text>

      {/* CALENDAR DAYS */}
      {days.map(([d, n], i) => {
        const x = 9 + i * 17.5;
        const sel = i === 2;
        return (
          <g key={i}>
            {sel && <rect x={x - 0.5} y="83" width="16" height="24" rx="5.5" fill="url(#ph_hg)" />}
            <text x={x + 7.5} y="92" fill={sel ? 'rgba(255,255,255,0.65)' : '#80B9B6'} fontSize="4.2" fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">{d}</text>
            <text x={x + 7.5} y="103" fill={sel ? 'white' : '#002E2C'} fontSize="7.5" fontWeight="900" fontFamily="Inter,sans-serif" textAnchor="middle">{n}</text>
          </g>
        );
      })}

      {/* TIME CHIPS */}
      {slots.map(([t, sel], i) => {
        const x = 9 + i * 40.5;
        return (
          <g key={t}>
            <rect x={x} y="111" width="36" height="12" rx="6" fill={sel ? '#00736D' : 'white'} stroke={sel ? 'none' : 'rgba(128,185,182,0.45)'} strokeWidth="0.7" />
            <text x={x + 18} y="120.5" fill={sel ? 'white' : '#002E2C'} fontSize="5.5" fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">{t}</text>
          </g>
        );
      })}

      {/* MAP AREA */}
      <rect x="9" y="128" width="122" height="88" rx="7" fill="#E8F5E9" />
      {/* Roads */}
      <rect x="9" y="157" width="122" height="2.5" fill="#DCEDC8" />
      <rect x="9" y="189" width="122" height="2.5" fill="#DCEDC8" />
      <rect x="55" y="128" width="2.5" height="88" fill="#DCEDC8" />
      <rect x="98" y="128" width="2.5" height="88" fill="#DCEDC8" />
      {/* Blocks */}
      <rect x="11" y="130" width="42" height="25" rx="3" fill="#C8E6C9" />
      <rect x="59" y="130" width="37" height="25" rx="3" fill="#C8E6C9" />
      <rect x="103" y="130" width="26" height="25" rx="3" fill="#C8E6C9" />
      <rect x="11" y="161" width="42" height="26" rx="3" fill="#C8E6C9" />
      <rect x="59" y="161" width="37" height="26" rx="3" fill="#C8E6C9" />
      <rect x="103" y="161" width="26" height="26" rx="3" fill="#C8E6C9" />
      <rect x="11" y="193" width="42" height="21" rx="3" fill="#C8E6C9" />
      <rect x="59" y="193" width="37" height="21" rx="3" fill="#C8E6C9" />
      {/* Pins */}
      <circle cx="77" cy="144" r="6" fill="#00736D" /><circle cx="77" cy="144" r="2.6" fill="white" />
      <circle cx="116" cy="172" r="6" fill="#FF7043" /><circle cx="116" cy="172" r="2.6" fill="white" />
      <circle cx="32" cy="175" r="6" fill="#00736D" /><circle cx="32" cy="175" r="2.6" fill="white" />
      {/* User */}
      <circle cx="72" cy="158" r="4.5" fill="#1976D2" opacity="0.92" />
      <circle cx="72" cy="158" r="9" fill="#1976D2" opacity="0.12" />
      {/* Map label */}
      <rect x="11" y="130" width="82" height="11.5" rx="2.5" fill="rgba(255,255,255,0.92)" />
      <text x="15" y="139.5" fill="#002E2C" fontSize="5.8" fontWeight="700" fontFamily="Inter,sans-serif">Partner Shops Near You</text>

      {/* UPLOAD */}
      <rect x="9" y="223" width="122" height="19" rx="5.5" fill="none" stroke="rgba(128,185,182,0.5)" strokeWidth="1.1" strokeDasharray="3.5,2.5" />
      <text x="70" y="235.5" fill="#80B9B6" fontSize="6.8" fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">↑  Upload Document</text>

      {/* CTA BUTTON */}
      <rect x="9" y="248" width="122" height="21" rx="6.5" fill="url(#ph_hg)" />
      <text x="70" y="262.5" fill="white" fontSize="7.2" fontWeight="900" fontFamily="Inter,sans-serif" textAnchor="middle">Continue to Print →</text>
    </svg>
  );
}

/* ── Poster Page ──────────────────────────────────────────────────── */
export default function PrintFlowPoster() {
  return (
    <div
      className="pf-bg"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #9db5b3 0%, #b8cecc 50%, #9db5b3 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 64,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Print styles ── */}
      <style>{`
        @media print {
          @page { size: 76.2mm 152.4mm; margin: 0; }
          body { background: white !important; margin: 0 !important; }
          .pf-bg { background: white !important; padding: 0 !important; min-height: 0 !important; align-items: flex-start !important; }
          .pf-print-hide { display: none !important; }
          #printflow-poster { box-shadow: none !important; }
        }
      `}</style>

      {/* Print button */}
      <button
        className="pf-print-hide"
        onClick={() => window.print()}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(to right, #00736D, #002E2C)',
          color: 'white', fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0,46,44,0.45)',
        }}
      >
        🖨️ Print Poster
      </button>

      {/* Dimension label */}
      <div className="pf-print-hide" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ height: 1, width: 48, background: 'rgba(0,46,44,0.3)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,46,44,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          76.2 × 152.4 mm
        </span>
        <div style={{ height: 1, width: 48, background: 'rgba(0,46,44,0.3)' }} />
      </div>

      {/* ════════════════════════════════════════════════════════
          POSTER  ·  540 × 1080 px (1 : 2)
          @media print → 76.2 × 152.4 mm via @page
      ════════════════════════════════════════════════════════ */}
      <div
        id="printflow-poster"
        style={{
          width: 540,
          height: 1080,
          background: 'white',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 16px 56px rgba(0,0,0,0.35)',
        }}
      >

        {/* ══════════════════════════════════════════════════════
            §1  HERO  ·  300 px
        ══════════════════════════════════════════════════════ */}
        <div style={{
          height: 300,
          background: 'linear-gradient(158deg, #001a19 0%, #005550 55%, #002E2C 100%)',
          padding: '32px 44px 28px',
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative rings */}
          <div style={{ position:'absolute', width:340, height:340, top:-130, right:-100, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', width:200, height:200, top:-60, right:-40, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)' }} />
          <div style={{ position:'absolute', width:160, height:160, bottom:-70, left:-40, borderRadius:'50%', background:'rgba(128,185,182,0.06)' }} />

          {/* Logo row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 22 }}>
            <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
              {/* ── Logo tile — matches app: gradient from #00736D → #002E2C, Lucide Printer icon ── */}
              <div style={{
                width: 48, height: 48, borderRadius: 16,
                background: 'linear-gradient(135deg, #00736D 0%, #002E2C 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,115,109,0.5), 0 2px 8px rgba(0,0,0,0.3)',
                flexShrink: 0,
              }}>
                {/* Exact Lucide Printer paths */}
                <svg
                  viewBox="0 0 24 24"
                  width={26}
                  height={26}
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                  <rect x="6" y="14" width="12" height="8" rx="1" />
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'Syne, Inter, sans-serif', letterSpacing: '-0.025em', lineHeight: 1 }}>
                  PrintFlow
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(128,185,182,0.75)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Smart Printing
                </span>
              </div>
            </div>

            {/* Live badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 40,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em' }}>Available Now</span>
            </div>
          </div>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 40, alignSelf: 'flex-start', marginBottom: 14,
            background: 'rgba(128,185,182,0.15)', border: '1px solid rgba(128,185,182,0.3)',
          }}>
            <svg viewBox="0 0 12 12" style={{ width: 11, height: 11 }}>
              <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.5,11 6,9.5 2.5,11 3.5,7.5 1,5 4.5,4.5" fill="#80B9B6"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#80B9B6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Smart Campus Printing
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ margin: 0, fontFamily: 'Syne, Inter, sans-serif', fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 0.96, letterSpacing: '-0.03em' }}>
            Skip the Line.
          </h1>
          <h1 style={{
            margin: '6px 0 0', fontFamily: 'Syne, Inter, sans-serif', fontSize: 52, fontWeight: 800, lineHeight: 0.96, letterSpacing: '-0.03em',
            background: 'linear-gradient(90deg, #80B9B6, #d4eeed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Print in Seconds.
          </h1>

          {/* Sub */}
          <p style={{ margin: '16px 0 0', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.58)', lineHeight: 1.55 }}>
            Upload your file · Pick a time slot · Pay & collect — all from your phone, no queue.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
            {['📤  Upload', '📅  Schedule', '💸  Pay', '🖨️  Print'].map((c) => (
              <div key={c} style={{
                padding: '6px 14px', borderRadius: 40,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            §2  APP VISUAL  ·  290 px
        ══════════════════════════════════════════════════════ */}
        <div style={{
          height: 290,
          background: 'linear-gradient(to bottom, #EFF8F7, #DFF0EE)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Dot-grid decoration */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <div key={`${row}-${col}`} style={{
                position: 'absolute', width: 4, height: 4, borderRadius: '50%',
                background: 'rgba(0,115,109,0.1)',
                top: row * 70 + 20, left: col * 66 + 20,
              }} />
            ))
          )}

          {/* Phone */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <PhoneSVG />
          </div>

          {/* Left badge: Schedule */}
          <div style={{
            position: 'absolute', left: 28, top: 72, zIndex: 3,
            background: 'white', borderRadius: 12, padding: '10px 14px',
            boxShadow: '0 6px 20px rgba(0,46,44,0.14)', border: '1px solid #E6F1F0',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#002E2C' }}>📅 Schedule for Later</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#80B9B6', marginTop: 2 }}>Reserve your slot</div>
          </div>

          {/* Right badge: Map */}
          <div style={{
            position: 'absolute', right: 28, bottom: 72, zIndex: 3,
            background: '#002E2C', borderRadius: 12, padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,46,44,0.45)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>🗺️ Live Map View</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#80B9B6', marginTop: 2 }}>Find shops near you</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            §3  BENEFITS  ·  210 px
        ══════════════════════════════════════════════════════ */}
        <div style={{ height: 210, background: 'white', padding: '18px 44px', overflow: 'hidden' }}>

          {/* Section eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(to bottom, #00736D, #80B9B6)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#80B9B6', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Why PrintFlow</span>
          </div>

          {[
            {
              icon: (
                <svg viewBox="0 0 22 22" style={{ width: 18, height: 18 }}>
                  <path d="M11 4v10M5 9l6-6 6 6" stroke="#80B9B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M3 18h16" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              title: 'Upload Anywhere, Anytime',
              sub: 'Send any PDF or DOCX right from your phone',
            },
            {
              icon: (
                <svg viewBox="0 0 22 22" style={{ width: 18, height: 18 }}>
                  <circle cx="11" cy="11" r="9" fill="none" stroke="#80B9B6" strokeWidth="2"/>
                  <path d="M11 6v5l3.5 3.5" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              ),
              title: 'Zero Waiting Time',
              sub: 'Reserve a slot — your print is ready on arrival',
            },
            {
              icon: (
                <svg viewBox="0 0 22 22" style={{ width: 18, height: 18 }}>
                  <circle cx="11" cy="11" r="9" fill="none" stroke="#80B9B6" strokeWidth="2"/>
                  <path d="M7 11l3 3 5-5" stroke="#80B9B6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              ),
              title: 'Real-Time Order Tracking',
              sub: 'Follow your print job live from queue to done',
            },
          ].map(({ icon, title, sub }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: i < 2 ? 11 : 0,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #002E2C, #00736D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,46,44,0.22)',
              }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#002E2C', lineHeight: 1.2 }}>{title}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#80B9B6', marginTop: 2 }}>{sub}</div>
              </div>
              <svg viewBox="0 0 14 14" style={{ width: 15, height: 15, flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6.5" fill="#E6F1F0"/>
                <path d="M4.5 7l2 2L9.5 5" stroke="#00736D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            §4  PAYMENT OPTIONS  ·  155 px
        ══════════════════════════════════════════════════════ */}
        <div style={{
          height: 155, background: '#F2F9F8',
          padding: '20px 44px',
          borderTop: '1px solid #E6F1F0',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#80B9B6', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
            Flexible Payment Options
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, height: 96 }}>

            {/* Pay at Counter */}
            <div style={{
              background: 'linear-gradient(145deg, #002E2C, #003d3b)',
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', width: 100, height: 100, top: -40, right: -30, borderRadius: '50%', background: 'rgba(128,185,182,0.06)' }} />
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(128,185,182,0.12)', border: '1px solid rgba(128,185,182,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 22 18" style={{ width: 22, height: 18 }}>
                  <rect x="1" y="3" width="20" height="12" rx="2" fill="none" stroke="#80B9B6" strokeWidth="1.6"/>
                  <path d="M1 8h20" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/>
                  <rect x="4" y="11" width="5" height="2.5" rx="1" fill="#80B9B6"/>
                  <rect x="13" y="11" width="4" height="2.5" rx="1" fill="rgba(255,255,255,0.25)"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>Pay at Counter</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Cash on collection</div>
              </div>
            </div>

            {/* Pay via GCash */}
            <div style={{
              background: 'white', borderRadius: 16,
              border: '1.5px solid #80B9B6',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {/* GCash QR placeholder */}
              <div style={{
                width: 70, height: 70, borderRadius: 10, flexShrink: 0,
                overflow: 'hidden', position: 'relative',
                border: '1.5px solid #E6F1F0',
              }}>
                <img
                  src="https://images.unsplash.com/photo-1662383729882-e03ce8e00887?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300"
                  alt="GCash QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  textAlign: 'center', padding: '3px 0',
                  background: 'rgba(0,115,109,0.85)',
                }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: 'white' }}>GCash QR</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#002E2C', lineHeight: 1.2 }}>Pay via GCash</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#80B9B6', marginTop: 3, lineHeight: 1.4 }}>
                  Scan shop QR code<br />to transfer payment
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            §5  FOOTER CTA  ·  125 px
        ══════════════════════════════════════════════════════ */}
        <div style={{
          height: 125, background: '#002E2C',
          padding: '20px 44px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: 200, height: 200, bottom: -80, right: -60, borderRadius: '50%', border: '1px solid rgba(128,185,182,0.1)' }} />
          <div style={{ position: 'absolute', width: 120, height: 120, bottom: -40, right: -20, borderRadius: '50%', background: 'rgba(128,185,182,0.04)' }} />

          {/* QR + CTA text row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
            {/* QR tile */}
            <div style={{
              background: '#00736D', borderRadius: 12, padding: 10, flexShrink: 0,
              border: '1.5px solid rgba(128,185,182,0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            }}>
              <QRCode size={68} />
            </div>

            {/* CTA text */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#80B9B6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                Scan to Get Started
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'white', fontFamily: 'Syne, Inter, sans-serif', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                Start Printing Now —<br />Anywhere, Anytime.
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12,
            position: 'relative', zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 14 14" style={{ width: 13, height: 13 }}>
                <circle cx="7" cy="7" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                <circle cx="7" cy="5" r="2" fill="rgba(255,255,255,0.35)"/>
                <path d="M3.5 12c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" fill="rgba(255,255,255,0.35)"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Open to All Students</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px rgba(74,222,128,0.75)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#80B9B6' }}>PrintFlow © 2026</span>
            </div>
          </div>
        </div>

      </div>{/* end poster */}

      {/* Spec label */}
      <div className="pf-print-hide" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ height: 1, width: 48, background: 'rgba(0,46,44,0.25)' }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,46,44,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          540 × 1080 px  ·  Print: 76.2 × 152.4 mm
        </span>
        <div style={{ height: 1, width: 48, background: 'rgba(0,46,44,0.25)' }} />
      </div>

    </div>
  );
}