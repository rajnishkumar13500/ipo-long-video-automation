import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { AnimatedHBar } from "../components/AnimatedBar";
import { IPOData } from "../types/ipo";

/** Scene 19: Objects of Issue — Animated waterfall bars showing where money goes. */
export const Scene19ObjectsOfIssue: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const issue = data.issue;
  const objects = issue.objectsOfIssue || [];

  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const barColors = [C.blue, C.cyan, C.textDim];

  // Annotation typewriter
  const annotText = "Substantial fresh issue ratio = Clear growth intent, not promoter exit.";
  const annotChars = Math.min(Math.floor(Math.max(0, f - 120) * 1.5), annotText.length);

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
      <AmbientSpotlight color={C.blue} size={800} y="40%" />

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 1000, marginBottom: 40, opacity: titleOp }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: FONT.heading, letterSpacing: "-0.02em" }}>
          Where Your Money Goes
        </div>
        <div style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, fontFamily: FONT.body, marginTop: 6 }}>
          Objects of the fresh issue — capital deployment plan
        </div>
      </div>

      {/* Waterfall bars */}
      <div style={{ width: "100%", maxWidth: 1000, display: "flex", flexDirection: "column", gap: 28 }}>
        {objects.map((obj, idx) => {
          const barDelay = 15 + idx * 25;
          const barColor = barColors[idx % barColors.length];
          const pct = parseFloat(obj.percentage) || 0;

          return (
            <div key={idx}>
              <AnimatedHBar
                width={pct}
                color={barColor}
                delay={barDelay}
                height={44}
                label={obj.purpose}
                valueLabel={`${obj.amountFormatted} (${obj.percentage})`}
                highlighted={idx === 0}
              />
            </div>
          );
        })}
      </div>

      {/* Handwritten annotation */}
      <div
        style={{
          marginTop: 40,
          fontSize: 22,
          fontWeight: 700,
          color: C.sketch,
          fontFamily: "'Caveat', cursive, " + FONT.body,
          fontStyle: "italic",
          textAlign: "center",
          maxWidth: 700,
          textShadow: `0 0 15px ${C.green}15`,
        }}
      >
        {annotText.substring(0, annotChars)}
      </div>
    </AbsoluteFill>
  );
};
