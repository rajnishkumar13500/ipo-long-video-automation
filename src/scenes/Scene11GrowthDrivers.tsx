import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 11: Growth Drivers — Three drivers as sequential slide-in panels. */
export const Scene11GrowthDrivers: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drivers = data.industryContext.drivers;

  const driverIcons = ["📱", "📋", "📊", "🔄", "⚡"];
  const driverColors = [C.blue, C.cyan, C.green, C.yellow, C.purple];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "0 80px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.yellow} size={800} x="60%" y="40%" />

      {/* Section title */}
      <div
        style={{
          opacity: interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 36,
          fontWeight: 800,
          color: C.text,
          fontFamily: FONT.heading,
          letterSpacing: "-0.02em",
          marginBottom: 10,
        }}
      >
        Structural Growth Drivers
      </div>
      <div
        style={{
          opacity: interpolate(f, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 16,
          color: C.textMuted,
          fontWeight: 500,
          fontFamily: FONT.body,
          marginBottom: 50,
        }}
      >
        What's fueling the sector's explosive growth
      </div>

      {/* Driver panels — slide in from right */}
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 22 }}>
        {drivers.map((driver, idx) => {
          const panelDelay = 15 + idx * 40;
          const slideProgress = spring({
            frame: f - panelDelay,
            fps,
            config: { damping: 18, stiffness: 65, mass: 1.0 },
          });
          const slideX = interpolate(slideProgress, [0, 1], [180, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const color = driverColors[idx % driverColors.length];
          const icon = driverIcons[idx % driverIcons.length];

          return (
            <div
              key={idx}
              style={{
                opacity: slideProgress,
                transform: `translateX(${slideX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
                background: C.bgCard,
                border: `1.5px solid ${color}50`,
                borderRadius: 18,
                padding: "26px 32px",
                boxShadow: `0 8px 30px rgba(0,0,0,0.35), 0 0 20px ${color}15`,
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${color}18`,
                  border: `1.5px solid ${color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 28 }}>{icon}</span>
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color,
                      fontFamily: FONT.mono,
                      opacity: 0.7,
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: FONT.heading,
                    }}
                  >
                    {driver.title}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: C.textMuted,
                    fontWeight: 500,
                    fontFamily: FONT.body,
                    lineHeight: 1.5,
                  }}
                >
                  {driver.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
