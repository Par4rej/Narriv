"use client";

import { useState, useRef } from "react";

/* ═══════════════════════════════════════════════
   NARRIV v3 — Narratives move markets.
   Narriv tracks them.

   Three views: Home → Results → Compare
   One scan. One complete report.
   ═══════════════════════════════════════════════ */

const CATS = [
  { id: "stocks", label: "Stocks", ex: "NVDA, TSLA, AAPL" },
  { id: "crypto", label: "Crypto", ex: "BTC, ETH, SOL" },
  { id: "predictions", label: "Predictions", ex: "Daytona 500, Fed Rate Cut" },
  { id: "sports_cards", label: "Cards", ex: "Wemby RC, Luka Prizm" },
  { id: "pokemon", label: "Pokémon", ex: "Base Set Zard" },
  { id: "collectibles", label: "Collectibles", ex: "Funko, LEGO" },
  { id: "art", label: "Art", ex: "Basquiat, KAWS" },
  { id: "real_estate", label: "Real Estate", ex: "Austin TX, Miami" },
];

const DIMS = [
  { key: "social", label: "Social" },
  { key: "search", label: "Search" },
  { key: "influence", label: "Influence" },
  { key: "news", label: "News" },
  { key: "flow", label: "Flow" },
  { key: "momentum", label: "Momentum" },
];

const PHASES = [
  "Initializing signals",
  "Scanning social layer",
  "Analyzing search velocity",
  "Mapping influence networks",
  "Clustering narratives",
  "Tracking capital flows",
  "Computing momentum",
  "Generating report",
];

const QUICK = [
  { asset: "NVDA", cat: "stocks", hook: "AI chip narrative at fever pitch" },
  { asset: "BTC", cat: "crypto", hook: "Post-halving momentum cycle" },
  { asset: "TSLA", cat: "stocks", hook: "Robotaxi narrative building" },
  { asset: "SOL", cat: "crypto", hook: "DeFi volume surge" },
  { asset: "Wemby RC", cat: "sports_cards", hook: "Generational talent hype" },
];

// Color system
const N = {
  accent: "#00e5c7",
  accentDim: "#00e5c720",
  hot: "#ff3d71",
  warm: "#ffaa00",
  cool: "#636e8a",
  blue: "#4a8fe7",
  purple: "#b07ce8",
  gold: "#e8e0c7",
  bg: "#07080c",
  surface: "#0d0f14",
  surface2: "#12151c",
  border: "#1a1e2a",
  border2: "#252a38",
  text: "#edf0f7",
  text2: "#8b92a8",
  text3: "#4a5168",
};

const hc = (v: number) =>
  v >= 85 ? N.hot : v >= 70 ? "#ff6b35" : v >= 55 ? N.warm : v >= 40 ? "#c8d640" : v >= 25 ? N.accent : v >= 12 ? N.blue : N.cool;

const sentC = (v: string) =>
  v === "EUPHORIC" || v === "BULLISH" || v === "SURGING"
    ? N.accent
    : v === "BEARISH" || v === "FADING"
      ? N.hot
      : N.warm;

// ═══ API (YOUR backend — no Anthropic) ═══
async function apiScan({ asset, category }: { asset: string; category: string }) {
  const r = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asset, category }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Scan failed");
  return j as { result: any; debug?: any };
}

async function apiCompare({ a1, a2, category }: { a1: string; a2: string; category: string }) {
  const r = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a1, a2, category }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Compare failed");
  return j as { result: any };
}

// ═══ CHARTS ═══
function HeatChart({ data, heat, arc }: { data: any[]; heat: number; arc: any[] }) {
  if (!data?.length) return null;
  const c = hc(heat);
  const pts = data.map((t, i) => ({ x: 24 + (i / (data.length - 1)) * 352, y: 108 - (t.heat / 100) * 82, ...t }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox="0 0 400 140" style={{ width: "100%", height: 150, display: "block" }}>
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity={0.18} />
          <stop offset="100%" stopColor={c} stopOpacity={0} />
        </linearGradient>
        <filter id="gw">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={line + ` L${pts[pts.length - 1].x},112 L${pts[0].x},112 Z`} fill="url(#hg)" />
      <path d={line} fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" filter="url(#gw)" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={c} style={{ filter: "url(#gw)" }} />
      ))}
      {pts.map((p, i) => (
        <text key={`l${i}`} x={p.x} y={125} fill={N.text3} fontSize={9} textAnchor="middle" fontFamily="'Syne Mono',monospace">
          {p.period}
        </text>
      ))}
      {arc?.slice(0, 3).map((ev, i) => {
        const x = 55 + i * 105;
        return (
          <g key={`e${i}`}>
            <line
              x1={x}
              y1={22}
              x2={x}
              y2={108}
              stroke={ev.heat_shift > 0 ? N.accent : N.hot}
              strokeWidth={0.7}
              strokeDasharray="3,3"
              opacity={0.4}
            />
            <circle cx={x} cy={22} r={3.5} fill={ev.heat_shift > 0 ? N.accent : N.hot} opacity={0.7} />
            <text x={x} y={136} fill={N.text3} fontSize={7} textAnchor="middle" fontFamily="'Syne Mono',monospace">
              {ev.date?.substring(0, 6) || ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CompareBar({ label, va, vb, ca, cb }: { label: string; va: number; vb: number; ca: string; cb: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 11, fontWeight: 600, color: ca }}>{va}</span>
        <span style={{ fontSize: 11, color: N.text3 }}>{label}</span>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 11, fontWeight: 600, color: cb }}>{vb}</span>
      </div>
      <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", gap: 2 }}>
        <div style={{ width: `${va}%`, background: ca, borderRadius: 2 }} />
        <div style={{ flex: 1 }} />
        <div style={{ width: `${vb}%`, background: cb, borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ═══ MAIN ═══
export default function Narriv() {
  const [view, setView] = useState<"home" | "scanning" | "results" | "compare">("home");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("stocks");
  const [result, setResult] = useState<any>(null);
  const [debug, setDebug] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [err, setErr] = useState("");
  const [phase, setPhase] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [watchScanning, setWatchScanning] = useState(false);
  const [showWatch, setShowWatch] = useState(false);
  const tm = useRef<any>(null);
  const catObj = CATS.find((c) => c.id === cat)!;

  const scan = async (asset?: string, category?: string) => {
    const a = (asset || query.trim());
    const c = category || cat;
    if (!a) return;

    const vsMatch = a.match(/(.+?)\s+vs\.?\s+(.+)/i);
    if (vsMatch) return runCompare(vsMatch[1].trim(), vsMatch[2].trim(), c);

    setView("scanning");
    setErr("");
    setPhase(0);
    setDebug(null);
    setShowDebug(false);
    if (asset) { setQuery(a); setCat(c); }

    tm.current = setInterval(() => setPhase((p) => Math.min(p + 1, 7)), 2000);

    try {
      const { result: d, debug: dbg } = await apiScan({ asset: a, category: c });
      clearInterval(tm.current);
      setResult(d);
      setDebug(dbg);
      setHistory((h) => {
        const filtered = h.filter((x) => x.asset !== d.asset);
        return [{ ...d, ts: Date.now() }, ...filtered].slice(0, 20);
      });
      setView("results");
    } catch (e: any) {
      clearInterval(tm.current);
      setErr(e.message);
      setView("home");
    }
  };

  const runCompare = async (a1: string, a2: string, c: string) => {
    setView("scanning");
    setPhase(0);
    setCompareResult(null);
    tm.current = setInterval(() => setPhase((p) => Math.min(p + 1, 7)), 1500);
    try {
      const { result: d } = await apiCompare({ a1, a2, category: c });
      clearInterval(tm.current);
      setCompareResult(d);
      setView("compare");
    } catch (e: any) {
      clearInterval(tm.current);
      setErr(e.message);
      setView("home");
    }
  };

  const addWatch = (asset: string, category: string) => {
    if (!watchlist.find((w) => w.asset === asset)) setWatchlist((w) => [...w, { asset, category, heat: null }]);
  };

  const scanWatch = async () => {
    setWatchScanning(true);
    const updated = [...watchlist];
    for (let i = 0; i < updated.length; i++) {
      try {
        const { result: d } = await apiScan({ asset: updated[i].asset, category: updated[i].category });
        updated[i] = { ...updated[i], heat: d.heat_index, label: d.heat_label, trend: d.trend_direction, summary: d.one_liner || d.narrative_summary, data: d };
      } catch (_) {
        updated[i] = { ...updated[i], heat: -1 };
      }
      setWatchlist([...updated]);
    }
    setWatchScanning(false);
  };

  // Styles
  const F: any = { fontFamily: "'Instrument Sans', 'Syne', sans-serif" };
  const FM: any = { fontFamily: "'Syne Mono', monospace" };
  const card: any = { background: N.surface, border: `1px solid ${N.border}`, borderRadius: 14, padding: "14px 16px", marginTop: 12 };
  const lbl: any = { ...FM, fontSize: 9, fontWeight: 600, color: N.text3, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 };
  const pill = (on: boolean) => ({
    padding: "5px 11px",
    borderRadius: 20,
    border: `1px solid ${on ? N.accent : N.border}`,
    background: on ? N.accentDim : "transparent",
    color: on ? N.accent : N.text2,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    ...F,
    transition: "all .2s",
    whiteSpace: "nowrap",
  });

  const css = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Syne+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased}
html{font-size:16px;overflow-x:hidden}::selection{background:${N.accent}30}
@keyframes nf{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes np{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ns{to{transform:rotate(360deg)}}
@keyframes nb{0%{width:2%}40%{width:50%}80%{width:82%}100%{width:96%}}
@keyframes ng{0%,100%{box-shadow:0 0 0 0 ${N.accent}40}50%{box-shadow:0 0 0 18px ${N.accent}00}}
@keyframes nw{from{width:0}}
input::placeholder{color:${N.text3}}input{font-size:16px!important}
button{-webkit-appearance:none;font-family:inherit}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${N.border};border-radius:4px}`;

  const page: any = {
    minHeight: "100vh",
    background: N.bg,
    backgroundImage: `radial-gradient(ellipse at 30% -10%, ${N.accent}06 0%, transparent 60%)`,
    ...F,
    color: N.text,
    padding: "12px 10px",
    display: "flex",
    justifyContent: "center",
    overflowX: "hidden",
    width: "100%",
  };

  // ═══ HOME ═══
  if (view === "home")
    return (
      <div style={page}>
        <style>{css}</style>
        <div style={{ width: "100%", maxWidth: 520 }}>
          {/* Brand */}
          <div style={{ padding: "8px 0 4px", animation: "nf .4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: N.accent,
                    boxShadow: `0 0 12px ${N.accent}, 0 0 24px ${N.accent}40`,
                    animation: "np 2.5s ease infinite",
                  }}
                />
                <span style={{ fontFamily: "'Syne'", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>NARRIV</span>
              </div>
              {watchlist.length > 0 && (
                <button
                  onClick={() => setShowWatch(!showWatch)}
                  style={{
                    ...FM,
                    background: showWatch ? N.purple : N.surface,
                    border: `1px solid ${showWatch ? N.purple : N.border}`,
                    borderRadius: 20,
                    color: showWatch ? N.bg : N.text2,
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 600,
                    transition: "all .2s",
                  }}
                >
                  {watchlist.length} watching
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: N.text3, letterSpacing: 1, marginTop: 5, lineHeight: 1.4 }}>
              Identify the narratives driving stocks, crypto, and cultural assets — before the market fully prices them in.
            </p>
          </div>

          {/* Watchlist panel */}
          {showWatch && watchlist.length > 0 && (
            <div style={{ ...card, borderColor: `${N.purple}25`, marginTop: 10, animation: "nf .2s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ ...lbl, color: N.purple, marginBottom: 0 }}>Watchlist</div>
                <button
                  onClick={scanWatch}
                  disabled={watchScanning}
                  style={{
                    ...FM,
                    background: `linear-gradient(135deg, ${N.purple}, ${N.purple}cc)`,
                    border: "none",
                    borderRadius: 6,
                    color: N.bg,
                    padding: "4px 10px",
                    cursor: watchScanning ? "default" : "pointer",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  {watchScanning ? "Scanning..." : "Scan All"}
                </button>
              </div>
              {watchlist.map((w, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    borderTop: i > 0 ? `1px solid ${N.border}` : "none",
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: w.heat != null && w.heat >= 0 ? hc(w.heat) : N.border, flexShrink: 0 }} />
                  <button
                    onClick={() => {
                      if (w.data) {
                        setResult(w.data);
                        setView("results");
                      } else scan(w.asset, w.category);
                    }}
                    style={{ ...F, flex: 1, background: "none", border: "none", color: N.text, cursor: "pointer", textAlign: "left", padding: 0, minWidth: 0 }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.asset}</div>
                    {w.summary && <div style={{ fontSize: 10, color: N.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.summary}</div>}
                  </button>
                  {w.heat != null && w.heat >= 0 && (
                    <span style={{ ...FM, fontSize: 13, fontWeight: 700, color: hc(w.heat), flexShrink: 0 }}>{w.heat}</span>
                  )}
                  <button onClick={() => setWatchlist((wl) => wl.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: N.text3, cursor: "pointer", fontSize: 11, padding: "2px 4px", flexShrink: 0 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Category pills */}
          <div style={{ marginTop: 16, animation: "nf .45s ease" }}>
            <div style={lbl}>Asset class</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
              {CATS.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} style={pill(cat === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ animation: "nf .5s ease" }}>
            <div style={lbl}>
              Scan · <span style={{ color: N.text2, fontWeight: 400 }}>type "A vs B" to compare</span>
            </div>
            <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && scan()}
                placeholder={`e.g. ${catObj.ex}`}
                style={{
                  flex: 1,
                  background: N.surface,
                  border: `1px solid ${N.border}`,
                  borderRadius: 10,
                  padding: "12px 12px",
                  color: N.text,
                  ...FM,
                  fontSize: 14,
                  outline: "none",
                  transition: "border .2s",
                }}
                onFocus={(e: any) => (e.target.style.borderColor = N.accent)}
                onBlur={(e: any) => (e.target.style.borderColor = N.border)}
              />
              <button
                onClick={() => scan()}
                disabled={!query.trim()}
                style={{
                  padding: "12px 20px",
                  background: query.trim() ? `linear-gradient(135deg, ${N.accent}, #00b8a0)` : N.surface,
                  border: `1px solid ${query.trim() ? "transparent" : N.border}`,
                  borderRadius: 10,
                  color: query.trim() ? N.bg : N.text3,
                  ...F,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: query.trim() ? "pointer" : "default",
                  boxShadow: query.trim() ? `0 4px 16px ${N.accent}25` : "none",
                  transition: "all .2s",
                }}
              >
                Scan
              </button>
            </div>
          </div>

          {err && (
            <div style={{ background: `${N.hot}10`, border: `1px solid ${N.hot}25`, borderRadius: 10, padding: "10px 12px", color: N.hot, ...FM, fontSize: 11, marginBottom: 12 }}>
              {err}
            </div>
          )}

          {/* Quick prompts */}
          {history.length === 0 && (
            <div style={{ animation: "nf .55s ease" }}>
              <div style={lbl}>Trending narratives</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {QUICK.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => scan(q.asset, q.cat)}
                    style={{ ...F, flexShrink: 0, padding: "12px 14px", background: N.surface, border: `1px solid ${N.border}`, borderRadius: 12, cursor: "pointer", color: "inherit", textAlign: "left", width: 150, transition: "border .15s" }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{q.asset}</div>
                    <div style={{ fontSize: 10, color: N.text3, lineHeight: 1.35 }}>{q.hook}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div style={{ animation: "nf .55s ease" }}>
              <div style={lbl}>Recent scans</div>
              {history.slice(0, 8).map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setResult(h);
                    setView("results");
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: N.surface, border: `1px solid ${N.border}`, borderRadius: 10, cursor: "pointer", ...F, width: "100%", marginBottom: 5, color: "inherit", textAlign: "left" }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: hc(h.heat_index), boxShadow: `0 0 6px ${hc(h.heat_index)}50` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.asset}</div>
                    <div style={{ fontSize: 10, color: N.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.one_liner || h.narrative_summary?.substring(0, 60)}</div>
                  </div>
                  <span style={{ ...FM, fontSize: 12, fontWeight: 700, color: hc(h.heat_index), flexShrink: 0 }}>{h.heat_index}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );

  // ═══ SCANNING ═══
  if (view === "scanning")
    return (
      <div style={{ ...page, alignItems: "center" }}>
        <style>{css}</style>
        <div style={{ textAlign: "center", padding: "40px 0", animation: "nf .4s ease" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              margin: "0 auto",
              border: `1.5px solid ${N.border}`,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `radial-gradient(circle, ${N.surface}, ${N.bg})`,
              animation: "ng 2.5s ease infinite",
            }}
          >
            <div style={{ position: "absolute", width: "50%", height: 1.5, left: "50%", top: "50%", transformOrigin: "0% 50%", background: `linear-gradient(90deg, ${N.accent}, transparent)`, animation: "ns 2s linear infinite" }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: N.accent }} />
          </div>
          <h2 style={{ ...FM, fontSize: 12, fontWeight: 500, color: N.text, marginTop: 24, letterSpacing: 2 }}>{query.toUpperCase()}</h2>
          <div style={{ ...FM, fontSize: 10, textAlign: "left", maxWidth: 240, margin: "18px auto 0" }}>
            {PHASES.map((p, i) => (
              <div key={i} style={{ color: i < phase ? N.accent : i === phase ? N.text : N.text3, opacity: i <= phase ? 1 : 0.2, marginBottom: 5, transition: "all .3s" }}>
                {i < phase ? "✓" : i === phase ? "›" : "·"} {p}
              </div>
            ))}
          </div>
          <div style={{ width: 160, height: 1.5, background: N.border, borderRadius: 1, margin: "14px auto 0", overflow: "hidden" }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, ${N.accent}, ${N.warm})`, animation: "nb 20s ease-in-out forwards" }} />
          </div>
        </div>
      </div>
    );

  // ═══ COMPARE ═══
  if (view === "compare" && compareResult) {
    const cr = compareResult,
      a = cr.asset_a,
      b = cr.asset_b;
    const ca = hc(a.heat_index),
      cb = hc(b.heat_index);
    return (
      <div style={page}>
        <style>{css}</style>
        <div style={{ width: "100%", maxWidth: 520 }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: `1px solid ${N.border}`, borderRadius: 8, color: N.text2, padding: "5px 12px", cursor: "pointer", ...FM, fontSize: 10, marginBottom: 10 }}>
            ← back
          </button>
          <div style={{ ...card, animation: "nf .35s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne'", fontSize: 18, fontWeight: 800, color: ca }}>{a.heat_index}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{a.name}</div>
                <span style={{ ...FM, fontSize: 9, padding: "2px 8px", borderRadius: 10, background: `${sentC(a.sentiment)}12`, color: sentC(a.sentiment), display: "inline-block", marginTop: 4 }}>
                  {a.sentiment}
                </span>
              </div>
              <div style={{ fontFamily: "'Syne'", fontSize: 18, fontWeight: 800, color: N.text3, padding: "0 10px" }}>VS</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne'", fontSize: 18, fontWeight: 800, color: cb }}>{b.heat_index}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{b.name}</div>
                <span style={{ ...FM, fontSize: 9, padding: "2px 8px", borderRadius: 10, background: `${sentC(b.sentiment)}12`, color: sentC(b.sentiment), display: "inline-block", marginTop: 4 }}>
                  {b.sentiment}
                </span>
              </div>
            </div>
          </div>
          <div style={{ ...card, animation: "nf .4s ease" }}>
            <div style={lbl}>Signal Comparison</div>
            {DIMS.map((d) => (
              <CompareBar key={d.key} label={d.label} va={a.signals?.[d.key] || 0} vb={b.signals?.[d.key] || 0} ca={ca} cb={cb} />
            ))}
          </div>
          <div style={{ ...card, animation: "nf .5s ease" }}>
            <div style={lbl}>Narrative Flow</div>
            <p style={{ fontSize: 13, color: N.text2, lineHeight: 1.5, borderLeft: `2px solid ${N.accent}30`, paddingLeft: 12 }}>{cr.narrative_flow}</p>
          </div>
          <div style={{ ...card, borderColor: `${N.accent}25`, animation: "nf .55s ease" }}>
            <div style={{ ...lbl, color: N.accent }}>Alpha Signal</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: N.text, lineHeight: 1.5 }}>{cr.alpha_signal}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ ...card, flex: "1 1 200px" }}>
              <div style={{ ...lbl, color: ca }}>{a.name}</div>
              <p style={{ fontSize: 12, color: N.text2, lineHeight: 1.4 }}>{a.key_narrative}</p>
            </div>
            <div style={{ ...card, flex: "1 1 200px" }}>
              <div style={{ ...lbl, color: cb }}>{b.name}</div>
              <p style={{ fontSize: 12, color: N.text2, lineHeight: 1.4 }}>{b.key_narrative}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══ RESULTS ═══
  if (view === "results" && result) {
    const r = result;
    const c = hc(r.heat_index);
    const tw = r.twitter_intel;
    const be = r.betting_edge;
    const pl = r.price_lag;
    const arc = r.narrative_arc;

    const conf = r.confidence?.score_0_100 || 0;
    const confC = conf >= 80 ? N.accent : conf >= 55 ? N.warm : N.hot;
    const trendC = r.regime?.trend === "up" ? N.accent : r.regime?.trend === "down" ? N.hot : N.warm;
    const isWatched = watchlist.find((w) => w.asset === r.asset);

    return (
      <div style={page}>
        <style>{css}</style>
        <div style={{ width: "100%", maxWidth: 520 }}>
          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: `1px solid ${N.border}`, borderRadius: 8, color: N.text2, padding: "5px 12px", cursor: "pointer", ...FM, fontSize: 10 }}>
              ← back
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => !isWatched && addWatch(r.asset, r.category || cat)}
                style={{ background: "none", border: `1px solid ${isWatched ? N.purple : N.border}`, borderRadius: 8, color: isWatched ? N.purple : N.text2, padding: "5px 10px", cursor: "pointer", ...FM, fontSize: 9 }}
              >
                {isWatched ? "◉ Watching" : "+ Watch"}
              </button>
              <button onClick={() => scan(r.asset, r.category || cat)} style={{ background: "none", border: `1px solid ${N.border}`, borderRadius: 8, color: N.text2, padding: "5px 10px", cursor: "pointer", ...FM, fontSize: 9 }}>
                ↻
              </button>
            </div>
          </div>

          {/* HERO */}
          <div style={{ ...card, borderColor: `${c}30`, animation: "nf .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...FM, fontSize: 9, color: N.text3, letterSpacing: 2 }}>{(r.category || cat).toUpperCase()}</div>
                <h2 style={{ fontFamily: "'Syne'", fontSize: 22, fontWeight: 800, margin: "3px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.asset}</h2>
                <span style={{ display: "inline-block", padding: "3px 11px", borderRadius: 20, background: `${c}12`, color: c, ...FM, fontSize: 10 }}>{r.heat_label}</span>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Syne'", fontSize: 40, fontWeight: 800, color: c, lineHeight: 1, textShadow: `0 0 24px ${c}40` }}>{r.heat_index}</div>
                <div style={{ ...FM, fontSize: 8, color: N.text3, letterSpacing: 1.5, marginTop: 2 }}>NARRATIVE SCORE</div>
              </div>
            </div>

            <div style={{ width: "100%", height: 3, background: N.border, borderRadius: 2, marginTop: 12 }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${r.heat_index}%`, background: `linear-gradient(90deg, ${N.blue}, ${N.accent}, ${N.warm}, #ff6b35, ${N.hot})`, animation: "nw .8s ease" }} />
            </div>

            {/* One-liner */}
            {r.one_liner && <p style={{ fontSize: 14, fontWeight: 600, color: N.text, lineHeight: 1.5, marginTop: 14, borderLeft: `2px solid ${c}40`, paddingLeft: 12 }}>{r.one_liner}</p>}
            {!r.one_liner && r.narrative_summary && <p style={{ fontSize: 13, color: N.text2, lineHeight: 1.5, marginTop: 14, borderLeft: `2px solid ${c}30`, paddingLeft: 12 }}>{r.narrative_summary}</p>}

            {/* Regime + Sentiment tags */}
            <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ ...FM, padding: "4px 10px", borderRadius: 20, background: `${sentC(r.sentiment)}12`, color: sentC(r.sentiment), fontSize: 10 }}>{r.sentiment}</span>
              <span style={{ ...FM, padding: "4px 10px", borderRadius: 20, background: `${sentC(r.trend_direction)}12`, color: sentC(r.trend_direction), fontSize: 10 }}>{r.trend_direction}</span>
              {r.regime && (
                <>
                  <span style={{ ...FM, padding: "4px 10px", borderRadius: 20, background: `${trendC}12`, color: trendC, fontSize: 10 }}>↕ {r.regime.trend}</span>
                  <span style={{ ...FM, padding: "4px 10px", borderRadius: 20, background: N.surface2, border: `1px solid ${N.border}`, color: N.text2, fontSize: 10 }}>vol: {r.regime.volatility}</span>
                </>
              )}
            </div>

            {/* Confidence bar */}
            {conf > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ ...FM, fontSize: 9, color: N.text3 }}>CONFIDENCE</span>
                  <span style={{ ...FM, fontSize: 12, fontWeight: 700, color: confC }}>{conf}/100</span>
                </div>
                <div style={{ width: "100%", height: 3, background: N.border, borderRadius: 2 }}>
                  <div style={{ height: "100%", borderRadius: 2, width: `${conf}%`, background: confC, animation: "nw .8s ease" }} />
                </div>
                {r.confidence?.reasoning && <div style={{ fontSize: 10, color: N.text3, marginTop: 4, lineHeight: 1.35 }}>{r.confidence.reasoning}</div>}
              </div>
            )}
          </div>

          {/* Primary Driver */}
          {r.primary_driver && (
            <div style={{ ...card, borderColor: `${N.gold}20`, animation: "nf .35s ease" }}>
              <div style={{ ...lbl, color: N.gold }}>Primary Driver</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: N.text, lineHeight: 1.45 }}>{r.primary_driver}</p>
            </div>
          )}

          {/* Supporting Signals */}
          {r.supporting_signals?.length > 0 && (
            <div style={{ ...card, animation: "nf .38s ease" }}>
              <div style={{ ...lbl, color: N.accent }}>Supporting Signals</div>
              {r.supporting_signals.map((s: any, i: number) => (
                <div key={i} style={{ marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid ${N.accent}25` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: N.text }}>{s.signal}</div>
                  <div style={{ fontSize: 11, color: N.text2, lineHeight: 1.4, marginTop: 2 }}>{s.evidence}</div>
                </div>
              ))}
            </div>
          )}

          {/* Contradictions */}
          {r.contradictions?.length > 0 && (
            <div style={{ ...card, borderColor: `${N.hot}15`, animation: "nf .4s ease" }}>
              <div style={{ ...lbl, color: N.hot }}>Contradictions</div>
              {r.contradictions.map((ct: any, i: number) => (
                <div key={i} style={{ marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid ${N.hot}25` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: N.text }}>{ct.signal}</div>
                  <div style={{ fontSize: 11, color: `${N.hot}bb`, lineHeight: 1.4, marginTop: 2 }}>{ct.evidence}</div>
                </div>
              ))}
            </div>
          )}

          {/* Price Lag */}
          {pl && (
            <div style={{ ...card, borderColor: `${N.purple}20`, animation: "nf .42s ease" }}>
              <div style={{ ...lbl, color: N.purple }}>Narrative → Price Lag</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ ...FM, padding: "4px 10px", borderRadius: 20, background: N.surface2, border: `1px solid ${N.border}`, fontSize: 10, color: N.text }}>
                  Avg: <span style={{ color: N.purple, fontWeight: 700 }}>{pl.avg_lag_hours}h</span>
                </span>
                <span
                  style={{
                    ...FM,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: `${pl.confidence === "HIGH" ? N.accent : pl.confidence === "MODERATE" ? N.warm : N.cool}12`,
                    fontSize: 10,
                    color: pl.confidence === "HIGH" ? N.accent : pl.confidence === "MODERATE" ? N.warm : N.cool,
                  }}
                >
                  {pl.confidence}
                </span>
              </div>
              <p style={{ fontSize: 12, color: N.text2, lineHeight: 1.45, marginBottom: 8 }}>{pl.pattern}</p>
              <div
                style={{
                  background: `${pl.current_signal?.includes("UP") ? N.accent : pl.current_signal?.includes("DOWN") ? N.hot : N.warm}08`,
                  border: `1px solid ${pl.current_signal?.includes("UP") ? N.accent : pl.current_signal?.includes("DOWN") ? N.hot : N.warm}20`,
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <div style={{ ...FM, fontSize: 8, color: N.text3, letterSpacing: 1.5, marginBottom: 2 }}>CURRENT SIGNAL</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: pl.current_signal?.includes("UP") ? N.accent : pl.current_signal?.includes("DOWN") ? N.hot : N.warm }}>{pl.current_signal}</div>
              </div>
            </div>
          )}

          {/* Narrative Arc */}
          <div style={{ ...card, animation: "nf .45s ease" }}>
            <div style={lbl}>Narrative Arc</div>
            <HeatChart data={r.timeline} heat={r.heat_index} arc={arc} />
            {arc?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {arc.map((ev: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 3, borderRadius: 2, background: ev.heat_shift > 0 ? N.accent : N.hot, flexShrink: 0 }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ ...FM, fontSize: 10, color: N.text3 }}>{ev.date}</span>
                        <span style={{ ...FM, fontSize: 10, fontWeight: 700, color: ev.heat_shift > 0 ? N.accent : N.hot }}>{ev.heat_shift > 0 ? "+" : ""}{ev.heat_shift}</span>
                        <span style={{ ...FM, fontSize: 8, padding: "1px 5px", borderRadius: 10, background: N.surface2, color: N.text3 }}>{ev.source}</span>
                      </div>
                      <div style={{ fontSize: 11, color: N.text2, lineHeight: 1.35, marginTop: 1 }}>{ev.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signal Breakdown */}
          <div style={{ ...card, animation: "nf .48s ease" }}>
            <div style={lbl}>Signal Breakdown</div>
            {DIMS.map((d) => {
              const v = r.signals?.[d.key] || 0;
              const cc = hc(v);
              return (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: N.text2, minWidth: 62, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 3, background: N.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${v}%`, background: cc }} />
                  </div>
                  <span style={{ ...FM, fontSize: 11, fontWeight: 600, color: cc, minWidth: 22, textAlign: "right" }}>{v}</span>
                </div>
              );
            })}
          </div>

          {/* Social Intel */}
          {tw && (
            <div style={{ ...card, borderColor: `${N.blue}18`, animation: "nf .5s ease" }}>
              <div style={{ ...lbl, color: N.blue }}>Social Intel</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                {[["Vol", tw.volume_level], ["24h", tw.estimated_mentions_24h], ["Mood", tw.platform_sentiment]].map(([l, v]: any, i: number) => (
                  <span key={i} style={{ ...FM, padding: "4px 10px", borderRadius: 20, background: N.surface2, border: `1px solid ${N.border}`, fontSize: 10, color: N.text2 }}>
                    {l}: <span style={{ color: N.text, fontWeight: 600 }}>{v || "—"}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Betting Edge */}
          {be && (
            <div style={{ ...card, borderColor: `${hc(be.edge_rating || 50)}20`, animation: "nf .52s ease" }}>
              <div style={{ ...lbl, color: hc(be.edge_rating || 50) }}>Narrative Edge</div>
              <p style={{ fontSize: 12, color: N.text2, lineHeight: 1.45 }}>{be.reasoning}</p>
            </div>
          )}

          {/* RAW INTEL */}
          {debug && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowDebug(!showDebug)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 12px", background: N.surface, border: `1px solid ${N.border}`, borderRadius: showDebug ? "10px 10px 0 0" : 10, cursor: "pointer", ...F, color: "inherit" }}
              >
                <span style={{ ...FM, fontSize: 9, color: N.text3, letterSpacing: 2 }}>
                  RAW INTEL · <span style={{ opacity: 0.6 }}>{debug.api_turns || 1}t · {(debug.searches?.length || 0)}s · {(debug.sources?.length || 0)}src</span>
                </span>
                <span style={{ color: N.text3, fontSize: 10 }}>{showDebug ? "▾" : "›"}</span>
              </button>
              {showDebug && (
                <div style={{ background: N.surface, border: `1px solid ${N.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 12px", maxHeight: 400, overflow: "auto" }}>
                  {debug.snapshot && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ ...FM, fontSize: 8, color: N.text3, letterSpacing: 1, marginBottom: 4 }}>DATA SNAPSHOT</div>
                      <pre style={{ ...FM, fontSize: 8, color: N.text3, background: N.surface2, borderRadius: 5, padding: 8, overflow: "auto", maxHeight: 160, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                        {JSON.stringify(debug.snapshot, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div>
                    <div style={{ ...FM, fontSize: 8, color: N.text3, letterSpacing: 1, marginBottom: 4 }}>RAW JSON</div>
                    <pre style={{ ...FM, fontSize: 8, color: N.text3, background: N.surface2, borderRadius: 5, padding: 8, overflow: "auto", maxHeight: 160, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign: "center", padding: "14px 0 6px", ...FM, fontSize: 8, color: N.text3, letterSpacing: 1.5, opacity: 0.3 }}>
            NARRIV — NOT FINANCIAL ADVICE{r.category === "predictions" ? " — ENTERTAINMENT ONLY" : ""}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
