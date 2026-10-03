import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { AnimatedBarChart } from "../components/AnimatedBar";
import { useCameraShake } from "../components/Animations";
import { IPOData } from "../types/ipo";

/** Scene 14: Revenue Growth Chart — Animated bar chart with growth arrows. */
export const Scene14RevenueChart: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fin = data.financials;

  // Title reveal
  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CAGR badge slam (after bars grow)
  const cagrSlam = spring({ frame: f - 80, fps, config: { damping: 7, stiffness: 180, mass: 0.5 } });
  const cagrScale = interpolate(cagrSlam, [0, 1], [2.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = useCameraShake(80, 10, 4);

  const bars = fin.years.map((year, idx) => ({
    label: year,
    value: fin.revenue.rawCr[idx],
    formatted: fin.revenue.valuesFormatted[idx],
    subLabel: `EBITDA: ${fin.ebitda.marginsPercent[idx]}`,
    highlight: idx === 2,
  }));

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "60px 100px",
        transform: `translate(${shake.x}px, ${shake.y}px)`,
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.green} size={900} y="45%" />

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 1100, marginBottom: 30 }}>
        <div
          style={{
            opacity: titleOp,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: FONT.heading, letterSpacing: "-0.02em" }}>
              Revenue Growth Story
            </div>
            <div style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, fontFamily: FONT.body, marginTop: 4 }}>
              3-Year historical revenue trajectory with operating margins
            </div>
          </div>

          {/* CAGR badge */}
          <div
            style={{
              opacity: cagrSlam,
              transform: `scale(${cagrScale})`,
              background: `${C.green}18`,
              border: `2px solid ${C.green}50`,
              borderRadius: 14,
              padding: "12px 28px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>🚀</span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: C.greenVibrant,
                fontFamily: FONT.mono,
                textShadow: `0 0 15px ${C.green}40`,
              }}
            >
              {fin.revenue.cagr}
            </span>
          </div>
        </div>
      </div>

      {/* Animated bar chart */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: C.bgCard,
          border: `1.5px solid ${C.borderLight}`,
          borderRadius: 20,
          padding: "32px 40px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <AnimatedBarChart
          bars={bars}
          delay={18}
          stagger={18}
          height={380}
          showGrowthArrows={true}
        />
      </div>
    </AbsoluteFill>
  );
};
