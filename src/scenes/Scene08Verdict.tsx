import React from "react";
import { C } from "../components/Tokens";
import { Anim, Heading, HL, Scene, Text } from "../components/Primitives";
import { VerdictScorecard } from "../components/VerdictScorecard";
import { IPOData } from "../types/ipo";

export const Scene08Verdict: React.FC<{ data: IPOData }> = ({ data }) => {
  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 08 / 08 • FINAL VERDICT"
        badgeColor={C.green}
        title={
          <>
            Final Verdict: <HL color={C.green}>Apply or Avoid</HL>?
          </>
        }
        subtitle="Listing gains probability vs long-term investment horizon & analyst scorecard"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 6 }}>
        <Anim delay={5}>
          <VerdictScorecard verdict={data.verdict} />
        </Anim>

        {/* YouTube Channel Call To Action Strip */}
        <Anim delay={30}>
          <div
            style={{
              background: "linear-gradient(90deg, #1E3A8A, #1D4ED8)",
              borderRadius: 14,
              padding: "16px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 25px rgba(29, 78, 216, 0.3)",
              border: `1px solid ${C.blue}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>🔔</span>
              <div>
                <Text size={17} weight={800} color="#fff">
                  Subscribe to the Channel for Daily In-Depth IPO Breakdowns
                </Text>
                <Text size={13} color="rgba(255, 255, 255, 0.8)" style={{ marginTop: 2 }}>
                  Will you apply for {data.companyName}? Share your strategy in the comments below!
                </Text>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                color: C.black,
                fontWeight: 800,
                fontSize: 15,
                padding: "8px 22px",
                borderRadius: 8,
              }}
            >
              SUBSCRIBE
            </div>
          </div>
        </Anim>
      </div>
    </Scene>
  );
};
