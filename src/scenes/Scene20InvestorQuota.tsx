import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 20: Investor Quota — Animated stacked bar with retail spotlight. */
export const Scene20InvestorQuota: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const issue = data.issue;

  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const quotas = [
    { label: "QIB", value: parseFloat(issue.qibQuota || "50"), color: C.blue, formatted: issue.qibQuota || "50%" },
    { label: "NII / HNI", value: parseFloat(issue.niiQuota || "15"), color: C.yellow, formatted: issue.niiQuota || "15%" },
    { label: "Retail", value: parseFloat(issue.retailQuota || "35"), color: C.green, formatted: issue.retailQuota || "35%" },
  ];

  // Retail spotlight pulse
  const retailPulse = 0.5 + 0.5 * Math.sin(f * 0.06);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "60px 120px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.green} size={800} y="45%" />

      {/* Header */}
      <div style={{ marginBottom: 50, textAlign: "center", opacity: titleOp }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: FONT.heading, letterSpacing: "-0.02em" }}>
          Investor Category Quota
        </div>
        <div style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, fontFamily: FONT.body, marginTop: 6 }}>
          How the offer is distributed among investor classes
        </div>
      </div>

      {/* Stacked horizontal bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          height: 70,
          borderRadius: 18,
          display: "flex",
          overflow: "hidden",
          border: `1.5px solid ${C.borderLight}`,
          marginBottom: 40,
        }}
      >
        {quotas.map((q, idx) => {
          const segDelay = 15 + idx * 18;
          const segProgress = spring({
            frame: f - segDelay,
            fps,
            config: { damping: 16, stiffness: 70, mass: 1.0 },
          });
          const segWidth = q.value * segProgress;
          const isRetail = q.label === "Retail";

          return (
            <div
              key={idx}
              style={{
                width: `${segWidth}%`,
                height: "100%",
                background: isRetail
                  ? `linear-gradient(90deg, ${q.color}, ${q.color}CC)`
                  : `linear-gradient(90deg, ${q.color}80, ${q.color}50)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight: idx < quotas.length - 1 ? `2px solid ${C.bgDark}` : "none",
                boxShadow: isRetail ? `0 0 ${20 + retailPulse * 10}px ${q.color}40` : "none",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: FONT.mono,
                  opacity: segProgress,
                  whiteSpace: "nowrap",
                }}
              >
                {q.label}: {q.formatted}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quota breakdown cards */}
      <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
        {quotas.map((q, idx) => {
          const cardDelay = 55 + idx * 12;
          const cardOp = interpolate(f, [cardDelay, cardDelay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isRetail = q.label === "Retail";

          return (
            <div
              key={idx}
              style={{
                opacity: cardOp,
                transform: `translateY(${(1 - cardOp) * 15}px)`,
                background: isRetail ? `${q.color}15` : C.bgCard,
                border: `1.5px solid ${isRetail ? q.color : C.borderLight}50`,
                borderRadius: 16,
                padding: "22px 30px",
                textAlign: "center",
                minWidth: 200,
                boxShadow: isRetail
                  ? `0 0 20px ${q.color}20, 0 8px 25px rgba(0,0,0,0.3)`
                  : "0 8px 25px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: q.color,
                  margin: "0 auto 10px",
                  boxShadow: `0 0 8px ${q.color}60`,
                }}
              />
              <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 700, fontFamily: FONT.body, textTransform: "uppercase" }}>
                {q.label}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: q.color, fontFamily: FONT.mono, marginTop: 6, textShadow: isRetail ? `0 0 15px ${q.color}40` : "none" }}>
                {q.formatted}
              </div>
              {isRetail && (
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, fontFamily: FONT.body }}>
                  Min: {issue.minInvestment}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
