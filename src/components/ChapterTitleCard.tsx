import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "./Tokens";
import { useSketchDraw } from "./Animations";

interface ChapterTitleCardProps {
  chapterNumber: number;
  totalChapters?: number;
  title: string;
  subtitle?: string;
  color?: string;
  icon?: string;
}

/** Full-screen cinematic chapter title card with ink-splash reveal. */
export const ChapterTitleCard: React.FC<ChapterTitleCardProps> = ({
  chapterNumber,
  totalChapters = 8,
  title,
  subtitle,
  color = C.blue,
  icon,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ink splash expansion
  const splashScale = spring({
    frame: f,
    fps,
    config: { damping: 20, stiffness: 60, mass: 1.5 },
  });

  // Chapter number reveal
  const numOpacity = interpolate(f, [8, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const numScale = spring({
    frame: f - 5,
    fps,
    config: { damping: 8, stiffness: 150, mass: 0.5 },
  });

  // Title text reveal
  const titleOpacity = interpolate(f, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(f, [18, 35], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle reveal
  const subOpacity = interpolate(f, [30, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative sketch lines
  const lineProgress = useSketchDraw(20, 30);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Ink splash background */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          transform: `scale(${splashScale * 3})`,
        }}
      />

      {/* Chapter number */}
      <div
        style={{
          opacity: numOpacity,
          transform: `scale(${numScale})`,
          fontSize: 18,
          fontWeight: 700,
          color,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: FONT.body,
          marginBottom: 16,
        }}
      >
        {icon && <span style={{ marginRight: 8, fontSize: 22 }}>{icon}</span>}
        CHAPTER {String(chapterNumber).padStart(2, "0")} / {String(totalChapters).padStart(2, "0")}
      </div>

      {/* Decorative line */}
      <svg width={200} height={4} style={{ marginBottom: 20, opacity: numOpacity }}>
        <line
          x1={100 - 100 * lineProgress}
          y1={2}
          x2={100 + 100 * lineProgress}
          y2={2}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>

      {/* Main title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 56,
          fontWeight: 900,
          color: C.text,
          textAlign: "center",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          fontFamily: FONT.heading,
          maxWidth: 1000,
          textShadow: `0 0 40px ${color}30`,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            opacity: subOpacity,
            fontSize: 22,
            fontWeight: 500,
            color: C.textMuted,
            marginTop: 16,
            fontFamily: FONT.body,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Bottom decorative dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 30, opacity: subOpacity }}>
        {Array.from({ length: totalChapters }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === chapterNumber - 1 ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === chapterNumber - 1 ? color : C.borderLight,
              transition: "width 0.3s",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
