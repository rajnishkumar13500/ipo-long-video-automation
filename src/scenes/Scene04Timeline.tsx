import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { useSketchDraw } from "../components/Animations";
import { IPOData } from "../types/ipo";

/** Scene 04: Timeline & Stakes — Animated horizontal timeline + tension text. */
export const Scene04Timeline: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const issue = data.issue;
  const timelineNodes = [
    { label: "Bidding Opens", value: issue.biddingDates?.split("–")[0]?.trim() || "TBD", color: C.blue },
    { label: "Bidding Closes", value: issue.biddingDates?.split("–")[1]?.trim() || "TBD", color: C.blue },
    { label: "Allotment", value: issue.allotmentDate || "TBD", color: C.yellow },
    { label: "Listing", value: issue.listingDate || data.listingDate || "TBD", color: C.green },
  ];

  // Timeline line draw progress
  const lineProgress = useSketchDraw(8, 40);

  // Tension text typewriter
  const tensionText = "Will it deliver massive listing gains or fizzle out? Let's analyze.";
  const tensionStartFrame = 75;
  const tensionChars = Math.min(Math.floor(Math.max(0, f - tensionStartFrame) * 1.5), tensionText.length);

  // Retail quota badge
  const quotaBadge = spring({ frame: f - 50, fps, config: { damping: 10, stiffness: 140, mass: 0.6 } });

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
      <AmbientSpotlight color={C.blue} size={800} y="35%" />

      {/* Section label */}
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
        📅 IPO TIMELINE
      </div>

      {/* Horizontal timeline */}
      <div style={{ position: "relative", width: "100%", maxWidth: 1200, height: 200 }}>
        {/* Timeline line */}
        <svg
          width="100%"
          height={6}
          style={{ position: "absolute", top: 80, left: 0, right: 0 }}
          viewBox="0 0 1200 6"
          preserveAspectRatio="none"
        >
          <line
            x1={0}
            y1={3}
            x2={1200 * lineProgress}
            y2={3}
            stroke={C.borderLight}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Glowing progress overlay */}
          <line
            x1={0}
            y1={3}
            x2={1200 * lineProgress}
            y2={3}
            stroke={C.blue}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.6}
          />
        </svg>

        {/* Timeline nodes */}
        {timelineNodes.map((node, idx) => {
          const nodeDelay = 15 + idx * 25;
          const nodeProgress = spring({
            frame: f - nodeDelay,
            fps,
            config: { damping: 10, stiffness: 140, mass: 0.6 },
          });
          const xPos = `${(idx / (timelineNodes.length - 1)) * 100}%`;
          const isActive = f >= nodeDelay + 10;
          const pulse = isActive ? 0.5 + 0.5 * Math.sin((f - nodeDelay) * 0.08) : 0;

          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: xPos,
                top: 0,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: nodeProgress,
              }}
            >
              {/* Label above */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  fontFamily: FONT.body,
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}
              >
                {node.label}
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: node.color,
                  fontFamily: FONT.mono,
                  whiteSpace: "nowrap",
                }}
              >
                {node.value}
              </div>

              {/* Node dot */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: node.color,
                  border: `3px solid ${C.bgDark}`,
                  boxShadow: `0 0 ${12 + pulse * 8}px ${node.color}${isActive ? "80" : "30"}`,
                  marginTop: 10,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Retail Quota Badge */}
      <div
        style={{
          opacity: quotaBadge,
          transform: `scale(${interpolate(quotaBadge, [0, 1], [1.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          background: `${C.green}18`,
          border: `2px solid ${C.green}50`,
          borderRadius: 16,
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 50,
        }}
      >
        <span style={{ fontSize: 22 }}>🎯</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: FONT.body }}>
          Retail Quota: {issue.retailQuota || "35%"} of Offer
        </span>
      </div>

      {/* Tension text */}
      <div
        style={{
          marginTop: 40,
          fontSize: 26,
          fontWeight: 700,
          color: C.yellow,
          fontFamily: FONT.heading,
          textAlign: "center",
          fontStyle: "italic",
          textShadow: `0 0 20px ${C.yellow}30`,
          maxWidth: 800,
        }}
      >
        {tensionText.substring(0, tensionChars)}
        {tensionChars > 0 && tensionChars < tensionText.length && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 24,
              backgroundColor: C.yellow,
              marginLeft: 4,
              verticalAlign: "text-bottom",
              opacity: Math.round(f * 0.1) % 2 === 0 ? 1 : 0,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
