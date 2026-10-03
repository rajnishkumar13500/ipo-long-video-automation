import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 08: Key Business Metrics — Three large metric cards with slam-in. */
export const Scene08BusinessMetrics: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kpis = data.businessModel.keyHighlights;

  const metricIcons = ["📱", "👥", "🏦", "📊", "⚡", "🎯"];
  const metricColors = [C.blue, C.green, C.gold, C.cyan, C.purple, C.yellow];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "0 100px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.cyan} size={900} y="40%" />

      {/* Section title */}
      <div
        style={{
          opacity: interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 16,
          fontWeight: 700,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: FONT.body,
          marginBottom: 50,
        }}
      >
        KEY OPERATIONAL METRICS
      </div>

      {/* Metric cards */}
      <div style={{ display: "flex", gap: 40, justifyContent: "center", width: "100%" }}>
        {kpis.map((kpi, idx) => {
          const cardDelay = 10 + idx * 18;
          const cardSlam = spring({
            frame: f - cardDelay,
            fps,
            config: { damping: 8, stiffness: 160, mass: 0.5 },
          });
          const cardScale = interpolate(cardSlam, [0, 1], [2.2, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const color = metricColors[idx % metricColors.length];
          const icon = metricIcons[idx % metricIcons.length];

          return (
            <div
              key={idx}
              style={{
                opacity: cardSlam,
                transform: `scale(${cardScale})`,
                flex: 1,
                maxWidth: 340,
                background: C.bgCard,
                border: `1.5px solid ${color}30`,
                borderRadius: 20,
                padding: "36px 32px",
                textAlign: "center",
                boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${color}15`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow accent */}
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 200,
                  height: 100,
                  background: `radial-gradient(ellipse, ${color}20 0%, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <div style={{ fontSize: 42, marginBottom: 16 }}>{icon}</div>

              {/* Label */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: FONT.body,
                  marginBottom: 10,
                }}
              >
                {kpi.label}
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color,
                  fontFamily: FONT.mono,
                  textShadow: `0 0 20px ${color}40`,
                  lineHeight: 1.1,
                }}
              >
                {kpi.value}
              </div>

              {/* Subtext */}
              {kpi.subtext && (
                <div
                  style={{
                    fontSize: 14,
                    color: C.textMuted,
                    fontWeight: 500,
                    fontFamily: FONT.body,
                    marginTop: 8,
                  }}
                >
                  {kpi.subtext}
                </div>
              )}

              {/* Sketch border effect */}
              <svg
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                viewBox="0 0 340 200"
                preserveAspectRatio="none"
              >
                <rect
                  x={2}
                  y={2}
                  width={336}
                  height={196}
                  rx={20}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray={1100}
                  strokeDashoffset={1100 * (1 - cardSlam)}
                  opacity={0.2}
                />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
