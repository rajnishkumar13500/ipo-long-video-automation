import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 06: Business Story — Headline, description, and key term highlights. */
export const Scene06BusinessStory: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bm = data.businessModel;

  // Headline reveal
  const headlineOp = interpolate(f, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineY = interpolate(f, [5, 25], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Description typewriter
  const descText = bm.description;
  const descChars = Math.min(Math.floor(Math.max(0, f - 25) * 2.0), descText.length);

  // Icon sketches
  const icon1 = spring({ frame: f - 60, fps, config: { damping: 10, stiffness: 150 } });
  const icon2 = spring({ frame: f - 80, fps, config: { damping: 10, stiffness: 150 } });
  const icon3 = spring({ frame: f - 100, fps, config: { damping: 10, stiffness: 150 } });

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
      <AmbientSpotlight color={C.cyan} size={900} y="35%" />

      <div style={{ maxWidth: 1200, width: "100%" }}>
        {/* Headline */}
        <div
          style={{
            opacity: headlineOp,
            transform: `translateY(${headlineY}px)`,
            fontSize: 44,
            fontWeight: 900,
            color: C.cyanVibrant,
            fontFamily: FONT.heading,
            letterSpacing: "-0.02em",
            marginBottom: 24,
            textShadow: `0 0 30px ${C.cyan}30`,
            lineHeight: 1.2,
          }}
        >
          {bm.headline}
        </div>

        {/* Description with typewriter */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: C.text,
            fontFamily: FONT.body,
            lineHeight: 1.6,
            maxWidth: 900,
            marginBottom: 50,
          }}
        >
          {descText.substring(0, descChars)}
          {descChars < descText.length && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 20,
                backgroundColor: C.cyan,
                marginLeft: 2,
                verticalAlign: "text-bottom",
                opacity: Math.round(f * 0.08) % 2 === 0 ? 1 : 0,
              }}
            />
          )}
        </div>

        {/* Sketched icon cards */}
        <div style={{ display: "flex", gap: 36, justifyContent: "flex-start" }}>
          {[
            { icon: "📱", label: "Mobile Platform", scale: icon1, color: C.blue },
            { icon: "💳", label: "Digital Credit", scale: icon2, color: C.green },
            { icon: "🤖", label: "AI Underwriting", scale: icon3, color: C.purple },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                opacity: item.scale,
                transform: `scale(${item.scale}) translateY(${(1 - item.scale) * 20}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: `${item.color}12`,
                border: `1.5px solid ${item.color}35`,
                borderRadius: 14,
                padding: "14px 24px",
              }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: item.color,
                  fontFamily: FONT.body,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
