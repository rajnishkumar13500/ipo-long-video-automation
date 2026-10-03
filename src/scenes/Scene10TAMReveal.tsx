import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight, ParticleField } from "../components/GrainOverlay";
import { useCameraShake } from "../components/Animations";
import { IPOData } from "../types/ipo";

/** Scene 10: TAM Reveal — Massive market size number with dramatic reveal. */
export const Scene10TAMReveal: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ind = data.industryContext;

  // Big number slam
  const numSlam = spring({ frame: f - 10, fps, config: { damping: 7, stiffness: 180, mass: 0.5 } });
  const numScale = interpolate(numSlam, [0, 1], [4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Camera shake on slam
  const shake = useCameraShake(10, 12, 6);

  // CAGR badge slam
  const cagrSlam = spring({ frame: f - 55, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } });
  const cagrScale = interpolate(cagrSlam, [0, 1], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Trend line sketch
  const lineProgress = interpolate(f, [70, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Sector name
  const sectorOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        transform: `translate(${shake.x}px, ${shake.y}px)`,
      }}
    >
      <GrainOverlay opacity={0.03} />
      <ParticleField count={35} color={C.gold} speed={0.5} />
      <AmbientSpotlight color={C.yellow} size={1000} y="45%" />

      {/* Sector name */}
      <div
        style={{
          opacity: sectorOp,
          fontSize: 16,
          fontWeight: 700,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: FONT.body,
          marginBottom: 20,
        }}
      >
        📊 {ind.sectorName}
      </div>

      {/* Massive TAM number */}
      <div
        style={{
          opacity: numSlam,
          transform: `scale(${numScale})`,
          fontSize: 100,
          fontWeight: 900,
          color: C.gold,
          fontFamily: FONT.mono,
          letterSpacing: "-0.03em",
          textShadow: `0 0 60px ${C.gold}40, 0 0 120px ${C.gold}15`,
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {ind.marketSizeFormatted}
      </div>

      {/* Growing trend line behind */}
      <svg
        width={600}
        height={80}
        style={{ marginBottom: 24 }}
        viewBox="0 0 600 80"
      >
        <path
          d={`M 0 70 Q 150 60 250 45 Q 350 30 450 15 L 600 5`}
          fill="none"
          stroke={C.green}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={700}
          strokeDashoffset={700 * (1 - lineProgress)}
          opacity={0.5}
        />
        {/* Glow version */}
        <path
          d={`M 0 70 Q 150 60 250 45 Q 350 30 450 15 L 600 5`}
          fill="none"
          stroke={C.green}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={700}
          strokeDashoffset={700 * (1 - lineProgress)}
          opacity={0.15}
        />
      </svg>

      {/* CAGR Badge */}
      <div
        style={{
          opacity: cagrSlam,
          transform: `scale(${cagrScale})`,
          background: `${C.green}18`,
          border: `2px solid ${C.green}50`,
          borderRadius: 16,
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 26 }}>🚀</span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: C.greenVibrant,
            fontFamily: FONT.mono,
            textShadow: `0 0 15px ${C.green}40`,
          }}
        >
          {ind.cagrText}
        </span>
      </div>
    </AbsoluteFill>
  );
};
