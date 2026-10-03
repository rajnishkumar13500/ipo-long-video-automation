import React from "react";
import { C } from "../components/Tokens";
import { Anim, Card, Heading, HL, Scene, Text } from "../components/Primitives";
import { SegmentBreakdown } from "../components/SegmentBreakdown";
import { IPOData } from "../types/ipo";

export const Scene02BusinessModel: React.FC<{ data: IPOData }> = ({ data }) => {
  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 02 / 08 • BUSINESS MODEL"
        badgeColor={C.cyan}
        title={
          <>
            How does <HL color={C.cyan}>{data.companyName}</HL> make money?
          </>
        }
        subtitle="Revenue streams, product offerings, and customer monetization channels"
      />

      <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 24, marginTop: 10 }}>
        {/* Left Column: Business Description & KPI Highlights */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Anim delay={5}>
            <Card style={{ padding: "26px 30px" }}>
              <Text size={20} weight={700} color={C.cyan} style={{ marginBottom: 10 }}>
                {data.businessModel.headline}
              </Text>
              <Text size={16} color={C.text} weight={500} style={{ lineHeight: 1.5 }}>
                {data.businessModel.description}
              </Text>
            </Card>
          </Anim>

          {/* Operational Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {data.businessModel.keyHighlights.map((kpi, idx) => (
              <Anim key={idx} delay={15 + idx * 8}>
                <Card style={{ padding: "18px 20px", textAlign: "center" }}>
                  <Text size={12} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                    {kpi.label}
                  </Text>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: C.text,
                      marginTop: 6,
                    }}
                  >
                    {kpi.value}
                  </div>
                  {kpi.subtext && (
                    <Text size={11} color={C.textMuted} weight={500} style={{ marginTop: 4 }}>
                      {kpi.subtext}
                    </Text>
                  )}
                </Card>
              </Anim>
            ))}
          </div>
        </div>

        {/* Right Column: Segment Breakdown Proportions */}
        <Anim delay={18}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text size={18} weight={700}>
                Revenue Breakdown by Division
              </Text>
              <span style={{ fontSize: 13, color: C.textMuted }}>Share of Total Top-Line</span>
            </div>
            <SegmentBreakdown segments={data.businessModel.segments} delay={20} />
          </div>
        </Anim>
      </div>
    </Scene>
  );
};
