import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT } from "../components/Tokens";
import { GrainOverlay, ParticleField, AmbientSpotlight } from "../components/GrainOverlay";
import { CompanyLogo } from "../components/CompanyLogo";
import { IPOData } from "../types/ipo";

/**
 * Scene 28: Dynamic 2-Phase YouTube Outro & End-Screen
 * 
 * Phase 1 (0 to ~44% duration): Executive Fundamental Verdict & Summary Takeaway
 * Phase 2 (~44% to 100% duration): Interactive YouTube Subscribe & Engagement End-Screen
 * 
 * Dynamically scales to match any audio duration generated for any IPO.
 * Guaranteed zero black screen while audio is playing.
 */
export const Scene28Outro: React.FC<{ data: IPOData }> = ({ data }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const v = data.verdict;

  // Dynamic phase transition based on audio duration
  const phaseSplit = Math.max(120, Math.round(durationInFrames * 0.44));
  const isPhase1 = f < phaseSplit + 20;
  const isPhase2 = f >= phaseSplit - 15;

  // Overall final fade out only in the last 25 frames of the video
  const finalFadeOut = interpolate(
    f,
    [durationInFrames - 25, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ─── Phase 1 Animations (Summary & Verdict) ──────────────────────────────────
  const p1Opacity = interpolate(
    f,
    [phaseSplit - 20, phaseSplit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const p1Scale = interpolate(
    f,
    [phaseSplit - 20, phaseSplit],
    [1, 0.96],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const summaryText = v.summaryTake;
  const summaryChars = Math.min(Math.floor(Math.max(0, f - 10) * 2.2), summaryText.length);

  const badgeEntrance = spring({
    frame: f - 5,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.6 },
  });

  // ─── Phase 2 Animations (YouTube End-Screen & Subscribe) ───────────────────────
  const p2Progress = spring({
    frame: Math.max(0, f - phaseSplit),
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });

  const p2Opacity = interpolate(
    f,
    [phaseSplit - 15, phaseSplit + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const p2Scale = interpolate(p2Progress, [0, 1], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Looping bell animation
  const bellRot = Math.sin(f * 0.16) * 12;
  const bellScale = 1 + 0.08 * Math.sin(f * 0.12);

  // Looping subscribe glow pulse
  const subscribePulse = 0.5 + 0.5 * Math.sin(f * 0.08);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: C.bg,
        opacity: finalFadeOut,
      }}
    >
      <GrainOverlay opacity={0.03} />
      <ParticleField count={45} color={C.blue} speed={0.35} />
      <AmbientSpotlight color={C.blue} size={1100} y="45%" />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 1: Executive Fundamental Verdict & Summary Takeaway             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isPhase1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 120px",
            opacity: p1Opacity,
            transform: `scale(${p1Scale})`,
            pointerEvents: isPhase2 ? "none" : "auto",
          }}
        >
          {/* Chapter / Header Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
              opacity: badgeEntrance,
              transform: `translateY(${interpolate(badgeEntrance, [0, 1], [-20, 0])}px)`,
            }}
          >
            <div
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: `1.5px solid ${C.green}`,
                padding: "8px 22px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                color: C.green,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: FONT.heading,
              }}
            >
              CHAPTER 08 • FINAL ANALYST VERDICT
            </div>

            <div
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                border: `1.5px solid ${C.yellow}`,
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                color: C.yellow,
                letterSpacing: "0.08em",
                fontFamily: FONT.heading,
              }}
            >
              SCORECARD: {v.scorecard.overallRating}
            </div>
          </div>

          {/* Company Branding & Recommendation Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              marginBottom: 36,
              opacity: badgeEntrance,
            }}
          >
            <CompanyLogo
              size={84}
              logoUrl={data.logoUrl}
              logoUrls={data.logoUrls}
              domain={data.domain}
              companyName={data.companyName}
              initials={data.logoInitials}
              bgColor={data.logoBgColor || C.blueDark}
            />

            <div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: C.text,
                  fontFamily: FONT.heading,
                  letterSpacing: "-0.02em",
                }}
              >
                {data.companyName}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: C.textMuted,
                  fontFamily: FONT.body,
                  marginTop: 4,
                }}
              >
                {data.industry} • {data.exchange || "NSE • BSE"}
              </div>
            </div>

            {/* Verdict Pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 20 }}>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.18)",
                  border: "1.5px solid rgba(16, 185, 129, 0.6)",
                  borderRadius: 12,
                  padding: "8px 18px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.greenVibrant,
                  fontFamily: FONT.heading,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚡ Short-Term:</span>
                <span>{v.shortTermVerdict}</span>
              </div>

              <div
                style={{
                  background: "rgba(59, 130, 246, 0.18)",
                  border: "1.5px solid rgba(59, 130, 246, 0.6)",
                  borderRadius: 12,
                  padding: "8px 18px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.blueVibrant,
                  fontFamily: FONT.heading,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>💎 Long-Term:</span>
                <span>{v.longTermVerdict}</span>
              </div>
            </div>
          </div>

          {/* Kinetic Summary Takeaway Card */}
          <div
            style={{
              background: "rgba(17, 24, 39, 0.85)",
              border: `1.5px solid ${C.borderLight}`,
              borderRadius: 20,
              padding: "36px 44px",
              maxWidth: 1080,
              width: "100%",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 6,
                background: `linear-gradient(180deg, ${C.blue}, ${C.cyan})`,
              }}
            />

            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: C.cyan,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: FONT.heading,
                marginBottom: 14,
              }}
            >
              ANALYST SUMMARY TAKE
            </div>

            <div
              style={{
                fontSize: 27,
                fontWeight: 600,
                color: C.text,
                fontFamily: FONT.heading,
                lineHeight: 1.6,
                letterSpacing: "-0.01em",
                minHeight: 110,
              }}
            >
              {summaryText.substring(0, summaryChars)}
              {summaryChars < summaryText.length && (
                <span
                  style={{
                    display: "inline-block",
                    width: 3,
                    height: 26,
                    backgroundColor: C.cyan,
                    marginLeft: 4,
                    verticalAlign: "text-bottom",
                    opacity: Math.round(f * 0.08) % 2 === 0 ? 1 : 0,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 2: Interactive YouTube End-Screen & Subscribe Finale           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isPhase2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "42px 100px 78px 100px",
            opacity: p2Opacity,
            transform: `scale(${p2Scale})`,
          }}
        >
          {/* Top Community Question & Headline */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(59, 130, 246, 0.15)",
                border: `1.5px solid ${C.blue}`,
                padding: "8px 24px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                color: C.blueVibrant,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: FONT.heading,
                marginBottom: 16,
              }}
            >
              <span>🔔</span>
              <span>COMMUNITY ENGAGEMENT • HAVE YOUR SAY</span>
            </div>

            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: C.text,
                fontFamily: FONT.heading,
                letterSpacing: "-0.02em",
              }}
            >
              What is your bidding strategy for{" "}
              <span style={{ color: C.gold }}>{data.companyName}</span>?
            </div>
          </div>

          {/* Center Interactive Layout: Community Poll + YouTube End-Screen Video Slots */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 36,
              maxWidth: 1280,
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Left: Community Verdict Poll */}
            <div
              style={{
                background: "rgba(17, 24, 39, 0.88)",
                border: `1.5px solid ${C.borderLight}`,
                borderRadius: 22,
                padding: "28px 34px",
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: FONT.heading,
                  marginBottom: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>COMMUNITY POLL</span>
                <span style={{ color: C.gold }}>ACTIVE DISCUSSION 💬</span>
              </div>

              {/* Option A: Apply */}
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  border: `1.5px solid rgba(16, 185, 129, 0.45)`,
                  borderRadius: 14,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>🚀</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: FONT.heading }}>
                      APPLY FOR THE ISSUE
                    </div>
                    <div style={{ fontSize: 13, color: C.greenVibrant, fontFamily: FONT.body, marginTop: 2 }}>
                      Listing Gains or Long-Term Compounder
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: C.green,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 12,
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  GMP {v.gmp.currentGmpFormatted}
                </div>
              </div>

              {/* Option B: Avoid */}
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.10)",
                  border: `1.5px solid rgba(239, 68, 68, 0.35)`,
                  borderRadius: 14,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>⏸️</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: FONT.heading }}>
                      AVOID OR WAIT FOR LISTING
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body, marginTop: 2 }}>
                      Wait for Secondary Market Price Discovery
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: C.textDim,
                    fontWeight: 700,
                    fontSize: 12,
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  Risk: {data.risks.overallRiskLevel}
                </div>
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: C.textMuted,
                  fontFamily: FONT.body,
                  marginTop: 18,
                  textAlign: "center",
                }}
              >
                Drop your target bidding price or rationale in comments below! 👇
              </div>
            </div>

            {/* Right: YouTube Interactive End-Screen Video Placeholders */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Card 1 */}
              <div
                style={{
                  background: "rgba(26, 34, 54, 0.7)",
                  border: `1.5px dashed ${C.borderLight}`,
                  borderRadius: 16,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  position: "relative",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.25)",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    background: "rgba(59, 130, 246, 0.2)",
                    border: `1px solid ${C.blue}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  ▶️
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.blueVibrant, letterSpacing: "0.08em" }}>
                    WATCH NEXT
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: FONT.heading, marginTop: 2 }}>
                    Upcoming Indian IPOs This Month
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                    Grey Market Premium & Subscription Tracker
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                style={{
                  background: "rgba(26, 34, 54, 0.7)",
                  border: `1.5px dashed ${C.borderLight}`,
                  borderRadius: 16,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  position: "relative",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.25)",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    background: "rgba(16, 185, 129, 0.2)",
                    border: `1px solid ${C.green}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  🎯
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.greenVibrant, letterSpacing: "0.08em" }}>
                    PLAYLIST
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: FONT.heading, marginTop: 2 }}>
                    IPO Valuation & Fundamental Deep Dives
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                    Learn how to read RHP filings like an analyst
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary High-Impact Subscribe Button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)",
                borderRadius: 16,
                padding: "18px 52px",
                border: `2px solid rgba(147, 197, 253, 0.8)`,
                boxShadow: `0 12px 40px rgba(37, 99, 235, ${0.4 + subscribePulse * 0.25})`,
                transform: `scale(${1 + subscribePulse * 0.02})`,
              }}
            >
              {/* Animated Bouncing Bell */}
              <div
                style={{
                  fontSize: 34,
                  transform: `scale(${bellScale}) rotate(${bellRot}deg)`,
                  display: "inline-block",
                }}
              >
                🔔
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  fontFamily: FONT.heading,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Subscribe for Daily IPO Breakdowns
              </div>
            </div>

            <div
              style={{
                fontSize: 15,
                color: C.textMuted,
                fontFamily: FONT.body,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>👍 Like this analysis</span>
              <span>•</span>
              <span>Turn on notifications to never miss an IPO alert!</span>
            </div>
          </div>

          {/* Statutory Educational Disclaimer */}
          <div
            style={{
              fontSize: 12,
              color: C.textDim,
              fontFamily: FONT.body,
              letterSpacing: "0.05em",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            EDUCATIONAL & INFORMATIONAL PURPOSES ONLY • NOT SEBI-REGISTERED INVESTMENT ADVICE • DO YOUR OWN RESEARCH
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
