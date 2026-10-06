import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "./Tokens";
import { CompanyLogo } from "./CompanyLogo";
import { IPOData } from "../types/ipo";
import { resolveIPOData } from "../IPOVideo";

export interface ThumbnailProps {
  data?: IPOData;
  [key: string]: unknown;
}

function deriveVerdict(data: IPOData): {
  label: string; subLabel: string; color: string; glowColor: string; bgStart: string; bgEnd: string;
} {
  const v = (data.verdict?.shortTermVerdict || "").toLowerCase();
  const lv = (data.verdict?.longTermVerdict || "").toLowerCase();
  const combined = `${v} ${lv}`;
  if (combined.includes("avoid"))
    return { label: "AVOID", subLabel: "RED FLAG", color: "#FF4444", glowColor: "rgba(255,68,68,0.6)", bgStart: "#7F1D1D", bgEnd: "#B91C1C" };
  if (combined.includes("apply") || combined.includes("subscribe"))
    return { label: "APPLY", subLabel: "STRONG BUY", color: "#10B981", glowColor: "rgba(16,185,129,0.6)", bgStart: "#064E3B", bgEnd: "#059669" };
  return { label: "NEUTRAL", subLabel: "WATCH LIST", color: "#F59E0B", glowColor: "rgba(245,158,11,0.6)", bgStart: "#78350F", bgEnd: "#D97706" };
}

export const Thumbnail: React.FC<ThumbnailProps> = (props) => {
  const data = resolveIPOData(props);
  const companyName = data.companyName || "IPO Analysis";
  const industry = data.industry || "Mainboard IPO";
  const exchange = data.exchange || "NSE • BSE";
  const issueSize = data.issue?.totalFormatted || "Rs.1,000+ Cr";
  const priceBand = data.issue?.priceBand || "";
  const revenueCagr = data.financials?.revenue?.cagr || "+35% CAGR";
  const targetPeer = data.peers?.table?.find((p) => p.isTargetCompany);
  const peRatio = targetPeer?.peRatio || data.peers?.industryAveragePe || "24.5x";
  const gmpFormatted = data.verdict?.gmp?.currentGmpFormatted || "Rs.0";
  const gmpTrend = data.verdict?.gmp?.trend || "Neutral";
  const overallRating = data.verdict?.scorecard?.overallRating || "7.5 / 10";
  const isProfitable = data.financials?.pat?.isProfitableNow ?? true;
  const verdict = deriveVerdict(data);
  const gmpTrendColor = gmpTrend === "Bullish" ? "#10B981" : gmpTrend === "Bearish" ? "#EF4444" : "#F59E0B";
  const gmpEmoji = gmpTrend === "Bullish" ? "🟢" : gmpTrend === "Bearish" ? "🔴" : "🟡";
  const displayName = companyName.length > 18 ? companyName.substring(0, 17) + "…" : companyName;

  const pill = (icon: string, label: string, value: string, color: string, rgb: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, background: `rgba(${rgb},0.1)`, border: `1.5px solid rgba(${rgb},0.5)`, borderRadius: 50, padding: "9px 16px", boxShadow: `0 0 12px rgba(${rgb},0.18)` }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 9, color: "rgba(148,163,184,0.85)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ width: 1280, height: 720, overflow: "hidden", fontFamily: FONT.heading, color: C.text, position: "relative", backgroundColor: "#06091A" }}>
      {/* Background SVG */}
      <svg width="1280" height="720" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <linearGradient id="streak-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="40%" stopColor="rgba(59,130,246,0.55)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
          <linearGradient id="streak-gold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(251,191,36,0)" />
            <stop offset="40%" stopColor="rgba(251,191,36,0.45)" />
            <stop offset="100%" stopColor="rgba(251,191,36,0)" />
          </linearGradient>
          <radialGradient id="glow-left" cx="28%" cy="58%" r="50%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.2)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </radialGradient>
          <radialGradient id="glow-right" cx="80%" cy="45%" r="50%">
            <stop offset="0%" stopColor={`${verdict.color}38`} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <pattern id="micro-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.055)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="bot-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="22%" stopColor="rgba(59,130,246,0.9)" />
            <stop offset="52%" stopColor="rgba(34,211,238,1)" />
            <stop offset="82%" stopColor={verdict.color} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#micro-grid)" />
        <ellipse cx="300" cy="400" rx="420" ry="340" fill="url(#glow-left)" />
        <ellipse cx="1010" cy="340" rx="360" ry="330" fill="url(#glow-right)" />
        <rect x="-60" y="100" width="5" height="900" fill="url(#streak-blue)" transform="rotate(-27 600 360)" opacity="0.95" />
        <rect x="-60" y="100" width="1.5" height="900" fill="url(#streak-blue)" transform="rotate(-27 600 360) translate(22,0)" opacity="0.38" />
        <rect x="730" y="-80" width="4" height="1000" fill="url(#streak-gold)" transform="rotate(19 900 360)" opacity="0.85" />
        <rect x="730" y="-80" width="1.5" height="1000" fill="url(#streak-gold)" transform="rotate(19 900 360) translate(-24,0)" opacity="0.32" />
        <line x1="772" y1="0" x2="772" y2="720" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
        <rect width="1280" height="4" y="716" fill="url(#bot-line)" />
      </svg>

      {/* LEFT SECTION */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 772, height: 720, padding: "42px 48px 38px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Company row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <CompanyLogo logoUrl={data.logoUrl} logoUrls={data.logoUrls} domain={data.domain} companyName={companyName} initials={data.logoInitials} bgColor={data.logoBgColor || "#1E3A8A"} size={66}
            style={{ borderRadius: 13, border: "2.5px solid rgba(59,130,246,0.55)", boxShadow: "0 0 22px rgba(59,130,246,0.4), 0 6px 20px rgba(0,0,0,0.6)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 35, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.8px", lineHeight: 1.1, textShadow: "0 2px 14px rgba(0,0,0,0.8)", textTransform: "uppercase" as const, maxWidth: 560, overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis" }}>{displayName}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#22D3EE", letterSpacing: "2px", textTransform: "uppercase" as const, marginTop: 3 }}>{industry.toUpperCase()} • {exchange}</div>
          </div>
        </div>

        {/* Hero headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: -8 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "5px", textTransform: "uppercase" as const, color: "rgba(148,163,184,0.65)", marginBottom: -6 }}>IPO DEEP DIVE</div>
          <div style={{ fontSize: 132, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-6px", lineHeight: 0.9, textShadow: "0 4px 30px rgba(0,0,0,0.9)", fontStyle: "italic", marginLeft: -4 }}>REVIEW</div>
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: "-2.5px", lineHeight: 1, marginTop: 4, background: "linear-gradient(90deg, #F59E0B 0%, #FCD34D 52%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2026</div>
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 11, alignItems: "center", flexWrap: "wrap" as const }}>
          {pill("💰", "ISSUE SIZE", issueSize, "#60A5FA", "59,130,246")}
          {pill("📈", "REVENUE", revenueCagr, "#34D399", "16,185,129")}
          {pill("⚖️", "P/E RATIO", `P/E ${peRatio}`, "#FBBF24", "245,158,11")}
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: isProfitable ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1.5px solid ${isProfitable ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.45)"}`, borderRadius: 50, padding: "9px 13px", fontSize: 12, fontWeight: 800, color: isProfitable ? "#34D399" : "#F87171" }}>
            {isProfitable ? "✅ PROFITABLE" : "⚠️ LOSS-MAKING"}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div style={{ position: "absolute", top: 0, left: 772, right: 0, height: 720, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "38px 28px" }}>
        {/* Hexagonal badge */}
        <div style={{ position: "relative", transform: "rotate(-6deg)", filter: `drop-shadow(0 0 38px ${verdict.glowColor}) drop-shadow(0 22px 40px rgba(0,0,0,0.75))` }}>
          <svg width="308" height="288" viewBox="0 0 308 288" style={{ position: "absolute", top: -14, left: -14, zIndex: 0 }}>
            <polygon points="154,10 280,78 280,214 154,282 28,214 28,78" fill="none" stroke={verdict.color} strokeWidth="2.5" opacity="0.42" />
          </svg>
          <svg width="278" height="260" viewBox="0 0 278 260" style={{ position: "relative", zIndex: 1 }}>
            <defs>
              <linearGradient id="bg-badge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={verdict.bgStart} />
                <stop offset="100%" stopColor={verdict.bgEnd} />
              </linearGradient>
              <linearGradient id="shine-badge" x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <polygon points="139,6 261,73 261,203 139,270 17,203 17,73" fill="rgba(0,0,0,0.55)" transform="translate(5,8)" />
            <polygon points="139,6 261,73 261,203 139,270 17,203 17,73" fill="url(#bg-badge)" />
            <polygon points="139,6 261,73 261,203 139,270 17,203 17,73" fill="url(#shine-badge)" />
            <polygon points="139,6 261,73 261,203 139,270 17,203 17,73" fill="none" stroke={verdict.color} strokeWidth="2.5" opacity="0.9" />
            <polygon points="139,20 249,82 249,196 139,258 29,196 29,82" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          </svg>
          <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "3px", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>ANALYST VERDICT</div>
            <div style={{ fontSize: 27, fontWeight: 900, color: "#FFFFFF", letterSpacing: "1px", textShadow: "0 2px 10px rgba(0,0,0,0.5)", lineHeight: 1 }}>{verdict.subLabel}</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-2px", lineHeight: 1, textShadow: `0 0 28px ${verdict.glowColor}, 0 4px 20px rgba(0,0,0,0.7)` }}>{verdict.label}</div>
          </div>
        </div>

        {/* Scorecard */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(251,191,36,0.1)", border: "1.5px solid rgba(251,191,36,0.4)", borderRadius: 50, padding: "10px 20px" }}>
          <span style={{ fontSize: 17 }}>⭐</span>
          <div>
            <div style={{ fontSize: 9, color: "rgba(148,163,184,0.85)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const }}>SCORECARD</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#FCD34D", lineHeight: 1 }}>{overallRating}</div>
          </div>
        </div>

        {/* GMP */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(15,23,42,0.88)", border: `1.5px solid ${gmpTrendColor}55`, borderRadius: 50, padding: "11px 20px", boxShadow: `0 0 16px ${gmpTrendColor}28` }}>
          <span style={{ fontSize: 15 }}>📊</span>
          <div style={{ fontSize: 9, color: "rgba(148,163,184,0.85)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const }}>GMP</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: gmpTrendColor }}>{gmpFormatted}</div>
          <div style={{ width: 1, height: 18, background: "rgba(148,163,184,0.18)" }} />
          <div style={{ fontSize: 12, fontWeight: 800, color: gmpTrendColor, display: "flex", alignItems: "center", gap: 4 }}>{gmpEmoji} {gmpTrend.toUpperCase()}</div>
        </div>
      </div>

      {/* Top-right badges */}
      <div style={{ position: "absolute", top: 42, right: 34, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(239,68,68,0.14)", border: "1.5px solid rgba(239,68,68,0.5)", borderRadius: 50, padding: "7px 16px", boxShadow: "0 0 16px rgba(239,68,68,0.22)" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#EF4444", boxShadow: "0 0 6px #EF4444" }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: "#FFFFFF", letterSpacing: "1.5px", textTransform: "uppercase" as const }}>FULL REVIEW</span>
        </div>
        {priceBand && (
          <div style={{ background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.22)", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "rgba(203,213,225,0.9)" }}>
            Price Band: <span style={{ color: "#FCD34D" }}>{priceBand}</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};