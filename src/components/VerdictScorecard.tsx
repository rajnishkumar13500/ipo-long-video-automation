import React from "react";
import { C } from "./Tokens";
import { Card, Text } from "./Primitives";
import { IPOData } from "../types/ipo";

interface VerdictScorecardProps {
  verdict: IPOData["verdict"];
}

export const VerdictScorecard: React.FC<VerdictScorecardProps> = ({ verdict }) => {
  const gmpColor =
    verdict.gmp.trend === "Bullish"
      ? C.green
      : verdict.gmp.trend === "Neutral"
      ? C.yellow
      : C.red;

  const scoreItems = [
    { label: "Business Moat", val: verdict.scorecard.businessMoat },
    { label: "Financial Growth", val: verdict.scorecard.financialGrowth },
    { label: "Profitability Quality", val: verdict.scorecard.profitabilityQuality },
    { label: "Valuation Fairness", val: verdict.scorecard.valuationFairness },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
      {/* Left Column: Decision Cards & Rationale */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Short Term Listing Gain Card */}
        <Card
          style={{
            padding: "20px 24px",
            borderLeft: `5px solid ${C.green}`,
            background: "rgba(16, 185, 129, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>
              Short-Term Horizon (Listing Day)
            </span>
            <span
              style={{
                background: C.green,
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                padding: "3px 12px",
                borderRadius: 6,
              }}
            >
              {verdict.shortTermVerdict}
            </span>
          </div>
          <Text size={15} color={C.text} weight={500} style={{ lineHeight: 1.4 }}>
            {verdict.shortTermRationale}
          </Text>
        </Card>

        {/* Long Term Investment Card */}
        <Card
          style={{
            padding: "20px 24px",
            borderLeft: `5px solid ${C.blue}`,
            background: "rgba(59, 130, 246, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>
              Long-Term Horizon (1 to 3 Years)
            </span>
            <span
              style={{
                background: C.blue,
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                padding: "3px 12px",
                borderRadius: 6,
              }}
            >
              {verdict.longTermVerdict}
            </span>
          </div>
          <Text size={15} color={C.text} weight={500} style={{ lineHeight: 1.4 }}>
            {verdict.longTermRationale}
          </Text>
        </Card>

        {/* Summary Takeaway */}
        <Card style={{ padding: "18px 24px", background: "rgba(30, 41, 59, 0.5)" }}>
          <Text size={15} color={C.text} weight={600} style={{ lineHeight: 1.45 }}>
            💡 {verdict.summaryTake}
          </Text>
        </Card>
      </div>

      {/* Right Column: Scorecard & GMP Gauge */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Overall Score Badge Card */}
        <Card
          style={{
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>
            Analyst Fundamental Score
          </span>
          <span
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: C.cyan,
              lineHeight: 1.1,
              marginTop: 6,
              textShadow: `0 0 25px ${C.cyan}40`,
            }}
          >
            {verdict.scorecard.overallRating}
          </span>

          {/* Sub-Pillar Progress Bars */}
          <div style={{ width: "100%", marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {scoreItems.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.val}/10</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${item.val * 10}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Grey Market Premium (GMP) Indicator Card */}
        <Card
          style={{
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(19, 28, 46, 0.8)",
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase" }}>
              Grey Market Premium (GMP)
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, color: gmpColor, marginTop: 4 }}>
              {verdict.gmp.currentGmpFormatted}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase" }}>
              Est. Listing Price
            </span>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 4 }}>
              {verdict.gmp.estimatedListingPrice}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
