import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "./Tokens";

interface PieSegment {
  label: string;
  value: number; // percentage 0-100
  color: string;
  formatted?: string; // e.g. "₹1,198 Cr"
}

interface AnimatedDonutProps {
  segments: PieSegment[];
  delay?: number;
  stagger?: number;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  showOuterLabels?: boolean;
  style?: React.CSSProperties;
}

/** Animated donut chart that fills segment by segment. */
export const AnimatedDonut: React.FC<AnimatedDonutProps> = ({
  segments,
  delay = 0,
  stagger = 18,
  size = 340,
  thickness = 50,
  centerLabel,
  centerValue,
  showOuterLabels = true,
  style = {},
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Calculate cumulative start angles
  let cumulativePercent = 0;
  const segmentData = segments.map((seg, idx) => {
    const startPercent = cumulativePercent;
    cumulativePercent += seg.value;
    return { ...seg, startPercent, idx };
  });

  return (
    <div style={{ position: "relative", width: size, height: size, ...style }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={C.bgCardAlt}
          strokeWidth={thickness}
        />

        {/* Animated segments */}
        {segmentData.map((seg) => {
          const segDelay = delay + seg.idx * stagger;
          const progress = spring({
            frame: f - segDelay,
            fps,
            config: { damping: 18, stiffness: 60, mass: 1.2 },
          });

          const segLength = (seg.value / 100) * circumference * progress;
          const segOffset = (seg.startPercent / 100) * circumference;

          return (
            <circle
              key={seg.idx}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness - 4}
              strokeDasharray={`${segLength} ${circumference}`}
              strokeDashoffset={-segOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{
                filter: `drop-shadow(0 0 8px ${seg.color}40)`,
              }}
            />
          );
        })}
      </svg>

      {/* Center text */}
      {(centerLabel || centerValue) && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          {centerValue && (
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: C.text,
                fontFamily: FONT.mono,
              }}
            >
              {centerValue}
            </div>
          )}
          {centerLabel && (
            <div
              style={{
                fontSize: 13,
                color: C.textMuted,
                fontWeight: 600,
                fontFamily: FONT.body,
                marginTop: 2,
              }}
            >
              {centerLabel}
            </div>
          )}
        </div>
      )}

      {/* Segment labels around the donut */}
      {showOuterLabels &&
        segmentData.map((seg) => {
          const segDelay = delay + seg.idx * stagger + 10;
        const labelOpacity = interpolate(f, [segDelay, segDelay + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const midAngle =
          ((seg.startPercent + seg.value / 2) / 100) * 360 - 90;
        const labelRadius = radius + thickness / 2 + 45;
        const lx = cx + labelRadius * Math.cos((midAngle * Math.PI) / 180);
        const ly = cy + labelRadius * Math.sin((midAngle * Math.PI) / 180);

        return (
          <div
            key={seg.idx}
            style={{
              position: "absolute",
              left: lx,
              top: ly,
              transform: "translate(-50%, -50%)",
              opacity: labelOpacity,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: seg.color,
                fontFamily: FONT.body,
              }}
            >
              {seg.label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.textMuted,
                fontWeight: 600,
                fontFamily: FONT.mono,
              }}
            >
              {seg.value}%
            </div>
            {seg.formatted && (
              <div
                style={{
                  fontSize: 13,
                  color: C.text,
                  fontWeight: 700,
                  fontFamily: FONT.mono,
                  marginTop: 2,
                }}
              >
                {seg.formatted}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
};

/** Animated split bar — horizontal bar that fills two segments from the edges. */
export const AnimatedSplitBar: React.FC<{
  leftPercent: number;
  rightPercent: number;
  leftLabel: string;
  rightLabel: string;
  leftValue: string;
  rightValue: string;
  leftColor?: string;
  rightColor?: string;
  delay?: number;
  height?: number;
}> = ({
  leftPercent,
  rightPercent,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftColor = C.blue,
  rightColor = C.yellow,
  delay = 0,
  height = 56,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: f - delay,
    fps,
    config: { damping: 16, stiffness: 70, mass: 1.0 },
  });

  const leftW = leftPercent * progress;
  const rightW = rightPercent * progress;
  const labelOpacity = interpolate(progress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div>
      {/* Labels above */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, opacity: labelOpacity }}>
        <div>
          <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600, fontFamily: FONT.body }}>{leftLabel}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: leftColor, fontFamily: FONT.mono }}>{leftValue}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600, fontFamily: FONT.body }}>{rightLabel}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: rightColor, fontFamily: FONT.mono }}>{rightValue}</div>
        </div>
      </div>

      {/* Bar */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height,
          borderRadius: height / 2,
          overflow: "hidden",
          border: `1.5px solid ${C.border}`,
          background: C.bgCardAlt,
        }}
      >
        <div
          style={{
            width: `${leftW}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${leftColor}, ${leftColor}CC)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: `2px solid ${C.bgDark}`,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: FONT.mono, opacity: labelOpacity }}>
            {Math.round(leftW)}%
          </span>
        </div>
        <div
          style={{
            width: `${rightW}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${rightColor}CC, ${rightColor})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: FONT.mono, opacity: labelOpacity }}>
            {Math.round(rightW)}%
          </span>
        </div>
      </div>
    </div>
  );
};
