import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { AnimatedDonut } from "../components/AnimatedPie";
import { IPOData } from "../types/ipo";

/** Scene 03: Issue Headline Numbers — Sequential dramatic number reveals. */
export const Scene03IssueNumbers: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Number 1: Total Issue Size slam
  const n1Slam = spring({ frame: f - 5, fps, config: { damping: 7, stiffness: 200, mass: 0.5 } });
  const n1Scale = interpolate(n1Slam, [0, 1], [3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Number 2: Price Band sketch
  const n2Op = interpolate(f, [60, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n2Y = interpolate(f, [60, 78], [25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Number 3: Fresh vs OFS pie
  const n3Op = interpolate(f, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtle grid background animation
  const gridOffset = f * 0.2;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "0 120px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.gold} size={1000} y="40%" />

      {/* Subtle animated grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `linear-gradient(${C.textDim} 1px, transparent 1px), linear-gradient(90deg, ${C.textDim} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${gridOffset}px`,
        }}
      />

      <div style={{ display: "flex", gap: 50, alignItems: "center", justifyContent: "center", maxWidth: 1050, width: "100%" }}>
        {/* Left: Big numbers stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 34, minWidth: 460 }}>
          {/* Total Issue Size */}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: FONT.body,
                marginBottom: 8,
                opacity: n1Slam,
              }}
            >
              TOTAL ISSUE SIZE
            </div>
            <div
              style={{
                opacity: n1Slam,
                transform: `scale(${n1Scale})`,
                transformOrigin: "left center",
                fontSize: 80,
                fontWeight: 900,
                color: C.gold,
                fontFamily: FONT.mono,
                letterSpacing: "-0.03em",
                textShadow: `0 0 50px ${C.gold}40, 0 0 100px ${C.gold}15`,
                lineHeight: 1,
              }}
            >
              {data.issue.totalFormatted}
            </div>
          </div>

          {/* Price Band */}
          <div style={{ opacity: n2Op, transform: `translateY(${n2Y}px)` }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: FONT.body,
                marginBottom: 8,
              }}
            >
              PRICE BAND
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: C.greenVibrant,
                fontFamily: FONT.mono,
                textShadow: `0 0 30px ${C.green}30`,
              }}
            >
              {data.issue.priceBand}
            </div>
            {/* Sketch underline */}
            <svg width={350} height={6} style={{ marginTop: 4 }}>
              <line
                x1={0}
                y1={3}
                x2={350 * Math.min(1, (f - 65) / 20)}
                y2={3}
                stroke={C.green}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={n2Op}
              />
            </svg>
          </div>

          {/* Lot size + Min investment */}
          <div style={{ display: "flex", gap: 40 }}>
            <div style={{ opacity: n2Op }}>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, fontFamily: FONT.body, marginBottom: 4 }}>
                LOT SIZE
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: FONT.mono }}>
                {data.issue.lotSize}
              </div>
            </div>
            <div style={{ opacity: n2Op }}>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, fontFamily: FONT.body, marginBottom: 4 }}>
                MIN INVESTMENT
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.cyanVibrant, fontFamily: FONT.mono }}>
                {data.issue.minInvestment}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fresh vs OFS Donut */}
        <div style={{ opacity: n3Op, transform: `scale(${n3Op * 0.2 + 0.8})` }}>
          <AnimatedDonut
            segments={[
              {
                label: "Fresh Issue",
                value: parseFloat(data.issue.freshPercent || "67"),
                color: C.blue,
                formatted: data.issue.freshFormatted,
              },
              {
                label: "OFS",
                value: parseFloat(data.issue.ofsPercent || "33"),
                color: C.yellow,
                formatted: data.issue.ofsFormatted,
              },
            ]}
            delay={Math.max(0, 130)}
            stagger={20}
            size={320}
            thickness={45}
            centerLabel="Issue Split"
            centerValue={data.issue.totalFormatted}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
