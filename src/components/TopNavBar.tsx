import React from "react";
import { C, FONT } from "./Tokens";
import { CompanyLogo } from "./CompanyLogo";
import { IPOData } from "../types/ipo";

interface TopNavBarProps {
  data: IPOData;
  activeChapterTitle?: string;
  activeChapterIndex?: number;
  totalChapters?: number;
  style?: React.CSSProperties;
}

/**
 * Simplified centered brand mark:
 * Just the company logo (large) and company name, centered at the top.
 * Completely borderless and transparent without any navbar container or background.
 */
export const TopNavBar: React.FC<TopNavBarProps> = ({ data, style = {} }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 75,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        zIndex: 50,
        pointerEvents: "none",
        ...style,
      }}
    >
      <CompanyLogo
        size={56}
        logoUrl={data.logoUrl}
        logoUrls={data.logoUrls}
        domain={data.domain}
        companyName={data.companyName}
        initials={data.logoInitials}
        bgColor={data.logoBgColor || C.blueDark}
        scale={1.12}
      />
      <span
        style={{
          fontFamily: FONT.heading,
          fontSize: 26,
          fontWeight: 800,
          color: C.text,
          letterSpacing: "-0.01em",
          textShadow: "0 2px 16px rgba(0, 0, 0, 0.7)",
        }}
      >
        {data.companyName}
      </span>
    </div>
  );
};
