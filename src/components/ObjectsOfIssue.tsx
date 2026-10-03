import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./Tokens";
import { Card, Text } from "./Primitives";

interface ObjectItem {
  purpose: string;
  amountFormatted: string;
  percentage: string;
}

interface ObjectsOfIssueProps {
  freshTotalFormatted: string;
  ofsTotalFormatted: string;
  freshPercent?: string;
  ofsPercent?: string;
  objects?: ObjectItem[];
  delay?: number;
}

export const ObjectsOfIssue: React.FC<ObjectsOfIssueProps> = ({
  freshTotalFormatted,
  ofsTotalFormatted,
  freshPercent = "66.7%",
  ofsPercent = "33.3%",
  objects = [],
  delay = 20,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const anim = spring({
    frame: f - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const widthRatio = interpolate(anim, [0, 1], [0, 1]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Fresh vs OFS High-Level Allocation Card */}
      <Card style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.green }} />
            <Text size={17} weight={700}>
              Fresh Growth Capital ({freshPercent})
            </Text>
            <span style={{ fontSize: 17, fontWeight: 800, color: C.green }}>
              {freshTotalFormatted}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.yellow }} />
            <Text size={17} weight={700}>
              Offer for Sale / OFS ({ofsPercent})
            </Text>
            <span style={{ fontSize: 17, fontWeight: 800, color: C.yellow }}>
              {ofsTotalFormatted}
            </span>
          </div>
        </div>

        {/* Proportional Split Bar */}
        <div
          style={{
            height: 14,
            width: "100%",
            borderRadius: 7,
            overflow: "hidden",
            display: "flex",
            background: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              width: `${67 * widthRatio}%`,
              height: "100%",
              background: C.green,
            }}
          />
          <div
            style={{
              width: `${33 * widthRatio}%`,
              height: "100%",
              background: C.yellow,
            }}
          />
        </div>
      </Card>

      {/* Objects of the Fresh Issue Details */}
      {objects.length > 0 && (
        <Card style={{ padding: "24px 28px" }}>
          <Text size={20} weight={700} style={{ marginBottom: 16 }}>
            Objects of the Fresh Issue (Where is the money going?)
          </Text>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {objects.map((obj, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(30, 41, 59, 0.5)",
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: `1px solid ${C.borderLight}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      background: `${C.blue}2A`,
                      color: C.blue,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {i + 1}
                  </div>
                  <Text size={16} weight={600} style={{ maxWidth: 600 }}>
                    {obj.purpose}
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
                    {obj.amountFormatted}
                  </span>
                  <span
                    style={{
                      background: `${C.cyan}20`,
                      color: C.cyan,
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {obj.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
