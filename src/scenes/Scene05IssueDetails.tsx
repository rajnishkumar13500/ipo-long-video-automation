import React from "react";
import { C } from "../components/Tokens";
import { Anim, Card, Heading, HL, Scene, Text } from "../components/Primitives";
import { ObjectsOfIssue } from "../components/ObjectsOfIssue";
import { IPOData } from "../types/ipo";

export const Scene05IssueDetails: React.FC<{ data: IPOData }> = ({ data }) => {
  const issue = data.issue;

  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 05 / 08 • ISSUE STRUCTURE"
        badgeColor={C.blue}
        title={
          <>
            Issue Breakdown & <HL color={C.blue}>Use of Proceeds</HL>
          </>
        }
        subtitle="Where will your capital be deployed? Fresh capital investment vs promoter OFS exit"
      />

      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: 24, marginTop: 10 }}>
        {/* Left Column: Key Parameters & Quota */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Anim delay={5}>
            <Card style={{ padding: "24px 28px" }}>
              <Text size={14} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Total Issue Capital
              </Text>
              <div style={{ fontSize: 40, fontWeight: 900, color: C.yellow, marginTop: 4 }}>
                {issue.totalFormatted}
              </div>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: C.textMuted }}>Price Band</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{issue.priceBand}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: C.textMuted }}>Market Lot</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{issue.lotSize}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: C.textMuted }}>Min Retail Capital</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.cyan }}>{issue.minInvestment}</span>
                </div>
              </div>
            </Card>
          </Anim>

          {/* Quota Distribution */}
          <Anim delay={16}>
            <Card style={{ padding: "20px 24px" }}>
              <Text size={14} color={C.textMuted} weight={700} style={{ textTransform: "uppercase", marginBottom: 12 }}>
                Investor Category Quota
              </Text>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "10px", borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>QIB</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.blue, marginTop: 2 }}>
                    {issue.qibQuota || "50%"}
                  </div>
                </div>
                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "10px", borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>NII / HNI</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.yellow, marginTop: 2 }}>
                    {issue.niiQuota || "15%"}
                  </div>
                </div>
                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "10px", borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Retail</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.green, marginTop: 2 }}>
                    {issue.retailQuota || "35%"}
                  </div>
                </div>
              </div>
            </Card>
          </Anim>
        </div>

        {/* Right Column: Objects of the Issue & Fresh vs OFS */}
        <Anim delay={12}>
          <ObjectsOfIssue
            freshTotalFormatted={issue.freshFormatted}
            ofsTotalFormatted={issue.ofsFormatted}
            freshPercent={issue.freshPercent}
            ofsPercent={issue.ofsPercent}
            objects={issue.objectsOfIssue}
            delay={18}
          />
        </Anim>
      </div>
    </Scene>
  );
};
