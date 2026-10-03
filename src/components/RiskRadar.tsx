import React from "react";
import { C } from "./Tokens";
import { Card, Text } from "./Primitives";
import { RiskItemData } from "../types/ipo";

interface RiskRadarProps {
  items: RiskItemData[];
  overallRiskLevel: "Low" | "Moderate" | "High";
  bottomNote: string;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({
  items,
  overallRiskLevel,
  bottomNote,
}) => {
  const riskColor =
    overallRiskLevel === "High"
      ? C.red
      : overallRiskLevel === "Moderate"
      ? C.yellow
      : C.green;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top Risk Level Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(19, 28, 46, 0.75)",
          padding: "16px 24px",
          borderRadius: 14,
          border: `1.5px solid ${C.borderLight}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <Text size={18} weight={700}>
              Key Structural Red Flags & Risk Assessment
            </Text>
            <Text size={14} color={C.textMuted}>
              Critical factors retail investors must evaluate before applying
            </Text>
          </div>
        </div>
        <div
          style={{
            background: `${riskColor}20`,
            border: `1.5px solid ${riskColor}60`,
            borderRadius: 8,
            padding: "6px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, color: C.textMuted }}>Overall Risk Level:</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: riskColor }}>
            {overallRiskLevel} Risk
          </span>
        </div>
      </div>

      {/* 3 Risk Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {items.map((item, idx) => {
          const itemColor =
            item.severity === "High"
              ? C.red
              : item.severity === "Medium"
              ? C.yellow
              : C.green;

          return (
            <Card
              key={idx}
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                borderTop: `4px solid ${itemColor}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    background: `${itemColor}20`,
                    color: itemColor,
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 6,
                    textTransform: "uppercase",
                  }}
                >
                  {item.tag}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: itemColor }}>
                  {item.severity} Severity
                </span>
              </div>

              <Text size={18} weight={700}>
                {item.title}
              </Text>

              <Text size={14} color={C.textMuted} weight={500} style={{ lineHeight: 1.4 }}>
                {item.detail}
              </Text>
            </Card>
          );
        })}
      </div>

      {/* Bottom Note */}
      {bottomNote && (
        <Card
          style={{
            padding: "16px 22px",
            background: "rgba(30, 41, 59, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>📌</span>
          <Text size={14} color={C.textMuted} weight={500}>
            {bottomNote}
          </Text>
        </Card>
      )}
    </div>
  );
};
