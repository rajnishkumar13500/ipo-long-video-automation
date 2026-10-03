import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, PAD_BOT, PAD_H, PAD_TOP } from "./Tokens";
import { useFadeIn, useSlideUp, useSlamIn } from "./Animations";

// ─── Text ─────────────────────────────────────────────────────────────────────
export const Text: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
}> = ({ children, size = 28, color = C.text, weight = 600, align = "left", style = {} }) => (
  <div
    style={{
      fontFamily: FONT.body,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.25,
      textAlign: align,
      letterSpacing: "-0.015em",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  glowColor?: string;
  bordered?: boolean;
}> = ({ children, style = {}, glowColor, bordered = true }) => (
  <div
    style={{
      background: C.bgCard,
      borderRadius: 18,
      border: bordered ? `1.5px solid ${C.borderLight}` : "none",
      boxShadow: glowColor
        ? `0 10px 30px -10px ${glowColor}, 0 4px 12px rgba(0, 0, 0, 0.4)`
        : "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
      padding: "24px 28px",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge: React.FC<{
  label: string;
  color?: string;
  bg?: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
}> = ({ label, color = C.blue, bg, icon, size = "md" }) => {
  const pad = size === "sm" ? "4px 10px" : size === "lg" ? "8px 18px" : "6px 14px";
  const fSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: bg || `${color}1A`,
        color: color,
        border: `1.5px solid ${color}4D`,
        borderRadius: 9999,
        padding: pad,
        fontSize: fSize,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontFamily: FONT.body,
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

// ─── Highlight Span ───────────────────────────────────────────────────────────
export const HL: React.FC<{
  children: React.ReactNode;
  color?: string;
  glow?: boolean;
}> = ({ children, color = C.blue, glow = false }) => (
  <span
    style={{
      color,
      fontWeight: 800,
      textShadow: glow ? `0 0 20px ${color}80, 0 0 40px ${color}40` : "none",
    }}
  >
    {children}
  </span>
);

// ─── Chapter Heading (for legacy compat) ──────────────────────────────────────
export const Heading: React.FC<{
  chapterBadge?: string;
  badgeColor?: string;
  title: React.ReactNode;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ chapterBadge, badgeColor = C.blue, title, subtitle, rightElement, style = {} }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 20,
      ...style,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {chapterBadge && <Badge label={chapterBadge} color={badgeColor} size="sm" />}
      <Text size={38} weight={800} color={C.text} style={{ letterSpacing: "-0.025em" }}>
        {title}
      </Text>
      {subtitle && (
        <Text size={18} color={C.textMuted} weight={500}>
          {subtitle}
        </Text>
      )}
    </div>
    {rightElement && <div>{rightElement}</div>}
  </div>
);

// ─── Anim Wrapper (fade + slide) ──────────────────────────────────────────────
export const Anim: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dist?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, dist = 30, dur = 18, style = {} }) => {
  const opacity = useFadeIn(delay, dur);
  const translateY = useSlideUp(delay, dist);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── SlamAnim Wrapper (slam-in with bounce + scale) ───────────────────────────
export const SlamAnim: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style = {} }) => {
  const { scale, opacity } = useSlamIn(delay);
  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Scene Container ──────────────────────────────────────────────────────────
export const Scene: React.FC<{
  children: React.ReactNode;
  topPad?: number;
  botPad?: number;
  horizontalPad?: number;
  centered?: boolean;
}> = ({ children, topPad = PAD_TOP, botPad = PAD_BOT, horizontalPad = PAD_H, centered = false }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        boxSizing: "border-box",
        paddingLeft: horizontalPad,
        paddingRight: horizontalPad,
        paddingTop: topPad,
        paddingBottom: botPad,
        display: "flex",
        flexDirection: "column",
        justifyContent: centered ? "center" : "flex-start",
        alignItems: centered ? "center" : "stretch",
        position: "relative",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ─── CinematicScene (centered, no default padding structure) ──────────────────
export const CinematicScene: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
