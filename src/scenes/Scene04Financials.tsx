import React from "react";
import { C } from "../components/Tokens";
import { Anim, Card, Heading, HL, Scene, Text } from "../components/Primitives";
import { MultiYearChart } from "../components/MultiYearChart";
import { IPOData } from "../types/ipo";

export const Scene04Financials: React.FC<{ data: IPOData }> = ({ data }) => {
  const fin = data.financials;

  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 04 / 08 • FINANCIAL HEALTH"
        badgeColor={C.green}
        title={
          <>
            3-Year Financials: <HL color={C.green}>Growth & Profitability</HL>
          </>
        }
        subtitle="Historical statement trajectory: Revenue, operating margins, PAT turnaround, and balance sheet"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 6 }}>
        {/* Main Chart Card */}
        <Anim delay={5}>
          <MultiYearChart
            years={fin.years}
            revenueValues={fin.revenue.valuesFormatted}
            revenueRawCr={fin.revenue.rawCr}
            cagr={fin.revenue.cagr}
            ebitdaMargins={fin.ebitda.marginsPercent}
            patValues={fin.pat.valuesFormatted}
            delay={15}
          />
        </Anim>

        {/* Balance Sheet & Cash Flow Health Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          <Anim delay={24}>
            <Card style={{ padding: "16px 20px" }}>
              <Text size={12} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Debt-to-Equity
              </Text>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.green, marginTop: 4 }}>
                {fin.balanceSheet.debtToEquity}
              </div>
              <Text size={11} color={C.textMuted} style={{ marginTop: 2 }}>
                Conservative leverage
              </Text>
            </Card>
          </Anim>

          <Anim delay={30}>
            <Card style={{ padding: "16px 20px" }}>
              <Text size={12} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Cash From Operations
              </Text>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.cyan, marginTop: 4 }}>
                {fin.balanceSheet.cashFromOperations}
              </div>
              <Text size={11} color={C.textMuted} style={{ marginTop: 2 }}>
                Positive cash generation
              </Text>
            </Card>
          </Anim>

          <Anim delay={36}>
            <Card style={{ padding: "16px 20px" }}>
              <Text size={12} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Return on Net Worth (RoNW)
              </Text>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.yellow, marginTop: 4 }}>
                {fin.balanceSheet.ronwFormatted}
              </div>
              <Text size={11} color={C.textMuted} style={{ marginTop: 2 }}>
                Capital efficiency
              </Text>
            </Card>
          </Anim>

          <Anim delay={42}>
            <Card style={{ padding: "16px 20px" }}>
              <Text size={12} color={C.textMuted} weight={700} style={{ textTransform: "uppercase" }}>
                Profitability Status
              </Text>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.green, marginTop: 4 }}>
                {fin.pat.isProfitableNow ? "Profitable ✅" : "Loss Making ⚠️"}
              </div>
              <Text size={11} color={C.textMuted} style={{ marginTop: 2 }}>
                Latest FY Net Margin: {fin.pat.marginsPercent[2]}
              </Text>
            </Card>
          </Anim>
        </div>
      </div>
    </Scene>
  );
};
