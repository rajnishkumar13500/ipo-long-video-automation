import React from "react";
import { C } from "../components/Tokens";
import { Anim, Card, Heading, HL, Scene, Text } from "../components/Primitives";
import { CompanyLogo } from "../components/CompanyLogo";
import { IPOData } from "../types/ipo";

export const Scene01Hook: React.FC<{ data: IPOData }> = ({ data }) => {
  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 01 / 08 • THE HOOK"
        badgeColor={C.blue}
        title={
          <>
            Should you apply for the <HL color={C.blue}>{data.companyName}</HL> IPO?
          </>
        }
        subtitle="A complete fundamental breakdown for retail investors"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, marginTop: 10 }}>
        {/* Left: Hero Brand Card */}
        <Anim delay={5}>
          <Card
            style={{
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: 480,
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <CompanyLogo
                size={110}
                logoUrl={data.logoUrl}
                logoUrls={data.logoUrls}
                domain={data.domain}
                companyName={data.companyName}
                initials={data.logoInitials}
                bgColor={data.logoBgColor || C.blueDark}
                scale={1.15}
              />
              <div>
                <Text size={38} weight={800} color={C.text}>
                  {data.companyName}
                </Text>
                <Text size={18} color={C.textMuted} weight={500} style={{ marginTop: 6 }}>
                  {data.industry} • {data.exchange || "NSE • BSE"}
                </Text>
              </div>
            </div>

            {/* Core Value Proposition Card */}
            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                padding: "20px 24px",
                borderRadius: 14,
                border: `1px solid ${C.borderLight}`,
              }}
            >
              <Text size={15} color={C.cyan} weight={700} style={{ textTransform: "uppercase", marginBottom: 6 }}>
                Core Platform Engine
              </Text>
              <Text size={18} color={C.text} weight={500} style={{ lineHeight: 1.4 }}>
                {data.businessModel.headline}
              </Text>
            </div>

            {/* Tension Callout */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: `${C.yellow}1A`,
                border: `1px solid ${C.yellow}40`,
                padding: "14px 20px",
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>⚡</span>
              <Text size={16} color={C.yellow} weight={700}>
                Will it deliver massive listing gains or fizzle out? Let's analyze the data.
              </Text>
            </div>
          </Card>
        </Anim>

        {/* Right: Key Issue Parameter Grid */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 20 }}>
          <Anim delay={18}>
            <Card style={{ padding: "26px 30px", height: "100%", boxSizing: "border-box" }}>
              <Text size={14} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Total Issue Size
              </Text>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: C.yellow }}>
                  {data.issue.totalFormatted}
                </span>
                <span style={{ fontSize: 16, color: C.textMuted, fontWeight: 600 }}>
                  ({data.issue.freshPercent} Fresh • {data.issue.ofsPercent} OFS)
                </span>
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 24 }}>
                <div>
                  <span style={{ fontSize: 12, color: C.textMuted }}>Price Band</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.green, marginTop: 2 }}>
                    {data.issue.priceBand}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: C.textMuted }}>Lot Size</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 2 }}>
                    {data.issue.lotSize}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: C.textMuted }}>Min Investment</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.cyan, marginTop: 2 }}>
                    {data.issue.minInvestment}
                  </div>
                </div>
              </div>
            </Card>
          </Anim>

          <Anim delay={28}>
            <Card
              style={{
                padding: "26px 30px",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Text size={14} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                  Important IPO Timeline Dates
                </Text>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
                  <div>
                    <span style={{ fontSize: 12, color: C.textMuted }}>Bidding Window</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 2 }}>
                      {data.issue.biddingDates || "TBD"}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: C.textMuted }}>Listing Date</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.blue, marginTop: 2 }}>
                      {data.issue.listingDate || data.listingDate || "TBD"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: `1px solid ${C.blue}40`,
                  borderRadius: 10,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, color: C.textMuted }}>Retail Quota Allocation</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.blue }}>
                  {data.issue.retailQuota || "35%"} of Offer
                </span>
              </div>
            </Card>
          </Anim>
        </div>
      </div>
    </Scene>
  );
};
