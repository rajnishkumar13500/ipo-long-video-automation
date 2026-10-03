import React from "react";
import { C, FONT } from "./Tokens";
import { useGaugeFill, useFadeIn } from "./Animations";

interface GaugeRingProps {
  value: number; // 0-100 or 0-10
  maxValue?: number;
  label: string;
  formatted: string;
  color?: string;
  delay?: number;
  size?: number;
  thickness?: number;
  subLabel?: string;
  style?: React.CSSProperties;
}

/** Circular gauge ring that fills to a target value with animated progress. */
export const GaugeRing: React.FC<GaugeRingProps> = ({
  value,
  maxValue = 100,
  label,
  formatted,
  color = C.green,
  delay = 0,
  size = 140,
  thickness = 12,
  subLabel,
  style = {},
}) => {
  const fraction = value / maxValue;
  const currentFraction = useGaugeFill(fraction, delay, 30);
  const opacity = useFadeIn(delay, 15);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const filledLength = circumference * currentFraction;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity,
        ...style,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={C.bgCardAlt}
            strokeWidth={thickness}
          />
          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness - 2}
            strokeDasharray={`${filledLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
          />
        </svg>

        {/* Center value */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: size * 0.18,
              fontWeight: 900,
              color,
              fontFamily: FONT.mono,
              textShadow: `0 0 10px ${color}40`,
            }}
          >
            {formatted}
          </div>
        </div>
      </div>

      {/* Label below */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.text,
            fontFamily: FONT.body,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
        {subLabel && (
          <div
            style={{
              fontSize: 11,
              color: C.textMuted,
              fontWeight: 500,
              fontFamily: FONT.body,
              marginTop: 2,
            }}
          >
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );
};

/** Horizontal score bar for scorecard items. */
export const ScoreBar: React.FC<{
  label: string;
  score: number;
  maxScore?: number;
  color?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ label, score, maxScore = 10, delay = 0, color = C.blue, style = {} }) => {
  const fraction = score / maxScore;
  const currentFraction = useGaugeFill(fraction, delay, 25);
  const opacity = useFadeIn(delay, 12);

  return (
    <div style={{ opacity, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: FONT.body }}>
          {label}
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: FONT.mono }}>
          {score}/{maxScore}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 14,
          background: C.bgCardAlt,
          borderRadius: 7,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            width: `${currentFraction * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            borderRadius: 7,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
};
