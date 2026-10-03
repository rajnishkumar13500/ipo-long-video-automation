import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./Tokens";
import { Card, Text } from "./Primitives";

interface Segment {
  name: string;
  sharePercent: number;
  description: string;
  amountFormatted?: string;
}

interface SegmentBreakdownProps {
  segments: Segment[];
  delay?: number;
}

export const SegmentBreakdown: React.FC<SegmentBreakdownProps> = ({
  segments,
  delay = 15,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = [C.blue, C.cyan, C.purple, C.yellow];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {segments.map((seg, idx) => {
        const itemDelay = delay + idx * 8;
        const anim = spring({
          frame: f - itemDelay,
          fps,
          config: { damping: 14, stiffness: 100 },
        });
        const width = interpolate(anim, [0, 1], [0, seg.sharePercent], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const segColor = colors[idx % colors.length];

        return (
          <Card
            key={idx}
            style={{
              padding: "18px 24px",
              background: "rgba(19, 28, 46, 0.75)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: segColor,
                    boxShadow: `0 0 8px ${segColor}`,
                  }}
                />
                <Text size={18} weight={700}>
                  {seg.name}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {seg.amountFormatted && (
                  <Text size={16} color={C.textMuted} weight={600}>
                    {seg.amountFormatted}
                  </Text>
                )}
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: segColor,
                  }}
                >
                  {seg.sharePercent}%
                </span>
              </div>
            </div>

            {/* Progress line */}
            <div
              style={{
                width: "100%",
                height: 8,
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${width}%`,
                  background: segColor,
                  borderRadius: 4,
                }}
              />
            </div>

            <Text size={13} color={C.textMuted} weight={500}>
              {seg.description}
            </Text>
          </Card>
        );
      })}
    </div>
  );
};
