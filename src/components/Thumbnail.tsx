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

export const Thumbnail: React.FC<ThumbnailProps> = (props) => {
  const data = resolveIPOData(props);

  // Derive metrics safely
  const companyName = data.companyName || "IPO Analysis";
  const issueSize = data.issue?.totalFormatted || "₹1,000+ Cr";
  const priceBand = data.issue?.priceBand || "";
  const revenueCagr = data.financials?.revenue?.cagr || "+35% CAGR";
  const targetPeer = data.peers?.table?.find((p) => p.isTargetCompany);
  const peRatio = targetPeer?.peRatio || data.peers?.industryAveragePe || "24.5x";
  const isProfitable = data.financials?.pat?.isProfitableNow ?? true;

  // Derive verdict tone
  const shortVerdict = (data.verdict?.shortTermVerdict || "").toLowerCase();
  const longVerdict = (data.verdict?.longTermVerdict || "").toLowerCase();
  const combinedVerdict = `${shortVerdict} ${longVerdict}`;

  let verdictLabel = "APPLY OR AVOID?";
  let verdictBg = C.yellow;
  let verdictTextColor = "#0F172A";

  if (combinedVerdict.includes("apply") || combinedVerdict.includes("subscribe")) {
    verdictLabel = "STRONG APPLY?";
    verdictBg = C.green;
  } else if (combinedVerdict.includes("avoid")) {
    verdictLabel = "BIG TRAP? AVOID!";
    verdictBg = C.coral;
    verdictTextColor = "#FFFFFF";
  } else {
    verdictLabel = "APPLY OR AVOID?";
    verdictBg = C.yellow;
  }

  return (
    <AbsoluteFill
      style={{
        width: 1280,
        height: 720,
        backgroundColor: "#070B14",
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.14) 0%, transparent 45%),
          radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
          linear-gradient(180deg, #0A0F1D 0%, #060911 100%)
        `,
        fontFamily: FONT.heading,
        color: C.text,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background Decorative Tech Grid Lines */}
      <svg
        width="1280"
        height="720"
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.12, pointerEvents: "none" }}
      >
        <defs>
          <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#60A5FA" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="1280" height="720" fill="url(#grid-pattern)" />
      </svg>

      {/* Top Header Bar */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 56,
          right: 56,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Company Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <CompanyLogo
            logoUrl={data.logoUrl}
            logoUrls={data.logoUrls}
            domain={data.domain}
            companyName={companyName}
            initials={data.logoInitials}
            size={72}
            style={{
              boxShadow: "0 8px 28px rgba(0,0,0,0.6), 0 0 16px rgba(59, 130, 246, 0.3)",
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: 18,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.5px",
                textTransform: "uppercase",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                maxWidth: 620,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {companyName}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.blueVibrant,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {data.industry ? `${data.industry} • ` : ""}INITIAL PUBLIC OFFERING
            </div>
          </div>
        </div>

        {/* Live / Deep-Dive Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(239, 68, 68, 0.16)",
            border: "1.5px solid rgba(239, 68, 68, 0.5)",
            padding: "8px 20px",
            borderRadius: 100,
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.25)",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: C.red,
              boxShadow: "0 0 8px #EF4444",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            IPO DEEP-DIVE
          </span>
        </div>
      </div>

      {/* Main Attention-Grabbing Hero Callout (Center) */}
      <div
        style={{
          position: "absolute",
          top: 146,
          left: 56,
          right: 56,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Left Headline */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "2.5px",
              color: C.cyanVibrant,
              textTransform: "uppercase",
              marginBottom: 8,
              textShadow: "0 0 16px rgba(34, 211, 238, 0.4)",
            }}
          >
            3-YEAR FINANCIALS & PEER BENCHMARK
          </div>

          <div
            style={{
              fontSize: 66,
              fontWeight: 950,
              lineHeight: 1.05,
              color: "#FFFFFF",
              letterSpacing: "-1.5px",
              textShadow: "0 4px 20px rgba(0,0,0,0.9)",
              maxWidth: 750,
            }}
          >
            {companyName.length > 20 ? "THE COMPLETE TRUTH" : `${companyName.toUpperCase()}`}
            <br />
            <span
              style={{
                color: "#FBBF24",
                background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              10X PROFIT OR TRAP?
            </span>
          </div>
        </div>

        {/* Right Stamp Pill (Massive CTR Hook) */}
        <div
          style={{
            background: verdictBg,
            color: verdictTextColor,
            padding: "24px 36px",
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 12px 40px ${verdictBg}66, 0 4px 12px rgba(0,0,0,0.5)`,
            transform: "rotate(-3deg)",
            border: "4px solid rgba(255,255,255,0.4)",
            minWidth: 280,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "2px",
              textTransform: "uppercase",
              opacity: 0.9,
              marginBottom: 4,
            }}
          >
            ANALYST VERDICT
          </span>
          <span
            style={{
              fontSize: 40,
              fontWeight: 950,
              letterSpacing: "1px",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {verdictLabel}
          </span>
        </div>
      </div>

      {/* Bottom Key Metric Showcase (3 Clean Stat Cards) */}
      <div
        style={{
          position: "absolute",
          bottom: 38,
          left: 56,
          right: 56,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 24,
        }}
      >
        {/* Metric 1: Issue Size */}
        <div
          style={{
            background: "rgba(17, 24, 39, 0.82)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(59, 130, 246, 0.35)",
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: C.textMuted,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            💰 TOTAL ISSUE SIZE
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: C.blueVibrant,
              letterSpacing: "-0.5px",
            }}
          >
            {issueSize}
          </div>
          <div style={{ fontSize: 13, color: C.textDim, fontWeight: 600, marginTop: 4 }}>
            {priceBand ? `Price: ${priceBand}` : "Fresh + OFS Offering"}
          </div>
        </div>

        {/* Metric 2: Growth / Revenue */}
        <div
          style={{
            background: "rgba(17, 24, 39, 0.82)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(16, 185, 129, 0.35)",
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: C.textMuted,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            📈 TOPLINE REVENUE
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: C.greenVibrant,
              letterSpacing: "-0.5px",
            }}
          >
            {revenueCagr}
          </div>
          <div style={{ fontSize: 13, color: C.textDim, fontWeight: 600, marginTop: 4 }}>
            {isProfitable ? "✅ Consistently Profitable" : "⚠️ Growth Stage Transition"}
          </div>
        </div>

        {/* Metric 3: Valuation / P/E */}
        <div
          style={{
            background: "rgba(17, 24, 39, 0.82)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(245, 158, 11, 0.35)",
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: C.textMuted,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ⚖️ VALUATION MULTIPLE
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: C.amber,
              letterSpacing: "-0.5px",
            }}
          >
            P/E: {peRatio}
          </div>
          <div style={{ fontSize: 13, color: C.textDim, fontWeight: 600, marginTop: 4 }}>
            Peer Comparison Benchmarked
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
