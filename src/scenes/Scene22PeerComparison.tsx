import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { AnimatedHBar } from "../components/AnimatedBar";
import { IPOData } from "../types/ipo";

/** Scene 22: Peer Comparison — Horizontal bar race chart + table. */
export const Scene22PeerComparison: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const peers = data.peers;

  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Find max P/E for scaling
  const peValues = peers.table.map((r) => parseFloat(r.peRatio) || 0);
  const maxPe = Math.max(...peValues) * 1.15;

  // Industry average line
  const avgPe = parseFloat(peers.industryAveragePe) || 34;
  const avgLineOp = interpolate(f, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Discount badge
  const discountSlam = spring({ frame: f - 120, fps, config: { damping: 8, stiffness: 160, mass: 0.5 } });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "50px 100px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.purple} size={800} y="40%" />

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 1100, marginBottom: 30, opacity: titleOp }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: FONT.heading, letterSpacing: "-0.02em" }}>
          P/E Valuation Comparison
        </div>
        <div style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, fontFamily: FONT.body, marginTop: 4 }}>
          Benchmarking against listed market peers
        </div>
      </div>

      {/* Bar race chart */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: C.bgCard,
          border: `1.5px solid ${C.borderLight}`,
          borderRadius: 20,
          padding: "28px 36px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        {/* Peer bars container */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Industry average line */}
          <div
            style={{
              position: "absolute",
              left: `${(avgPe / maxPe) * 100}%`,
              top: -8,
              bottom: -8,
              width: 2,
              borderLeft: `2px dashed ${C.textDim}`,
              opacity: avgLineOp,
              zIndex: 10,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 8,
                fontSize: 12,
                fontWeight: 700,
                color: C.yellow,
                fontFamily: FONT.mono,
                whiteSpace: "nowrap",
              }}
            >
              Industry Avg: {peers.industryAveragePe}
            </div>
          </div>
          {peers.table.map((row, idx) => {
            const barDelay = 15 + idx * 16;
            const peVal = parseFloat(row.peRatio) || 0;
            const widthPct = (peVal / maxPe) * 100;
            const isTarget = row.isTargetCompany;

            return (
              <div key={idx}>
                <AnimatedHBar
                  width={widthPct}
                  color={isTarget ? C.greenVibrant : C.purple}
                  delay={barDelay}
                  height={38}
                  label={row.name}
                  valueLabel={row.peRatio}
                  highlighted={isTarget}
                />

                {/* Additional metrics below bar */}
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 4,
                    marginLeft: 4,
                    opacity: interpolate(f, [barDelay + 10, barDelay + 20], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  <span style={{ fontSize: 12, color: C.textDim, fontFamily: FONT.mono }}>
                    Rev: {row.revenueFormatted}
                  </span>
                  <span style={{ fontSize: 12, color: C.textDim, fontFamily: FONT.mono }}>
                    PAT: {row.patFormatted}
                  </span>
                  <span style={{ fontSize: 12, color: C.textDim, fontFamily: FONT.mono }}>
                    RoNW: {row.ronwFormatted}
                  </span>
                  {row.pbRatio && (
                    <span style={{ fontSize: 12, color: C.textDim, fontFamily: FONT.mono }}>
                      P/B: {row.pbRatio}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discount badge */}
      <div
        style={{
          marginTop: 24,
          opacity: discountSlam,
          transform: `scale(${interpolate(discountSlam, [0, 1], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          background: `${C.green}18`,
          border: `2px solid ${C.green}50`,
          borderRadius: 14,
          padding: "14px 30px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>✅</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.greenVibrant, fontFamily: FONT.body }}>
          {peers.commentary}
        </span>
      </div>
    </AbsoluteFill>
  );
};
