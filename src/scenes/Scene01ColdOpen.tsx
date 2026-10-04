import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, ParticleField } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 01: Cold Open — Tension question mark, then dramatic text reveal. */
export const Scene01ColdOpen: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Question mark sketch draw
  const qDrawProgress = interpolate(f, [5, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text typewriter
  const questionText = `Should you invest ₹${data.issue.minInvestment?.replace("₹", "") || "14,720"} in THIS IPO?`;
  const visibleChars = Math.min(Math.floor(Math.max(0, f - 25) * 1.5), questionText.length);
  const displayText = questionText.substring(0, visibleChars);

  // Shatter effect for transition (last 20 frames)
  const totalDur = durationInFrames;
  const shatterProgress = interpolate(f, [totalDur - 25, totalDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ambient pulse
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.05);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        opacity: 1 - shatterProgress,
        transform: `scale(${1 + shatterProgress * 0.3})`,
      }}
    >
      <GrainOverlay opacity={0.04} />
      <ParticleField count={20} color={C.yellow} speed={0.3} />

      {/* Large question mark */}
      <svg
        width={300}
        height={300}
        viewBox="0 0 300 300"
        style={{
          position: "absolute",
          opacity: 0.08 + pulse * 0.04,
          filter: `drop-shadow(0 0 40px ${C.yellow}30)`,
        }}
      >
        <text
          x="150"
          y="230"
          textAnchor="middle"
          fontSize="280"
          fontWeight="900"
          fontFamily={FONT.heading}
          fill={C.yellow}
          strokeDasharray={800}
          strokeDashoffset={800 * (1 - qDrawProgress)}
          stroke={C.yellow}
          strokeWidth={2}
        >
          ?
        </text>
      </svg>

      {/* Investment amount big reveal */}
      <div
        style={{
          opacity: interpolate(f, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${spring({ frame: f - 8, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } })})`,
          fontSize: 72,
          fontWeight: 900,
          color: C.gold,
          fontFamily: FONT.mono,
          textShadow: `0 0 40px ${C.gold}50, 0 0 80px ${C.gold}20`,
          marginBottom: 30,
        }}
      >
        {data.issue.minInvestment || "₹14,720"}
      </div>

      {/* Question text typewriter */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: C.text,
          fontFamily: FONT.heading,
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {displayText}
        {visibleChars < questionText.length && (
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 32,
              backgroundColor: C.cyan,
              marginLeft: 3,
              verticalAlign: "text-bottom",
              opacity: Math.round(f * 0.08) % 2 === 0 ? 1 : 0,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
