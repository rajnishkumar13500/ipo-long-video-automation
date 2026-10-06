import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, ParticleField, AmbientSpotlight } from "../components/GrainOverlay";
import { ScoreBar } from "../components/GaugeRing";
import { useCameraShake } from "../components/Animations";
import { IPOData } from "../types/ipo";

/** Scene 27: Scorecard Reveal — Five-category scorecard with GMP and verdict stamps. */
export const Scene27Scorecard: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const v = data.verdict;

  // Overall score slam when "achieving an overall rating of X" is spoken (~second 6)
  const overallDelay = 175;
  const overallSlam = spring({ frame: f - overallDelay, fps, config: { damping: 6, stiffness: 200, mass: 0.5 } });
  const overallScale = interpolate(overallSlam, [0, 1], [3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = useCameraShake(overallDelay, 12, 5);

  // GMP section: Visible immediately from frame 6 so the viewer sees the GMP numbers while they are spoken
  const gmpSpring = spring({ frame: f - 6, fps, config: { damping: 14, stiffness: 120, mass: 0.7 } });
  const gmpOp = interpolate(gmpSpring, [0, 1], [0, 1]);

  // Verdict stamps: Slam when short-term and long-term verdicts are spoken (~second 3.3 to 4.5)
  const stamp1Slam = spring({ frame: f - 100, fps, config: { damping: 7, stiffness: 180, mass: 0.5 } });
  const stamp2Slam = spring({ frame: f - 135, fps, config: { damping: 7, stiffness: 180, mass: 0.5 } });

  // Smooth exit transition into outro
  const exitOp = interpolate(
    f,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scoreItems = [
    { label: "Business Moat", score: v.scorecard.businessMoat, color: C.blue },
    { label: "Financial Growth", score: v.scorecard.financialGrowth, color: C.green },
    { label: "Profitability Quality", score: v.scorecard.profitabilityQuality, color: C.cyan },
    { label: "Valuation Fairness", score: v.scorecard.valuationFairness, color: C.purple },
  ];

  const verdictColor = (verdict: string) => {
    if (verdict.includes("Apply") || verdict.includes("Subscribe")) return C.greenVibrant;
    if (verdict.includes("Avoid")) return C.coral;
    return C.yellow;
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "90px 100px 50px",
        transform: `translate(${shake.x}px, ${shake.y}px)`,
        opacity: exitOp,
      }}
    >
      <GrainOverlay opacity={0.03} />
      <AmbientSpotlight color={C.green} size={1000} y="40%" />

      {/* Celebration particles after overall reveal */}
      {overallSlam > 0.8 && (
        <ParticleField count={60} color={C.gold} speed={0.7} />
      )}

      <div style={{ display: "flex", gap: 50, width: "100%", alignItems: "center" }}>
        {/* Left: Scorecard bars */}
        <div style={{ flex: 1 }}>
          {/* Title */}
          <div
            style={{
              opacity: interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              fontSize: 32, fontWeight: 800, color: C.text, fontFamily: FONT.heading,
              letterSpacing: "-0.02em", marginBottom: 30,
            }}
          >
            Fundamental Scorecard
          </div>

          {/* Score bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 30 }}>
            {scoreItems.map((item, idx) => (
              <ScoreBar
                key={idx}
                label={item.label}
                score={item.score}
                maxScore={10}
                color={item.color}
                delay={12 + idx * 14}
              />
            ))}
          </div>

          {/* Overall score slam */}
          <div
            style={{
              opacity: overallSlam,
              transform: `scale(${overallScale})`,
              transformOrigin: "left center",
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: `${C.gold}15`,
              border: `2px solid ${C.gold}40`,
              borderRadius: 16,
              padding: "16px 28px",
            }}
          >
            <span style={{ fontSize: 28 }}>⭐</span>
            <div>
              <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 700, fontFamily: FONT.body, textTransform: "uppercase" }}>
                OVERALL RATING
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: C.gold, fontFamily: FONT.mono, textShadow: `0 0 20px ${C.gold}40` }}>
                {v.scorecard.overallRating}
              </div>
            </div>
          </div>
        </div>

        {/* Right: GMP + Verdicts */}
        <div style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* GMP Section */}
          <div
            style={{
              opacity: gmpOp,
              transform: `translateY(${(1 - gmpOp) * 20}px)`,
              background: C.bgCard,
              border: `1.5px solid ${C.borderLight}`,
              borderRadius: 18,
              padding: "24px 28px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", fontFamily: FONT.body, marginBottom: 12 }}>
              Grey Market Premium (GMP)
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.body }}>Current GMP</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.greenVibrant, fontFamily: FONT.mono }}>
                  {v.gmp.currentGmpFormatted}
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: C.borderLight }} />
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.body }}>Est. Listing Price</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.gold, fontFamily: FONT.mono }}>
                  {v.gmp.estimatedListingPrice}
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: C.borderLight }} />
              <div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.body }}>Trend</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: v.gmp.trend === "Bullish" ? C.green : C.yellow, fontFamily: FONT.body }}>
                  {v.gmp.trend === "Bullish" ? "🟢" : "🟡"} {v.gmp.trend}
                </div>
              </div>
            </div>
          </div>

          {/* Short-term verdict stamp */}
          <div
            style={{
              opacity: stamp1Slam,
              transform: `scale(${interpolate(stamp1Slam, [0, 1], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}) rotate(${interpolate(stamp1Slam, [0, 1], [-5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg)`,
              background: `${verdictColor(v.shortTermVerdict)}12`,
              border: `3px solid ${verdictColor(v.shortTermVerdict)}60`,
              borderRadius: 18,
              padding: "20px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", fontFamily: FONT.body, marginBottom: 6 }}>
              SHORT-TERM VERDICT
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: verdictColor(v.shortTermVerdict), fontFamily: FONT.heading, textShadow: `0 0 15px ${verdictColor(v.shortTermVerdict)}30` }}>
              {v.shortTermVerdict}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body, marginTop: 6, lineHeight: 1.4 }}>
              {v.shortTermRationale}
            </div>
          </div>

          {/* Long-term verdict stamp */}
          <div
            style={{
              opacity: stamp2Slam,
              transform: `scale(${interpolate(stamp2Slam, [0, 1], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}) rotate(${interpolate(stamp2Slam, [0, 1], [5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg)`,
              background: `${verdictColor(v.longTermVerdict)}12`,
              border: `3px solid ${verdictColor(v.longTermVerdict)}60`,
              borderRadius: 18,
              padding: "20px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", fontFamily: FONT.body, marginBottom: 6 }}>
              LONG-TERM VERDICT
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: verdictColor(v.longTermVerdict), fontFamily: FONT.heading, textShadow: `0 0 15px ${verdictColor(v.longTermVerdict)}30` }}>
              {v.longTermVerdict}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body, marginTop: 6, lineHeight: 1.4 }}>
              {v.longTermRationale}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
