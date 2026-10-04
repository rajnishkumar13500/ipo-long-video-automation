import React, { useMemo, useState } from "react";
import { Img, staticFile } from "remotion";
import { C, FONT } from "./Tokens";

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

  const resolveUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    // If local asset in public/ folder, wrap with staticFile()
    if (trimmed.startsWith("logos/") || trimmed.startsWith("/logos/")) {
      return staticFile(trimmed.replace(/^\//, ""));
    }
    return trimmed;
  };

  // Priority 1: Explicit direct URL or local path
  if (opts.logoUrl && opts.logoUrl.trim()) {
    candidates.push(resolveUrl(opts.logoUrl));
  }

  // Priority 2: Custom multi-source URLs
  if (opts.logoUrls && Array.isArray(opts.logoUrls)) {
    for (const url of opts.logoUrls) {
      const resolved = resolveUrl(url);
      if (resolved && !candidates.includes(resolved)) {
        candidates.push(resolved);
      }
    }
  }

  // Priority 3: Online providers ONLY IF logoUrl is undefined (not explicitly disabled with "")
  if (opts.logoUrl === undefined && opts.domain && opts.domain.trim()) {
    const cleanDomain = opts.domain
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .trim();

    if (cleanDomain) {
      const providers = [
        `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`,
        `https://unavatar.io/${cleanDomain}?fallback=false`,
        `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`,
        `https://icon.horse/icon/${cleanDomain}`,
      ];

      for (const p of providers) {
        if (!candidates.includes(p)) {
          candidates.push(p);
        }
      }
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
            // Graceful fallback to next provider in cascade
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

  // Final Fallback: Stylized Executive Neo-Brutalist Monogram Avatar
  return (
    <div
      style={{
        ...containerStyle,
        padding: 0,
        background: bgColor === "#FFFFFF" ? C.yellow : bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: FONT.heading,
          fontSize,
          fontWeight: 800,
          color: C.black,
          letterSpacing: "-0.03em",
          userSelect: "none",
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        {displayInitials}
      </span>
    </div>
  );
};
