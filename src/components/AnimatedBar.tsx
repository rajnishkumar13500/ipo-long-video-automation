import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "./Tokens";
import { useBarGrow, useFadeIn } from "./Animations";

interface BarData {
  label: string;
  value: number;
  formatted: string;
  color?: string;
  highlight?: boolean;
  subLabel?: string;
}

interface AnimatedBarChartProps {
  bars: BarData[];
  delay?: number;
  stagger?: number;
  maxOverride?: number;
  height?: number;
  showGrowthArrows?: boolean;
  style?: React.CSSProperties;
}

/** Animated vertical bar chart where bars grow from zero with staggered timing. */
export const AnimatedBarChart: React.FC<AnimatedBarChartProps> = ({
  bars,
  delay = 0,
  stagger = 14,
  maxOverride,
  height = 380,
  showGrowthArrows = false,
  style = {},
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxVal = maxOverride || Math.max(...bars.map((b) => b.value)) * 1.15;

  return (
    <div style={{ width: "100%", ...style }}>
      {/* Chart area */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "flex-end",
          height,
          borderBottom: `2px solid ${C.borderLight}`,
          paddingBottom: 0,
          position: "relative",
        }}
      >
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((level, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: height * level,
              height: 1,
              borderTop: `1px dashed ${C.border}`,
            }}
          />
        ))}

        {bars.map((bar, idx) => {
          const itemDelay = delay + idx * stagger;
          const grow = spring({
            frame: f - itemDelay,
            fps,
            config: { damping: 14, stiffness: 80, mass: 1.0 },
          });
          const barHeight = (bar.value / maxVal) * (height - 50) * grow;
          const labelOpacity = interpolate(grow, [0.5, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isLast = idx === bars.length - 1;
          const barColor = bar.color || (bar.highlight || isLast ? C.blue : C.borderLight);
          const isHighlighted = bar.highlight || isLast;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: `${80 / bars.length}%`,
                maxWidth: 200,
                position: "relative",
              }}
            >
              {/* Value label above bar */}
              <div
                style={{
                  marginBottom: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: labelOpacity,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: isHighlighted ? C.cyanVibrant : C.text,
                    fontFamily: FONT.mono,
                    textShadow: isHighlighted ? `0 0 20px ${C.cyan}60` : "none",
                  }}
                >
                  {bar.formatted}
                </span>
                {bar.subLabel && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.green,
                      background: `${C.green}1A`,
                      padding: "2px 10px",
                      borderRadius: 4,
                      marginTop: 4,
                    }}
                  >
                    {bar.subLabel}
                  </span>
                )}
              </div>

              {/* Bar pillar */}
              <div
                style={{
                  width: "65%",
                  maxWidth: 100,
                  height: Math.max(8, barHeight),
                  background: isHighlighted
                    ? `linear-gradient(180deg, ${barColor}, ${C.blueDark})`
                    : `linear-gradient(180deg, ${C.bgCardAlt}, ${C.bgCard})`,
                  borderRadius: "10px 10px 0 0",
                  boxShadow: isHighlighted ? `0 0 30px ${barColor}50` : "none",
                  border: isHighlighted
                    ? `1.5px solid ${C.cyanVibrant}`
                    : `1px solid ${C.borderLight}`,
                  transition: "height 0.3s ease-out",
                }}
              />

              {/* Year label */}
              <div style={{ marginTop: 12 }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: isHighlighted ? 800 : 600,
                    color: isHighlighted ? C.text : C.textMuted,
                    fontFamily: FONT.body,
                  }}
                >
                  {bar.label}
                </span>
              </div>

              {/* Growth arrow between bars */}
              {showGrowthArrows && idx < bars.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    right: "-30%",
                    top: "30%",
                    opacity: labelOpacity,
                    color: C.green,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: FONT.mono,
                  }}
                >
                  {bars[idx + 1] && bars[idx].value > 0
                    ? `+${Math.round(((bars[idx + 1].value - bars[idx].value) / bars[idx].value) * 100)}%`
                    : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Single horizontal bar that grows from left to right. */
export const AnimatedHBar: React.FC<{
  width: number; // 0-100 percentage
  color: string;
  delay?: number;
  height?: number;
  label?: string;
  valueLabel?: string;
  highlighted?: boolean;
  style?: React.CSSProperties;
}> = ({ width, color, delay = 0, height = 36, label, valueLabel, highlighted = false, style = {} }) => {
  const grow = useBarGrow(delay, 25);
  const opacity = useFadeIn(delay, 15);
  const currentWidth = width * grow;

  return (
    <div style={{ opacity, ...style }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 15, color: C.text, fontWeight: 600, fontFamily: FONT.body }}>
            {label}
          </span>
          {valueLabel && (
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: highlighted ? color : C.textMuted,
                fontFamily: FONT.mono,
              }}
            >
              {valueLabel}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height,
          background: C.bgCardAlt,
          borderRadius: height / 2,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            width: `${currentWidth}%`,
            height: "100%",
            background: highlighted
              ? `linear-gradient(90deg, ${color}, ${color}CC)`
              : `linear-gradient(90deg, ${color}80, ${color}40)`,
            borderRadius: height / 2,
            boxShadow: highlighted ? `0 0 20px ${color}40` : "none",
          }}
        />
      </div>
    </div>
  );
};
