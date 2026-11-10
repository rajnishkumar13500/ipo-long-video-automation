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
  label: string;
  subLabel: string;
  icon: string;
  color: string;
  glowColor: string;
  badgeBg: string;
  accentBg: string;
  borderColor: string;
} {
  const v = (data.verdict?.shortTermVerdict || "").toLowerCase();
  const lv = (data.verdict?.longTermVerdict || "").toLowerCase();
  const combined = `${v} ${lv}`;

  if (combined.includes("avoid")) {
    return {
      label: "AVOID",
      subLabel: "HIGH RISK • RED FLAG",
      icon: "❌",
      color: "#EF4444",
      glowColor: "rgba(239, 68, 68, 0.65)",
      badgeBg: "linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #EF4444 100%)",
      accentBg: "rgba(239, 68, 68, 0.2)",
      borderColor: "#F87171",
    };
  }

  if (combined.includes("apply") || combined.includes("subscribe")) {
    return {
      label: "APPLY",
      subLabel: "STRONG BUY • LISTING GAIN",
      icon: "✅",
      color: "#10B981",
      glowColor: "rgba(16, 185, 129, 0.65)",
      badgeBg: "linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)",
      accentBg: "rgba(16, 185, 129, 0.2)",
      borderColor: "#34D399",
    };
  }

  return {
    label: "NEUTRAL",
    subLabel: "WATCHLIST • HIGH CAUTION",
    icon: "⚠️",
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.65)",
    badgeBg: "linear-gradient(135deg, #78350F 0%, #D97706 50%, #F59E0B 100%)",
    accentBg: "rgba(245, 158, 11, 0.2)",
    borderColor: "#FBBF24",
  };
}

export const Thumbnail: React.FC<ThumbnailProps> = (props) => {
  const data = resolveIPOData(props);
  const companyName = data.companyName || "IPO Analysis";
  const industry = data.industry || "Mainboard IPO";
  const exchange = data.exchange || "NSE • BSE";
  const issueSize = data.issue?.totalFormatted || "₹500+ Cr";
  const priceBand = data.issue?.priceBand || "Market Price";
  const minInvestment = data.issue?.minInvestment || "₹14,800";
  const lotSize = data.issue?.lotSize || "Standard Lot";
  const revenueCagr = data.financials?.revenue?.cagr || "+28% CAGR";
  const latestRev = data.financials?.revenue?.valuesFormatted?.[2] || "Expanded Revenue";
  const targetPeer = data.peers?.table?.find((p) => p.isTargetCompany);
  const peRatio = targetPeer?.peRatio || data.peers?.industryAveragePe || "24.5x";
  const gmpFormatted = data.verdict?.gmp?.currentGmpFormatted || "N/A";
  const gmpTrend = data.verdict?.gmp?.trend || "Bullish";
  const overallRating = data.verdict?.scorecard?.overallRating || "7.8 / 10";
  const isProfitable = data.financials?.pat?.isProfitableNow ?? true;
  const verdict = deriveVerdict(data);

  // Clean company name: if long, break into two lines cleanly
  const words = companyName.split(" ");
  let nameLine1 = companyName;
  let nameLine2 = "";
  if (companyName.length > 22 && words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    nameLine1 = words.slice(0, mid).join(" ");
    nameLine2 = words.slice(mid).join(" ");
  }

  return (
    <AbsoluteFill
      style={{
        width: 1280,
        height: 720,
        overflow: "hidden",
        fontFamily: FONT.heading,
        color: C.text,
        position: "relative",
        backgroundColor: "#050814",
      }}
    >
      {/* ─── Modern Atmospheric Glows & Grid ──────────────────────────── */}
      <svg
        width="1280"
        height="720"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <radialGradient id="mesh-left" cx="20%" cy="30%" r="65%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.22)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="mesh-verdict" cx="82%" cy="48%" r="60%">
            <stop offset="0%" stopColor={verdict.glowColor} />
            <stop offset="60%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="mesh-center" cx="45%" cy="85%" r="50%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.14)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <pattern
            id="thumb-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(255, 255, 255, 0.035)"
              strokeWidth="0.8"
            />
          </pattern>
          <linearGradient id="chart-line-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
            <stop offset="35%" stopColor="rgba(6, 182, 212, 0.7)" />
            <stop offset="70%" stopColor="rgba(16, 185, 129, 0.9)" />
            <stop offset="100%" stopColor={verdict.color} />
          </linearGradient>
        </defs>

        {/* Subtle grid */}
        <rect width="1280" height="720" fill="url(#thumb-grid)" />

        {/* Ambient colored lighting */}
        <rect width="1280" height="720" fill="url(#mesh-left)" />
        <rect width="1280" height="720" fill="url(#mesh-verdict)" />
        <rect width="1280" height="720" fill="url(#mesh-center)" />

        {/* Upward Stock Market Trend Line Silhouette in background */}
        <path
          d="M 60 620 Q 240 590, 420 540 T 780 440 T 1050 330 T 1240 180"
          fill="none"
          stroke="url(#chart-line-glow)"
          strokeWidth="4"
          opacity="0.55"
        />
        <path
          d="M 60 620 Q 240 590, 420 540 T 780 440 T 1050 330 T 1240 180 L 1240 720 L 60 720 Z"
          fill="url(#chart-line-glow)"
          opacity="0.04"
        />

        {/* Sleek outer frame border */}
        <rect
          x="1"
          y="1"
          width="1278"
          height="718"
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
          rx="12"
        />
      </svg>

      {/* ─── LEFT COLUMN: HERO HOOK & BRANDING (Width: 770px) ──────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 800,
          height: 720,
          padding: "36px 42px 34px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        {/* Top Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Live Hot Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(239, 68, 68, 0.18)",
              border: "1.5px solid rgba(239, 68, 68, 0.65)",
              borderRadius: 30,
              padding: "7px 16px",
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.35)",
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: "#EF4444",
                boxShadow: "0 0 10px #EF4444",
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              🔥 IPO DEEP DIVE
            </span>
          </div>

          {/* Exchange & Category Pill */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1.5px solid rgba(6, 182, 212, 0.4)",
              borderRadius: 30,
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: 800,
              color: "#22D3EE",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              backdropFilter: "blur(12px)",
            }}
          >
            {exchange} • {industry.length > 28 ? industry.substring(0, 26) + "…" : industry}
          </div>
        </div>

        {/* Company Header Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: "rgba(15, 23, 42, 0.72)",
            border: "1.5px solid rgba(255, 255, 255, 0.14)",
            borderRadius: 22,
            padding: "16px 22px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(16px)",
            marginTop: 4,
          }}
        >
          {/* Logo Frame */}
          <div
            style={{
              padding: 4,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 22,
              border: "1.5px solid rgba(255, 255, 255, 0.22)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 25px rgba(6, 182, 212, 0.45)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CompanyLogo
              logoUrl={data.logoUrl}
              logoUrls={data.logoUrls}
              domain={data.domain}
              companyName={companyName}
              initials={data.logoInitials}
              bgColor={data.logoBgColor || "#1E3A8A"}
              size={76}
              style={{
                borderRadius: 18,
              }}
            />
          </div>

          {/* Company Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: nameLine2 ? 30 : 36,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.8px",
                lineHeight: 1.15,
                textTransform: "uppercase",
                textShadow: "0 3px 12px rgba(0, 0, 0, 0.8)",
              }}
            >
              {nameLine1}
            </div>
            {nameLine2 && (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.8px",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  textShadow: "0 3px 12px rgba(0, 0, 0, 0.8)",
                }}
              >
                {nameLine2}
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 6,
                fontSize: 13,
                fontWeight: 800,
                color: "#FCD34D",
              }}
            >
              <span>Price Band: <strong style={{ color: "#FFFFFF" }}>{priceBand}</strong></span>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>•</span>
              <span>Min: <strong style={{ color: "#FFFFFF" }}>{minInvestment}</strong> ({lotSize})</span>
            </div>
          </div>
        </div>

        {/* Hero Click-Trigger Headline */}
        <div style={{ margin: "4px 0", display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 70,
              fontWeight: 950,
              fontStyle: "italic",
              letterSpacing: "-2.5px",
              lineHeight: 0.95,
              textShadow: "0 6px 30px rgba(0, 0, 0, 0.95)",
            }}
          >
            <span
              style={{
                color: "#10B981",
                textShadow: "0 0 35px rgba(16, 185, 129, 0.7), 0 4px 15px rgba(0,0,0,0.9)",
              }}
            >
              APPLY
            </span>{" "}
            <span style={{ color: "#94A3B8", fontSize: "0.82em", fontStyle: "normal" }}>OR</span>{" "}
            <span
              style={{
                color: "#EF4444",
                textShadow: "0 0 35px rgba(239, 68, 68, 0.7), 0 4px 15px rgba(0,0,0,0.9)",
              }}
            >
              AVOID?
            </span>
          </div>

          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: "-0.8px",
              lineHeight: 1.05,
              display: "flex",
              alignItems: "center",
              gap: 12,
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
            }}
          >
            <span
              style={{
                background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {issueSize}
            </span>
            <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "0.8em" }}>•</span>
            <span
              style={{
                background: "linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              REAL TRUTH & ANALYSIS
            </span>
          </div>
        </div>

        {/* 3 High-Impact Stat Cards */}
        <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
          {/* Stat 1: Issue Size */}
          <div
            style={{
              flex: 1,
              background: "rgba(15, 23, 42, 0.78)",
              border: "1.5px solid rgba(59, 130, 246, 0.45)",
              borderRadius: 18,
              padding: "12px 16px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(148, 163, 184, 0.9)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              💰 TOTAL ISSUE
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#60A5FA", marginTop: 2, lineHeight: 1 }}>
              {issueSize}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(203, 213, 225, 0.75)", marginTop: 4 }}>
              Fresh: {data.issue?.freshPercent || "100%"}
            </div>
          </div>

          {/* Stat 2: Revenue CAGR */}
          <div
            style={{
              flex: 1,
              background: "rgba(15, 23, 42, 0.78)",
              border: "1.5px solid rgba(16, 185, 129, 0.45)",
              borderRadius: 18,
              padding: "12px 16px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(148, 163, 184, 0.9)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              📈 REVENUE GROWTH
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#34D399", marginTop: 2, lineHeight: 1 }}>
              {revenueCagr}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(203, 213, 225, 0.75)", marginTop: 4 }}>
              {latestRev}
            </div>
          </div>

          {/* Stat 3: Valuation Multiple */}
          <div
            style={{
              flex: 1,
              background: "rgba(15, 23, 42, 0.78)",
              border: "1.5px solid rgba(245, 158, 11, 0.45)",
              borderRadius: 18,
              padding: "12px 16px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(148, 163, 184, 0.9)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              ⚖️ P/E MULTIPLE
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#FBBF24", marginTop: 2, lineHeight: 1 }}>
              {peRatio}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isProfitable ? "#34D399" : "#F87171", marginTop: 4 }}>
              {isProfitable ? "✅ Profitable" : "⚠️ Loss-Making"}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: 3D GLASSMASTER DECISION CARD (Width: 440px) ─ */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 44,
          width: 410,
          height: 648,
          background: "linear-gradient(180deg, rgba(30, 41, 59, 0.88) 0%, rgba(15, 23, 42, 0.96) 100%)",
          border: `2.5px solid ${verdict.color}`,
          borderRadius: 28,
          boxShadow: `0 0 50px ${verdict.glowColor}, 0 25px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
          backdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "26px 26px",
          zIndex: 20,
        }}
      >
        {/* Card Header: Scorecard Rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(15, 23, 42, 0.85)",
            border: "1.5px solid rgba(251, 191, 36, 0.5)",
            borderRadius: 50,
            padding: "9px 18px",
            boxShadow: "0 0 16px rgba(245, 158, 11, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(226, 232, 240, 0.9)", letterSpacing: "1.5px" }}>
              ANALYST SCORECARD
            </span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#FCD34D" }}>
            {overallRating}
          </span>
        </div>

        {/* Big Punchy Glowing Action Verdict Stamp */}
        <div
          style={{
            background: verdict.badgeBg,
            borderRadius: 22,
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxShadow: `0 14px 40px ${verdict.glowColor}, inset 0 2px 4px rgba(255, 255, 255, 0.5), inset 0 -4px 10px rgba(0, 0, 0, 0.45)`,
            border: `2px solid ${verdict.borderColor}`,
            margin: "8px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Sheen reflection */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "48%",
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 100%)",
              borderRadius: "20px 20px 0 0",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "3px",
              color: "rgba(255, 255, 255, 0.9)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            FINAL VERDICT
          </div>

          <div
            style={{
              fontSize: 64,
              fontWeight: 950,
              letterSpacing: "2px",
              color: "#FFFFFF",
              lineHeight: 1,
              textShadow: "0 6px 20px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>{verdict.icon}</span>
            <span>{verdict.label}</span>
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "1.5px",
              color: "#FFFFFF",
              marginTop: 10,
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              padding: "5px 16px",
              borderRadius: 30,
              textTransform: "uppercase",
            }}
          >
            {verdict.subLabel}
          </div>
        </div>

        {/* Grey Market Premium (GMP) Meter */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.94)",
            border: "1.5px solid rgba(16, 185, 129, 0.55)",
            borderRadius: 18,
            padding: "16px 20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.55), 0 0 24px rgba(16, 185, 129, 0.22)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(148, 163, 184, 0.95)", letterSpacing: "1.5px" }}>
              🔥 GREY MARKET PREMIUM
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#34D399",
                background: "rgba(16, 185, 129, 0.22)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                padding: "3px 10px",
                borderRadius: 12,
              }}
            >
              🟢 {gmpTrend.toUpperCase()}
            </span>
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 950,
              color: "#34D399",
              marginTop: 6,
              lineHeight: 1,
              letterSpacing: "-0.5px",
              textShadow: "0 0 24px rgba(16, 185, 129, 0.45)",
            }}
          >
            {gmpFormatted}
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(203, 213, 225, 0.9)",
              marginTop: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Est. Listing: <strong style={{ color: "#FFFFFF" }}>{data.verdict?.gmp?.estimatedListingPrice || "Strong Premium"}</strong></span>
            <span style={{ color: "#FBBF24", fontWeight: 900, fontSize: 11 }}>⚡ HIGH DEMAND</span>
          </div>
        </div>

        {/* Card Footer Call to Action */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 14px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span style={{ fontSize: 14 }}>🚀</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            COMPLETE RETAIL INVESTOR GUIDE
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
