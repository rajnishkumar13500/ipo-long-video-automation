import React from "react";
import { C } from "./Tokens";
import { Card, Text } from "./Primitives";
import { PeerComparisonRow } from "../types/ipo";

interface PeerComparisonTableProps {
  table: PeerComparisonRow[];
  industryAveragePe: string;
  commentary?: string;
}

export const PeerComparisonTable: React.FC<PeerComparisonTableProps> = ({
  table,
  industryAveragePe,
  commentary,
}) => {
  return (
    <Card style={{ flex: 1, padding: "26px 30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Text size={22} weight={700}>
            Valuation Multiples & Peer Benchmarking
          </Text>
          {commentary && (
            <Text size={14} color={C.textMuted} weight={500} style={{ marginTop: 4 }}>
              {commentary}
            </Text>
          )}
        </div>
        <div
          style={{
            background: `${C.purple}20`,
            border: `1.5px solid ${C.purple}4D`,
            borderRadius: 8,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 13, color: C.textMuted }}>Industry Median P/E:</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: C.purple }}>
            {industryAveragePe}
          </span>
        </div>
      </div>

      {/* Financial Table */}
      <div style={{ width: "100%", overflow: "hidden", borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(30, 41, 59, 0.7)", borderBottom: `1px solid ${C.borderLight}` }}>
              <th style={{ padding: "12px 18px", fontSize: 13, color: C.textMuted, textTransform: "uppercase" }}>
                Company Name
              </th>
              <th style={{ padding: "12px 14px", fontSize: 13, color: C.textMuted, textTransform: "uppercase" }}>
                P/E Ratio
              </th>
              <th style={{ padding: "12px 14px", fontSize: 13, color: C.textMuted, textTransform: "uppercase" }}>
                P/B Ratio
              </th>
              <th style={{ padding: "12px 14px", fontSize: 13, color: C.textMuted, textTransform: "uppercase" }}>
                EV / EBITDA
              </th>
              <th style={{ padding: "12px 14px", fontSize: 13, color: C.textMuted, textTransform: "uppercase" }}>
                Revenue
              </th>
              <th style={{ padding: "12px 14px", fontSize: 13, color: C.textMuted, textTransform: "uppercase" }}>
                PAT (Profit)
              </th>
              <th style={{ padding: "12px 18px", fontSize: 13, color: C.textMuted, textTransform: "uppercase" }}>
                RoNW %
              </th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, idx) => {
              const isTarget = Boolean(row.isTargetCompany);
              return (
                <tr
                  key={idx}
                  style={{
                    background: isTarget ? "rgba(59, 130, 246, 0.12)" : idx % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.02)",
                    borderBottom: idx < table.length - 1 ? `1px solid ${C.border}` : "none",
                    borderLeft: isTarget ? `4px solid ${C.cyan}` : "none",
                  }}
                >
                  <td style={{ padding: "14px 18px", fontWeight: isTarget ? 800 : 600, color: isTarget ? C.cyan : C.text, fontSize: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{row.name}</span>
                      {isTarget && (
                        <span
                          style={{
                            background: C.blue,
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          IPO
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 14px", fontWeight: 700, color: isTarget ? C.green : C.text, fontSize: 15 }}>
                    {row.peRatio}
                  </td>
                  <td style={{ padding: "14px 14px", color: C.textMuted, fontSize: 15 }}>
                    {row.pbRatio || "—"}
                  </td>
                  <td style={{ padding: "14px 14px", color: C.textMuted, fontSize: 15 }}>
                    {row.evEbitda || "—"}
                  </td>
                  <td style={{ padding: "14px 14px", color: C.text, fontSize: 15 }}>
                    {row.revenueFormatted}
                  </td>
                  <td style={{ padding: "14px 14px", color: C.green, fontWeight: 600, fontSize: 15 }}>
                    {row.patFormatted}
                  </td>
                  <td style={{ padding: "14px 18px", color: C.text, fontWeight: 700, fontSize: 15 }}>
                    {row.ronwFormatted}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
