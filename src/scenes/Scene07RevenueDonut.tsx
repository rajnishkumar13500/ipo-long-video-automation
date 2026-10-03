import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { AnimatedDonut } from "../components/AnimatedPie";
import { IPOData } from "../types/ipo";

/** Scene 07: Revenue Segment Donut — Full-screen animated donut chart. */
export const Scene07RevenueDonut: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const segments = data.businessModel.segments;

  const segmentColors = [C.blue, C.cyan, C.yellow, C.purple, C.green];

  // Title reveal
  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "0 80px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.blue} size={800} x="30%" y="50%" />

      <div style={{ display: "flex", alignItems: "center", gap: 80, width: "100%" }}>
        {/* Left: Donut */}
        <AnimatedDonut
          segments={segments.map((seg, i) => ({
            label: seg.name,
            value: seg.sharePercent,
            color: segmentColors[i % segmentColors.length],
            formatted: seg.amountFormatted || "",
          }))}
          delay={15}
          stagger={22}
          size={400}
          thickness={55}
          centerLabel="Revenue Split"
          centerValue="100%"
          showOuterLabels={false}
        />

        {/* Right: Segment details */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              opacity: titleOp,
              fontSize: 36,
              fontWeight: 800,
              color: C.text,
              fontFamily: FONT.heading,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Revenue Breakdown
          </div>
          <div
            style={{
              opacity: titleOp,
              fontSize: 16,
              color: C.textMuted,
              fontWeight: 500,
              fontFamily: FONT.body,
              marginBottom: 32,
            }}
          >
            Share of total top-line by division
          </div>

          {segments.map((seg, idx) => {
            const itemDelay = 20 + idx * 22;
            const itemOp = interpolate(f, [itemDelay, itemDelay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemY = interpolate(f, [itemDelay, itemDelay + 15], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const segColor = segmentColors[idx % segmentColors.length];

            return (
              <div
                key={idx}
                style={{
                  opacity: itemOp,
                  transform: `translateY(${itemY}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                  padding: "16px 22px",
                  background: `${segColor}0A`,
                  border: `1px solid ${segColor}25`,
                  borderRadius: 14,
                }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: segColor,
                    boxShadow: `0 0 8px ${segColor}60`,
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: FONT.body }}>
                      {seg.name}
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: segColor, fontFamily: FONT.mono }}>
                      {seg.sharePercent}%
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body, marginTop: 3 }}>
                    {seg.description}
                  </div>
                  {seg.amountFormatted && (
                    <div style={{ fontSize: 15, fontWeight: 700, color: segColor, fontFamily: FONT.mono, marginTop: 4 }}>
                      {seg.amountFormatted}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
