import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight, ParticleField } from "../components/GrainOverlay";
import { AnimatedLineChart } from "../components/AnimatedLine";
import { IPOData } from "../types/ipo";

/** Scene 15: Profitability Turnaround Arc — Line chart crossing zero with celebration. */
export const Scene15ProfitArc: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const fin = data.financials;

  // Parse PAT values to numbers
  const patValues = fin.pat.valuesFormatted.map((v) => {
    const cleaned = v.replace("₹", "").replace(",", "").replace(" Cr", "").trim();
    return parseFloat(cleaned);
  });

  // Title reveal
  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Annotation for zero-crossing celebration
  const celebrationOp = interpolate(f, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Handwritten annotation
  const annotText = "Loss to Profit in just 2 years!";
  const annotChars = Math.min(Math.floor(Math.max(0, f - 80) * 1.5), annotText.length);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "60px 100px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.green} size={900} y="45%" />

      {/* Celebration particles appear after zero-crossing */}
      {celebrationOp > 0.5 && (
        <ParticleField count={50} color={C.greenVibrant} speed={0.8} />
      )}

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 1100, marginBottom: 20 }}>
        <div style={{ opacity: titleOp }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: FONT.heading, letterSpacing: "-0.02em" }}>
            Profitability Turnaround
          </div>
          <div style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, fontFamily: FONT.body, marginTop: 4 }}>
            Net Profit (PAT) trajectory — from losses to consistent profits
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div
        style={{
          background: C.bgCard,
          border: `1.5px solid ${C.borderLight}`,
          borderRadius: 20,
          padding: "32px 50px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <AnimatedLineChart
          points={fin.years.map((year, idx) => ({
            label: year,
            value: patValues[idx],
            formatted: fin.pat.valuesFormatted[idx],
          }))}
          delay={15}
          color={C.greenVibrant}
          negativeColor={C.coral}
          height={350}
          width={900}
          showZeroLine={true}
          zeroLineLabel="₹0 Cr"
          annotations={[
            { index: 0, text: "Loss-making", color: C.coral },
          ]}
        />
      </div>

      {/* EBITDA margins strip */}
      <div
        style={{
          display: "flex",
          gap: 30,
          marginTop: 24,
          opacity: interpolate(f, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {fin.years.map((year, idx) => (
          <div
            key={idx}
            style={{
              background: `${C.green}12`,
              border: `1px solid ${C.green}30`,
              borderRadius: 10,
              padding: "8px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, fontFamily: FONT.body }}>{year} EBITDA Margin</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: FONT.mono, marginTop: 2 }}>
              {fin.ebitda.marginsPercent[idx]}
            </div>
          </div>
        ))}
      </div>

      {/* Handwritten annotation */}
      <div
        style={{
          marginTop: 24,
          fontSize: 26,
          fontWeight: 700,
          color: C.sketch,
          fontFamily: "'Caveat', cursive, " + FONT.body,
          fontStyle: "italic",
          textShadow: `0 0 20px ${C.green}20`,
        }}
      >
        {annotText.substring(0, annotChars)}
      </div>
    </AbsoluteFill>
  );
};
