import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, ParticleField, AmbientSpotlight } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 12: Market Position — Podium-style graphic with spotlight. */
export const Scene12MarketPosition: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ind = data.industryContext;

  // Position text reveal
  const textSlam = spring({ frame: f - 15, fps, config: { damping: 8, stiffness: 140, mass: 0.6 } });
  const textScale = interpolate(textSlam, [0, 1], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Sparkle particles
  const sparkleOp = interpolate(f, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Handwritten annotation
  const annotText = `${data.companyName} is uniquely positioned to capture this massive growth wave.`;
  const annotChars = Math.min(Math.floor(Math.max(0, f - 55) * 1.5), annotText.length);

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
      <ParticleField count={40} color={C.gold} speed={0.6} />
      <AmbientSpotlight color={C.green} size={900} y="45%" />

      {/* Trophy / podium icon */}
      <div
        style={{
          opacity: interpolate(f, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${spring({ frame: f - 5, fps, config: { damping: 10, stiffness: 120 } })})`,
          fontSize: 80,
          marginBottom: 24,
        }}
      >
        🏆
      </div>

      {/* Market position text */}
      <div
        style={{
          opacity: textSlam,
          transform: `scale(${textScale})`,
          fontSize: 44,
          fontWeight: 900,
          color: C.greenVibrant,
          fontFamily: FONT.heading,
          textAlign: "center",
          maxWidth: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
          textShadow: `0 0 40px ${C.green}40, 0 0 80px ${C.green}15`,
        }}
      >
        {ind.marketPosition}
      </div>

      {/* Decorative sketch underline */}
      <svg width={400} height={8} style={{ marginTop: 16, opacity: sparkleOp }}>
        <line
          x1={0}
          y1={4}
          x2={400 * interpolate(f, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          y2={4}
          stroke={C.green}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>

      {/* Handwritten annotation */}
      <div
        style={{
          marginTop: 40,
          fontSize: 22,
          fontWeight: 600,
          color: C.sketch,
          fontFamily: "'Caveat', cursive, " + FONT.body,
          fontStyle: "italic",
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.5,
        }}
      >
        {annotText.substring(0, annotChars)}
      </div>
    </AbsoluteFill>
  );
};
