import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "./Tokens";

interface LinePoint {
  label: string;
  value: number;
  formatted: string;
}

interface AnimatedLineChartProps {
  points: LinePoint[];
  delay?: number;
  color?: string;
  negativeColor?: string;
  height?: number;
  width?: number;
  showZeroLine?: boolean;
  zeroLineLabel?: string;
  annotations?: Array<{ index: number; text: string; color?: string }>;
  style?: React.CSSProperties;
}

/** Animated line chart that draws itself point to point with value labels. */
export const AnimatedLineChart: React.FC<AnimatedLineChartProps> = ({
  points,
  delay = 0,
  color = C.green,
  negativeColor = C.red,
  height = 320,
  width = 800,
  showZeroLine = true,
  zeroLineLabel,
  annotations = [],
  style = {},
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const padding = { top: 60, bottom: 65, left: 70, right: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Map value to Y coordinate (inverted: higher value = lower y)
  const valToY = (v: number) => {
    return padding.top + chartH - ((v - minVal) / range) * chartH;
  };
  const zeroY = valToY(0);

  // Calculate point positions
  const pointPositions = points.map((p, i) => ({
    x: padding.left + (i / (points.length - 1)) * chartW,
    y: valToY(p.value),
    ...p,
  }));

  // Build SVG path
  const pathD = pointPositions
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Animation progress
  const progress = spring({
    frame: f - delay,
    fps,
    config: { damping: 20, stiffness: 50, mass: 1.5 },
  });

  // Estimate path length for dash animation
  const pathLength = pointPositions.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = pointPositions[i - 1];
    return sum + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }, 0);

  const dashOffset = pathLength * (1 - progress);

  return (
    <div style={{ position: "relative", width, height, ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Zero line */}
        {showZeroLine && minVal < 0 && (
          <>
            <line
              x1={padding.left}
              y1={zeroY}
              x2={width - padding.right}
              y2={zeroY}
              stroke={C.textDim}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.6}
            />
            {zeroLineLabel && (
              <text
                x={width - padding.right + 10}
                y={zeroY + 4}
                fill={C.textMuted}
                fontSize={12}
                fontFamily={FONT.mono}
                textAnchor="start"
              >
                {zeroLineLabel}
              </text>
            )}
          </>
        )}

        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Area fill (only for positive region) */}
        {progress > 0.3 && (
          <path
            d={`${pathD} L ${pointPositions[pointPositions.length - 1].x} ${zeroY} L ${pointPositions[0].x} ${zeroY} Z`}
            fill="url(#lineGrad)"
            opacity={interpolate(progress, [0.3, 0.8], [0, 0.6], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        )}

        {/* Main line — draws itself */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />

        {/* Data points */}
        {pointPositions.map((p, i) => {
          const pointDelay = delay + 8 + i * 10;
          const pointProgress = spring({
            frame: f - pointDelay,
            fps,
            config: { damping: 10, stiffness: 200, mass: 0.5 },
          });
          const dotColor = p.value < 0 ? negativeColor : color;

          return (
            <g key={i}>
              {/* Glow ring */}
              <circle
                cx={p.x}
                cy={p.y}
                r={12 * pointProgress}
                fill={`${dotColor}15`}
                stroke={`${dotColor}40`}
                strokeWidth={1}
              />
              {/* Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={6 * pointProgress}
                fill={dotColor}
                style={{ filter: `drop-shadow(0 0 6px ${dotColor}80)` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Value labels above points */}
      {pointPositions.map((p, i) => {
        const labelDelay = delay + 12 + i * 10;
        const labelOp = interpolate(f, [labelDelay, labelDelay + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const dotColor = p.value < 0 ? negativeColor : color;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y - 38,
              transform: "translateX(-50%)",
              opacity: labelOp,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: dotColor,
                fontFamily: FONT.mono,
                textShadow: `0 0 10px ${dotColor}40`,
                whiteSpace: "nowrap",
              }}
            >
              {p.formatted}
            </span>
          </div>
        );
      })}

      {/* X-axis labels */}
      {pointPositions.map((p, i) => (
        <div
          key={`label-${i}`}
          style={{
            position: "absolute",
            left: p.x,
            bottom: 15,
            transform: "translateX(-50%)",
            fontSize: 14,
            fontWeight: 600,
            color: i === points.length - 1 ? C.text : C.textMuted,
            fontFamily: FONT.body,
          }}
        >
          {p.label}
        </div>
      ))}

      {/* Annotations */}
      {annotations.map((ann, i) => {
        const point = pointPositions[ann.index];
        if (!point) return null;
        const annDelay = delay + 25 + ann.index * 8;
        const annOp = interpolate(f, [annDelay, annDelay + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const isNegative = point.value < 0;
        const annTop = isNegative ? point.y - 58 : point.y + 20;

        return (
          <div
            key={`ann-${i}`}
            style={{
              position: "absolute",
              left: point.x,
              top: annTop,
              transform: "translateX(-50%)",
              opacity: annOp,
              fontSize: 13,
              fontWeight: 700,
              color: ann.color || C.sketch,
              fontStyle: "italic",
              fontFamily: "'Caveat', cursive, " + FONT.body,
              whiteSpace: "nowrap",
            }}
          >
            {ann.text}
          </div>
        );
      })}
    </div>
  );
};
