import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, ParticleField, AmbientSpotlight } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 28: Final CTA & Outro — Summary kinetic text, subscribe CTA, fade out. */
export const Scene28Outro: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = data.verdict;

  // Summary text typewriter
  const summaryText = v.summaryTake;
  const summaryChars = Math.min(Math.floor(Math.max(0, f - 10) * 1.8), summaryText.length);

  // CTA elements
  const ctaOp = interpolate(f, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Bell icon bounce
  const bellBounce = spring({ frame: f - 50, fps, config: { damping: 6, stiffness: 200, mass: 0.4 } });

  // Subscribe button
  const btnSlam = spring({ frame: f - 65, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } });

  // Comment prompt
  const commentOp = interpolate(f, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Fade to black at the end
  const fadeOut = interpolate(f, [430, 485], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        opacity: fadeOut,
      }}
    >
      <GrainOverlay opacity={0.03} />
      <ParticleField count={40} color={C.blue} speed={0.4} />
      <AmbientSpotlight color={C.blue} size={900} y="40%" />

      {/* Summary take */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: C.text,
          fontFamily: FONT.heading,
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.5,
          letterSpacing: "-0.01em",
          marginBottom: 50,
          minHeight: 120,
        }}
      >
        {summaryText.substring(0, summaryChars)}
        {summaryChars < summaryText.length && (
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 28,
              backgroundColor: C.cyan,
              marginLeft: 3,
              verticalAlign: "text-bottom",
              opacity: Math.round(f * 0.08) % 2 === 0 ? 1 : 0,
            }}
          />
        )}
      </div>

      {/* CTA Section */}
      <div
        style={{
          opacity: ctaOp,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Bell icon */}
        <div
          style={{
            transform: `scale(${bellBounce}) rotate(${Math.sin(f * 0.15) * 8 * bellBounce}deg)`,
            fontSize: 48,
          }}
        >
          🔔
        </div>

        {/* Subscribe button */}
        <div
          style={{
            opacity: btnSlam,
            transform: `scale(${interpolate(btnSlam, [0, 1], [1.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            background: "linear-gradient(90deg, #1E3A8A, #1D4ED8, #2563EB)",
            borderRadius: 14,
            padding: "18px 48px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: `0 8px 30px ${C.blue}40`,
            border: `2px solid ${C.blue}`,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#fff",
              fontFamily: FONT.heading,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Subscribe for Daily IPO Breakdowns
          </span>
        </div>

        {/* Comment prompt */}
        <div
          style={{
            opacity: commentOp,
            fontSize: 20,
            fontWeight: 600,
            color: C.textMuted,
            fontFamily: FONT.body,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Will you apply for <span style={{ color: C.gold, fontWeight: 800 }}>{data.companyName}</span>? 
          <span style={{ color: C.text }}> Share your strategy in the comments! 💬</span>
        </div>
      </div>

      {/* Channel branding at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          opacity: commentOp,
          fontSize: 14,
          color: C.textDim,
          fontFamily: FONT.body,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        IPO DEEP-DIVE ANALYSIS • DATA-DRIVEN DECISIONS
      </div>
    </AbsoluteFill>
  );
};
