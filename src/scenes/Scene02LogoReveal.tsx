import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { CompanyLogo } from "../components/CompanyLogo";
import { GrainOverlay, ParticleField, AmbientSpotlight } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 02: Logo Reveal — Company logo materializes from sketch strokes. */
export const Scene02LogoReveal: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scale-in
  const logoScale = spring({
    frame: f - 5,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.7 },
  });

  // Name slam-in
  const nameSlam = spring({
    frame: f - 18,
    fps,
    config: { damping: 7, stiffness: 180, mass: 0.5 },
  });
  const nameScale = interpolate(nameSlam, [0, 1], [2.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badges sketch in
  const badge1Op = interpolate(f, [35, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badge2Op = interpolate(f, [45, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badge3Op = interpolate(f, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Radial glow behind logo
  const glowPulse = 0.5 + 0.5 * Math.sin(f * 0.04);

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
      <ParticleField count={25} color={C.blue} speed={0.4} />
      <AmbientSpotlight color={C.blue} size={900} />

      {/* Radial glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${data.logoBgColor || C.blue}20 0%, transparent 60%)`,
          opacity: 0.3 + glowPulse * 0.2,
        }}
      />

      {/* Company logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: interpolate(logoScale, [0, 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          marginBottom: 24,
        }}
      >
        <CompanyLogo
          size={140}
          logoUrl={data.logoUrl}
          logoUrls={data.logoUrls}
          domain={data.domain}
          companyName={data.companyName}
          initials={data.logoInitials}
          bgColor={data.logoBgColor || C.blueDark}
          scale={1.2}
        />
      </div>

      {/* Company name slam */}
      <div
        style={{
          opacity: nameSlam,
          transform: `scale(${nameScale})`,
          fontSize: 64,
          fontWeight: 900,
          color: C.text,
          fontFamily: FONT.heading,
          letterSpacing: "-0.03em",
          textAlign: "center",
          textShadow: `0 0 40px ${C.blue}30`,
          marginBottom: 8,
        }}
      >
        {data.companyName}
      </div>

      {/* IPO badge */}
      <div
        style={{
          opacity: nameSlam,
          fontSize: 22,
          fontWeight: 700,
          color: C.gold,
          fontFamily: FONT.body,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 36,
          textShadow: `0 0 20px ${C.gold}40`,
        }}
      >
        IPO DEEP-DIVE ANALYSIS
      </div>

      {/* Info badges */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <div
          style={{
            opacity: badge1Op,
            transform: `translateY(${(1 - badge1Op) * 15}px)`,
            background: `${C.blue}18`,
            border: `1.5px solid ${C.blue}40`,
            borderRadius: 12,
            padding: "10px 22px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>🏢</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.blue, fontFamily: FONT.body }}>
            {data.industry}
          </span>
        </div>

        <div
          style={{
            opacity: badge2Op,
            transform: `translateY(${(1 - badge2Op) * 15}px)`,
            background: `${C.green}18`,
            border: `1.5px solid ${C.green}40`,
            borderRadius: 12,
            padding: "10px 22px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>📊</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.green, fontFamily: FONT.body }}>
            {data.exchange || "NSE • BSE"}
          </span>
        </div>

        <div
          style={{
            opacity: badge3Op,
            transform: `translateY(${(1 - badge3Op) * 15}px)`,
            background: `${C.yellow}18`,
            border: `1.5px solid ${C.yellow}40`,
            borderRadius: 12,
            padding: "10px 22px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>💰</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.yellow, fontFamily: FONT.body }}>
            {data.issue.totalFormatted}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
