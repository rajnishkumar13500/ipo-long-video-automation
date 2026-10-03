import React from "react";
import { C } from "../components/Tokens";
import { Anim, Heading, HL, Scene } from "../components/Primitives";
import { PeerComparisonTable } from "../components/PeerComparisonTable";
import { IPOData } from "../types/ipo";

export const Scene06Peers: React.FC<{ data: IPOData }> = ({ data }) => {
  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 06 / 08 • VALUATION & PEERS"
        badgeColor={C.purple}
        title={
          <>
            Valuation: Is it <HL color={C.purple}>Cheap or Expensive</HL>?
          </>
        }
        subtitle="Benchmarking against listed market rivals on P/E, P/B, EV/EBITDA, and Return on Equity"
      />

      <div style={{ marginTop: 10 }}>
        <Anim delay={5}>
          <PeerComparisonTable
            table={data.peers.table}
            industryAveragePe={data.peers.industryAveragePe}
            commentary={data.peers.commentary}
          />
        </Anim>
      </div>
    </Scene>
  );
};
