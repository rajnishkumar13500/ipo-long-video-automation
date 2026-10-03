import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./Tokens";
import { Card, Text } from "./Primitives";

interface MultiYearChartProps {
  years: [string, string, string];
  revenueValues: [string, string, string];
  revenueRawCr: [number, number, number];
  cagr: string;
  ebitdaMargins: [string, string, string];
  patValues: [string, string, string];
  delay?: number;
}

export const MultiYearChart: React.FC<MultiYearChartProps> = ({
  years,
  revenueValues,
  revenueRawCr,
  cagr,
  ebitdaMargins,
  patValues,
  delay = 20,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxRev = Math.max(...revenueRawCr) * 1.15;
  const chartHeight = 320;

  return (
    <Card style={{ flex: 1, padding: "28px 32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Text size={22} weight={700}>
            Historical Revenue & Profitability (3-Year Trend)
          </Text>
          <Text size={14} color={C.textMuted} weight={500} style={{ marginTop: 4 }}>
            Revenue scale vs EBITDA operating margins & net profit
          </Text>
        </div>
        <div
          style={{
            background: `${C.green}20`,
            border: `1.5px solid ${C.green}4D`,
            borderRadius: 8,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>🚀</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.green }}>
            {cagr}
          </span>
        </div>
      </div>

      {/* Chart Bars Grid */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
          height: chartHeight,
          borderBottom: `2px solid ${C.borderLight}`,
          paddingBottom: 16,
          position: "relative",
        }}
      >
        {/* Subtle horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 16 + chartHeight * level,
              height: 1,
              background: "rgba(255, 255, 255, 0.05)",
              borderTop: "1px dashed rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}

        {years.map((year, idx) => {
          const itemDelay = delay + idx * 12;
          const animSpring = spring({
            frame: f - itemDelay,
            fps,
            config: { damping: 14, stiffness: 90, mass: 0.8 },
          });
          const scale = interpolate(animSpring, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const barHeight = (revenueRawCr[idx] / maxRev) * (chartHeight - 40) * scale;
          const isCurrentYear = idx === years.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 180,
                position: "relative",
              }}
            >
              {/* Value labels on top of bar */}
              <div
                style={{
                  marginBottom: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: scale,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: isCurrentYear ? C.cyan : C.text,
                  }}
                >
                  {revenueValues[idx]}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.green,
                    background: `${C.green}1A`,
                    padding: "2px 8px",
                    borderRadius: 4,
                    marginTop: 3,
                  }}
                >
                  EBITDA: {ebitdaMargins[idx]}
                </span>
              </div>

              {/* Bar pillar */}
              <div
                style={{
                  width: 90,
                  height: Math.max(12, barHeight),
                  background: isCurrentYear
                    ? `linear-gradient(180deg, ${C.blue}, #1E40AF)`
                    : `linear-gradient(180deg, ${C.borderLight}, #1E293B)`,
                  borderRadius: "10px 10px 0 0",
                  boxShadow: isCurrentYear
                    ? `0 0 25px ${C.blue}66`
                    : "none",
                  border: isCurrentYear
                    ? `1.5px solid ${C.cyan}`
                    : `1px solid ${C.borderLight}`,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  PAT: {patValues[idx]}
                </span>
              </div>

              {/* Year label underneath */}
              <div style={{ marginTop: 12 }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: isCurrentYear ? 800 : 600,
                    color: isCurrentYear ? C.text : C.textMuted,
                  }}
                >
                  {year}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
