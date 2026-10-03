import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { AnimatedSplitBar } from "../components/AnimatedPie";
import { IPOData } from "../types/ipo";

/** Scene 18: Issue Split — Fresh vs OFS animated split bar + key parameters. */
export const Scene18IssueSplit: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const issue = data.issue;

  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Parameters reveal
  const params = [
    { label: "PRICE BAND", value: issue.priceBand, color: C.green, icon: "💰" },
    { label: "LOT SIZE", value: issue.lotSize, color: C.text, icon: "📦" },
    { label: "MIN INVESTMENT", value: issue.minInvestment, color: C.gold, icon: "🎯" },
  ];

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
      <AmbientSpotlight color={C.blue} size={900} y="40%" />

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 1000, marginBottom: 40, opacity: titleOp }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: FONT.heading, letterSpacing: "-0.02em" }}>
          Issue Structure & Capital Split
        </div>
        <div style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, fontFamily: FONT.body, marginTop: 6 }}>
          Where your investment capital gets deployed
        </div>
      </div>

      {/* Total issue amount */}
      <div
        style={{
          opacity: interpolate(f, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${spring({ frame: f - 8, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } })})`,
          fontSize: 64,
          fontWeight: 900,
          color: C.gold,
          fontFamily: FONT.mono,
          textShadow: `0 0 40px ${C.gold}40`,
          marginBottom: 30,
        }}
      >
        {issue.totalFormatted}
      </div>

      {/* Split bar */}
      <div style={{ width: "100%", maxWidth: 1000, marginBottom: 40 }}>
        <AnimatedSplitBar
          leftPercent={parseFloat(issue.freshPercent || "67")}
          rightPercent={parseFloat(issue.ofsPercent || "33")}
          leftLabel="Fresh Issue"
          rightLabel="Offer for Sale"
          leftValue={issue.freshFormatted}
          rightValue={issue.ofsFormatted}
          leftColor={C.blue}
          rightColor={C.yellow}
          delay={25}
          height={52}
        />
      </div>

      {/* Key parameters */}
      <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
        {params.map((param, idx) => {
          const pDelay = 60 + idx * 14;
          const pOp = interpolate(f, [pDelay, pDelay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const pY = interpolate(f, [pDelay, pDelay + 12], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={idx}
              style={{
                opacity: pOp,
                transform: `translateY(${pY}px)`,
                background: C.bgCard,
                border: `1.5px solid ${C.borderLight}`,
                borderRadius: 16,
                padding: "20px 28px",
                textAlign: "center",
                minWidth: 200,
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{param.icon}</div>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, fontFamily: FONT.body, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {param.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: param.color, fontFamily: FONT.mono, marginTop: 6 }}>
                {param.value}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
