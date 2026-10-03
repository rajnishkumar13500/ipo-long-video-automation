import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, AmbientSpotlight } from "../components/GrainOverlay";
import { GaugeRing } from "../components/GaugeRing";
import { IPOData } from "../types/ipo";

/** Scene 16: Balance Sheet Health — Four animated gauge rings. */
export const Scene16BalanceSheet: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const fin = data.financials;

  const titleOp = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Parse numeric values for gauges
  const deVal = parseFloat(fin.balanceSheet.debtToEquity.replace("x", "")) || 0.42;
  const ronwVal = parseFloat(fin.balanceSheet.ronwFormatted.replace("%", "")) || 19.8;
  const roceVal = parseFloat(fin.balanceSheet.roceFormatted?.replace("%", "") || "22.4");

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "60px 100px",
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.cyan} size={800} y="40%" />

      {/* Header */}
      <div style={{ marginBottom: 50, textAlign: "center", opacity: titleOp }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: FONT.heading, letterSpacing: "-0.02em" }}>
          Balance Sheet Health Check
        </div>
        <div style={{ fontSize: 16, color: C.textMuted, fontWeight: 500, fontFamily: FONT.body, marginTop: 6 }}>
          Leverage, cash flow, and capital efficiency metrics
        </div>
      </div>

      {/* Four gauge rings */}
      <div style={{ display: "flex", gap: 60, justifyContent: "center" }}>
        <GaugeRing
          value={deVal}
          maxValue={2}
          label="Debt-to-Equity"
          formatted={fin.balanceSheet.debtToEquity}
          color={deVal < 1 ? C.greenVibrant : C.yellow}
          delay={10}
          size={170}
          thickness={14}
          subLabel="Conservative leverage"
        />

        <GaugeRing
          value={100}
          maxValue={100}
          label="Cash from Operations"
          formatted={fin.balanceSheet.cashFromOperations}
          color={C.cyanVibrant}
          delay={22}
          size={170}
          thickness={14}
          subLabel="Positive cash generation"
        />

        <GaugeRing
          value={ronwVal}
          maxValue={40}
          label="Return on Net Worth"
          formatted={fin.balanceSheet.ronwFormatted}
          color={C.gold}
          delay={34}
          size={170}
          thickness={14}
          subLabel="Capital efficiency"
        />

        <GaugeRing
          value={roceVal}
          maxValue={40}
          label="ROCE"
          formatted={fin.balanceSheet.roceFormatted || "N/A"}
          color={C.purple}
          delay={46}
          size={170}
          thickness={14}
          subLabel="Return on capital employed"
        />
      </div>

      {/* Profitability status badge */}
      <div
        style={{
          marginTop: 50,
          opacity: interpolate(f, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(f, [60, 72], [1.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          background: fin.pat.isProfitableNow ? `${C.green}18` : `${C.red}18`,
          border: `2px solid ${fin.pat.isProfitableNow ? C.green : C.red}50`,
          borderRadius: 16,
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 26 }}>{fin.pat.isProfitableNow ? "✅" : "⚠️"}</span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: fin.pat.isProfitableNow ? C.greenVibrant : C.coral,
            fontFamily: FONT.body,
          }}
        >
          {fin.pat.isProfitableNow ? "Currently Profitable" : "Still Loss-Making"}
        </span>
        <span style={{ fontSize: 15, color: C.textMuted, fontFamily: FONT.mono }}>
          Net Margin: {fin.pat.marginsPercent[2]}
        </span>
      </div>
    </AbsoluteFill>
  );
};
