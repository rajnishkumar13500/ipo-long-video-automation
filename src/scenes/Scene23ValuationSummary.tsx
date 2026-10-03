import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { useSketchDraw } from "../components/Animations";
import { IPOData } from "../types/ipo";

/** Scene 23: Valuation Summary — Spotlight on key P/E insight with sketch arrow. */
export const Scene23ValuationSummary: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const peers = data.peers;

  const targetRow = peers.table.find((r) => r.isTargetCompany);
  const targetPe = targetRow?.peRatio || "24.6x";
  const industryPe = peers.industryAveragePe;

  // Number slams
  const n1Slam = spring({ frame: f - 10, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } });
  const n2Slam = spring({ frame: f - 30, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } });

  // Arrow draw
  const arrowProgress = useSketchDraw(45, 30);

  // Verdict badge
  const verdictOp = interpolate(f, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.purple} size={900} y="45%" />

      {/* Label */}
      <div
        style={{
          opacity: interpolate(f, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 16,
          fontWeight: 700,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: FONT.body,
          marginBottom: 40,
        }}
      >
        ⚖️ VALUATION SNAPSHOT
      </div>

      {/* Two numbers with arrow between */}
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        {/* Target P/E */}
        <div style={{ textAlign: "center", opacity: n1Slam, transform: `scale(${interpolate(n1Slam, [0, 1], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` }}>
          <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 700, fontFamily: FONT.body, textTransform: "uppercase", marginBottom: 8 }}>
            {data.companyName}
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: C.greenVibrant,
              fontFamily: FONT.mono,
              textShadow: `0 0 40px ${C.green}40`,
            }}
          >
            {targetPe}
          </div>
        </div>

        {/* Arrow */}
        <svg width={120} height={60} viewBox="0 0 120 60" style={{ opacity: arrowProgress }}>
          <line
            x1={0}
            y1={30}
            x2={90 * arrowProgress}
            y2={30}
            stroke={C.sketch}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
          <polygon
            points="85,20 110,30 85,40"
            fill={C.sketch}
            opacity={arrowProgress}
          />
          <text x={55} y={22} textAnchor="middle" fontSize={14} fill={C.textMuted} fontFamily={FONT.body} fontWeight={600}>
            vs
          </text>
        </svg>

        {/* Industry P/E */}
        <div style={{ textAlign: "center", opacity: n2Slam, transform: `scale(${interpolate(n2Slam, [0, 1], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` }}>
          <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 700, fontFamily: FONT.body, textTransform: "uppercase", marginBottom: 8 }}>
            Industry Median
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: C.textDim,
              fontFamily: FONT.mono,
            }}
          >
            {industryPe}
          </div>
        </div>
      </div>

      {/* Verdict badge */}
      <div
        style={{
          marginTop: 50,
          opacity: verdictOp,
          transform: `scale(${interpolate(verdictOp, [0, 1], [1.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          background: `${C.green}18`,
          border: `2px solid ${C.green}50`,
          borderRadius: 16,
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 24 }}>💎</span>
        <span style={{ fontSize: 24, fontWeight: 800, color: C.greenVibrant, fontFamily: FONT.body }}>
          Reasonable Discount to Peers
        </span>
      </div>

      {/* Sketch underline */}
      <svg width={300} height={6} style={{ marginTop: 16, opacity: verdictOp }}>
        <line x1={0} y1={3} x2={300 * verdictOp} y2={3} stroke={C.green} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};
