import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay } from "../components/GrainOverlay";
import { useGlitch } from "../components/Animations";
import { IPOData, RiskItemData } from "../types/ipo";

interface RiskCardItemProps {
  risk: RiskItemData;
  idx: number;
  f: number;
  fps: number;
  severityColors: Record<string, string>;
  severityIcons: Record<string, string>;
}

const RiskCardItem: React.FC<RiskCardItemProps> = ({
  risk,
  idx,
  f,
  fps,
  severityColors,
  severityIcons,
}) => {
  const riskStart = 12 + idx * 35;
  const riskProgress = spring({
    frame: f - riskStart,
    fps,
    config: { damping: 16, stiffness: 80, mass: 0.9 },
  });
  const slideX = interpolate(riskProgress, [0, 1], [150, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const color = severityColors[risk.severity] || C.yellow;
  const icon = severityIcons[risk.severity] || "⚠️";

  // Glitch on reveal
  const glitch = useGlitch(riskStart, 5);

  return (
    <div
      style={{
        opacity: riskProgress,
        transform: `translateX(${slideX + glitch.x}px) translateY(${glitch.y}px)`,
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
        background: C.bgCard,
        border: `1.5px solid ${color}50`,
        borderRadius: 18,
        padding: "26px 32px",
        boxShadow: `0 8px 30px rgba(0,0,0,0.35), 0 0 20px ${color}15`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: color,
          borderRadius: "18px 0 0 18px",
        }}
      />

      {/* Severity badge */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          marginLeft: 10,
        }}
      >
        <span style={{ fontSize: 32 }}>{icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color,
            textTransform: "uppercase",
            fontFamily: FONT.mono,
            padding: "2px 8px",
            background: `${color}15`,
            borderRadius: 4,
          }}
        >
          {risk.severity}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color,
              background: `${color}18`,
              border: `1px solid ${color}30`,
              borderRadius: 6,
              padding: "2px 10px",
              fontFamily: FONT.body,
              textTransform: "uppercase",
            }}
          >
            {risk.tag}
          </span>
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            fontFamily: FONT.heading,
            marginBottom: 8,
          }}
        >
          {risk.title}
        </div>
        <div
          style={{
            fontSize: 16,
            color: C.textMuted,
            fontWeight: 500,
            fontFamily: FONT.body,
            lineHeight: 1.5,
          }}
        >
          {risk.detail}
        </div>
      </div>
    </div>
  );
};

/** Scene 25: Risk Cards — Three risks revealed sequentially with isolation. */
export const Scene25RiskCards: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const risks = data.risks.items;

  // Smooth exit transition into next scene
  const exitOp = interpolate(
    f,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const severityColors: Record<string, string> = {
    High: C.coral,
    Medium: C.yellow,
    Low: C.green,
  };
  const severityIcons: Record<string, string> = {
    High: "⛔",
    Medium: "🟡",
    Low: "🟢",
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "60px 100px",
        opacity: exitOp,
      }}
    >
      <GrainOverlay opacity={0.04} />

      {/* Red ambient tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${C.red}08 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Section title */}
      <div
        style={{
          opacity: interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 16,
          fontWeight: 700,
          color: C.coral,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: FONT.body,
          marginBottom: 40,
        }}
      >
        ⚠️ KEY RISK FACTORS
      </div>

      {/* Risk cards — sequential reveal */}
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 22 }}>
        {risks.slice(0, 3).map((risk, idx) => (
          <RiskCardItem
            key={idx}
            risk={risk}
            idx={idx}
            f={f}
            fps={fps}
            severityColors={severityColors}
            severityIcons={severityIcons}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
