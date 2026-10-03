import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, ParticleField } from "../components/GrainOverlay";
import { IPOData } from "../types/ipo";

/** Scene 17: Financial Summary Callout — Kinetic typography summary. */
export const Scene17FinancialSummary: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const fin = data.financials;

  const words = [
    { text: fin.revenue.cagr.replace(" CAGR", ""), color: C.greenVibrant, label: "Revenue CAGR" },
    { text: "•", color: C.textDim, label: "" },
    { text: "Profitable", color: C.cyanVibrant, label: fin.pat.isProfitableNow ? "Net Positive" : "" },
    { text: "•", color: C.textDim, label: "" },
    { text: "Clean Balance Sheet", color: C.gold, label: `D/E: ${fin.balanceSheet.debtToEquity}` },
  ];

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
      <GrainOverlay opacity={0.03} />
      <ParticleField count={30} color={C.green} speed={0.4} />

      {/* Financial summary label */}
      <div
        style={{
          opacity: interpolate(f, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 16,
          fontWeight: 700,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: FONT.body,
          marginBottom: 40,
        }}
      >
        📊 FINANCIAL SNAPSHOT
      </div>

      {/* Kinetic words */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
          alignItems: "center",
          maxWidth: 1200,
        }}
      >
        {words.map((word, idx) => {
          const wordDelay = 10 + idx * 10;
          const wordOp = interpolate(f, [wordDelay, wordDelay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wordY = interpolate(f, [wordDelay, wordDelay + 12], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={idx}
              style={{
                opacity: wordOp,
                transform: `translateY(${wordY}px)`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: word.text === "•" ? 42 : 48,
                  fontWeight: 900,
                  color: word.color,
                  fontFamily: FONT.heading,
                  textShadow: word.text !== "•" ? `0 0 30px ${word.color}40` : "none",
                  letterSpacing: "-0.02em",
                }}
              >
                {word.text}
              </div>
              {word.label && (
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.textMuted,
                    fontFamily: FONT.body,
                    marginTop: 6,
                  }}
                >
                  {word.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary take at bottom */}
      <div
        style={{
          marginTop: 50,
          opacity: interpolate(f, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 20,
          fontWeight: 600,
          color: C.text,
          fontFamily: FONT.body,
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.5,
          padding: "20px 32px",
          background: `${C.green}08`,
          border: `1px solid ${C.green}20`,
          borderRadius: 14,
        }}
      >
        The numbers tell a story of aggressive growth with improving unit economics and disciplined capital management.
      </div>
    </AbsoluteFill>
  );
};
