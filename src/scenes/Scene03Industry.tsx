import React from "react";
import { C } from "../components/Tokens";
import { Anim, Card, Heading, HL, Scene, Text } from "../components/Primitives";
import { IPOData } from "../types/ipo";

export const Scene03Industry: React.FC<{ data: IPOData }> = ({ data }) => {
  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 03 / 08 • INDUSTRY & TAM"
        badgeColor={C.yellow}
        title={
          <>
            Macro Tailwinds & <HL color={C.yellow}>Market Opportunity</HL>
          </>
        }
        subtitle="Sector dynamics, growth vectors, and competitive positioning"
      />

      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 24, marginTop: 10 }}>
        {/* Left Column: TAM & Market Position Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Anim delay={5}>
            <Card style={{ padding: "26px 30px" }}>
              <Text size={14} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Total Addressable Market (TAM)
              </Text>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: C.yellow,
                  marginTop: 6,
                  lineHeight: 1.1,
                }}
              >
                {data.industryContext.marketSizeFormatted}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: `${C.green}20`,
                  border: `1px solid ${C.green}50`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  marginTop: 14,
                }}
              >
                <span style={{ fontSize: 14 }}>📈</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.green }}>
                  {data.industryContext.cagrText}
                </span>
              </div>
            </Card>
          </Anim>

          <Anim delay={16}>
            <Card style={{ padding: "24px 28px", borderLeft: `5px solid ${C.cyan}` }}>
              <Text size={14} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Competitive Moat & Position
              </Text>
              <Text size={20} weight={700} color={C.cyan} style={{ marginTop: 8 }}>
                {data.industryContext.marketPosition}
              </Text>
            </Card>
          </Anim>
        </div>

        {/* Right Column: 3 Structural Industry Drivers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.industryContext.drivers.map((driver, idx) => (
            <Anim key={idx} delay={12 + idx * 10}>
              <Card
                style={{
                  padding: "20px 26px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  background: "rgba(19, 28, 46, 0.75)",
                }}
              >
                <div
                  style={{
                    background: `${C.blue}26`,
                    color: C.blue,
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  0{idx + 1}
                </div>
                <div>
                  <Text size={18} weight={700} color={C.text}>
                    {driver.title}
                  </Text>
                  <Text size={14} color={C.textMuted} weight={500} style={{ marginTop: 4, lineHeight: 1.45 }}>
                    {driver.detail}
                  </Text>
                </div>
              </Card>
            </Anim>
          ))}
        </div>
      </div>
    </Scene>
  );
};
