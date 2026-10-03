import React, { useMemo, useState } from "react";
import { Img } from "remotion";
import { C } from "./Tokens";

export interface CompanyLogoProps {
  logoUrl?: string;
  logoUrls?: string[];
  domain?: string;
  companyName: string;
  initials?: string;
  size?: number;
  bgColor?: string;
  padding?: number;
  scale?: number;
  style?: React.CSSProperties;
}

export function getInitials(name: string, fallback?: string): string {
  if (fallback && fallback.trim()) return fallback.trim().slice(0, 2).toUpperCase();
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "IP";
}

export function buildLogoCandidateSources(opts: {
  logoUrl?: string;
  logoUrls?: string[];
  domain?: string;
}): string[] {
  const candidates: string[] = [];

  // Priority 1: Explicit direct URL
  if (opts.logoUrl && opts.logoUrl.trim()) {
    candidates.push(opts.logoUrl.trim());
  }

  // Priority 2: Custom multi-source URLs
  if (opts.logoUrls && Array.isArray(opts.logoUrls)) {
    for (const url of opts.logoUrls) {
      if (url && url.trim() && !candidates.includes(url.trim())) {
        candidates.push(url.trim());
      }
    }
  }

  // Priority 3: The 3 Reliable Logo & Favicon Services
  if (opts.domain && opts.domain.trim()) {
    const cleanDomain = opts.domain
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .trim();

    if (cleanDomain) {
      // Site 1: Google Favicon High-Res API (sz=256)
      const s1 = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`;
      // Site 2: Unavatar Multi-Engine Service (aggregates Clearbit, Google, Favicon, DDG)
      const s2 = `https://unavatar.io/${cleanDomain}`;
      // Site 3: Icon Horse Icon CDN (direct web-icon scraper)
      const s3 = `https://icon.horse/icon/${cleanDomain}`;
      // Site 4 (extra backup): DuckDuckGo Favicon
      const s4 = `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`;

      [s1, s2, s3, s4].forEach((url) => {
        if (!candidates.includes(url)) {
          candidates.push(url);
        }
      });
    }
  }

  return candidates;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  logoUrl,
  logoUrls,
  domain,
  companyName,
  initials,
  size = 58,
  bgColor = "#FFFFFF",
  padding,
  scale = 1.15,
  style = {},
}) => {
  const candidateUrls = useMemo(
    () => buildLogoCandidateSources({ logoUrl, logoUrls, domain }),
    [logoUrl, logoUrls, domain]
  );

  const [sourceIndex, setSourceIndex] = useState(0);

  const displayInitials = getInitials(companyName, initials);
  const borderRadius = Math.round(size * 0.22);
  const borderWidth = Math.max(3, Math.round(size * 0.05));
  const shadowOffset = Math.max(2, Math.round(size * 0.04));
  // Minimal inner padding so logo fills the square tile as requested
  const innerPadding = padding !== undefined ? padding : Math.max(2, Math.round(size * 0.04));
  const fontSize = Math.round(size * 0.44);

  // Strict bounding box guarantees identical sizing across wide, square, or tall logos
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    maxWidth: size,
    maxHeight: size,
    flexShrink: 0,
    borderRadius,
    background: bgColor,
    border: `${borderWidth}px solid ${C.border}`,
    boxShadow: `${shadowOffset}px ${shadowOffset}px 0px ${C.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxSizing: "border-box",
    padding: innerPadding,
    ...style,
  };

  const hasCandidate = sourceIndex < candidateUrls.length;

  if (hasCandidate) {
    const currentUrl = candidateUrls[sourceIndex];
    return (
      <div style={containerStyle}>
        <Img
          src={currentUrl}
          onError={() => {
            // Graceful fallback to next site URL
            setSourceIndex((prev) => prev + 1);
          }}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            display: "block",
            transform: scale !== 1 ? `scale(${scale})` : undefined,
          }}
        />
      </div>
    );
  }

  // Final Fallback: Stylized Monogram Avatar
  return (
    <div
      style={{
        ...containerStyle,
        padding: 0,
        background: bgColor === "#FFFFFF" ? C.yellow : bgColor,
      }}
    >
      <span
        style={{
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          fontSize,
          fontWeight: 800,
          color: C.black,
          letterSpacing: -0.5,
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        {displayInitials}
      </span>
    </div>
  );
};
