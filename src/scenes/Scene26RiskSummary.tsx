import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { GaugeRing } from "../components/GaugeRing";
import { IPOData } from "../types/ipo";

/** Scene 26: Risk Summary — Overall risk gauge + NPA check + summary. */
export const Scene26RiskSummary: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const risks = data.risks;

  const riskLevelValue = risks.overallRiskLevel === "High" ? 85 : risks.overallRiskLevel === "Moderate" ? 55 : 25;
  const riskColor = risks.overallRiskLevel === "High" ? C.coral : risks.overallRiskLevel === "Moderate" ? C.yellow : C.green;

  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // NPA stat
  const npaOp = interpolate(f, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Summary annotation
  const summaryOp = interpolate(f, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
      <AmbientSpotlight color={riskColor} size={800} y="45%" />

      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          fontSize: 16,
          fontWeight: 700,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: FONT.body,
          marginBottom: 40,
        }}
      >
        📊 OVERALL RISK ASSESSMENT
      </div>

      {/* Risk gauge */}
      <GaugeRing
        value={riskLevelValue}
        maxValue={100}
        label="Overall Risk Level"
        formatted={risks.overallRiskLevel}
        color={riskColor}
        delay={10}
        size={220}
        thickness={18}
        subLabel={`${risks.items.length} risk factors identified`}
      />

      {/* NPA check */}
      <div
        style={{
          marginTop: 40,
          opacity: npaOp,
          transform: `translateY(${(1 - npaOp) * 15}px)`,
          display: "flex",
          gap: 30,
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: `${C.green}15`,
            border: `1.5px solid ${C.green}40`,
            borderRadius: 14,
            padding: "16px 28px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, fontFamily: FONT.body, textTransform: "uppercase" }}>
            Gross NPA Status
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.greenVibrant, fontFamily: FONT.mono, marginTop: 4 }}>
            Controlled
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body, marginTop: 4 }}>
            Currently within safe limits
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div
        style={{
          marginTop: 36,
          opacity: summaryOp,
          fontSize: 18,
          fontWeight: 500,
          color: C.text,
          fontFamily: FONT.body,
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.6,
          padding: "18px 28px",
          background: `${riskColor}08`,
          border: `1px solid ${riskColor}20`,
          borderRadius: 14,
        }}
      >
        {risks.bottomNote}
      </div>
    </AbsoluteFill>
  );
};
