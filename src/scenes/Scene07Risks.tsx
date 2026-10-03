import React from "react";
import { C } from "../components/Tokens";
import { Anim, Heading, HL, Scene } from "../components/Primitives";
import { RiskRadar } from "../components/RiskRadar";
import { IPOData } from "../types/ipo";

export const Scene07Risks: React.FC<{ data: IPOData }> = ({ data }) => {
  return (
    <Scene>
      <Heading
        chapterBadge="CHAPTER 07 / 08 • CRITICAL RISKS"
        badgeColor={C.red}
        title={
          <>
            Red Flags & <HL color={C.red}>Structural Risks</HL>
          </>
        }
        subtitle="Unsecured loan exposure, regulatory developments, and risk factors that could derail performance"
      />

      <div style={{ marginTop: 10 }}>
        <Anim delay={5}>
          <RiskRadar
            items={data.risks.items}
            overallRiskLevel={data.risks.overallRiskLevel}
            bottomNote={data.risks.bottomNote}
          />
        </Anim>
      </div>
    </Scene>
  );
};
