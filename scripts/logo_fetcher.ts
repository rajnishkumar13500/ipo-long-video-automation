import fs from "fs";
import path from "path";
import { IPOData } from "../src/types/ipo";

export interface FetchLogoOptions {
  companyName: string;
  slug: string;
  domain?: string;
  articleHtml?: string;
}

export interface FetchLogoResult {
  success: boolean;
  localPath: string; // Guaranteed to exist on disk in public/logos/
  resolvedUrl: string;
  sourceUrl?: string;
  provider: string;
  sizeBytes: number;
}

/**
 * Validates if an image buffer is genuine and not an HTML error or generic placeholder
 */
export function isValidImageBuffer(buffer: Buffer, contentType?: string | null): boolean {
  if (!buffer || buffer.length < 500) {
    return false;
  }

  // Reject HTML error responses that return 200 OK
  const textHead = buffer.subarray(0, 200).toString("utf-8").toLowerCase();
  if (
    textHead.includes("<!doctype html") ||
    textHead.includes("<html") ||
    textHead.includes("<body") ||
    textHead.includes("404 not found") ||
    textHead.includes("access denied") ||
    textHead.includes("not found")
  ) {
    return false;
  }

  // Reject Google default grey globe placeholder (1140-1160 bytes, 2557 bytes, or 726 bytes)
  if (buffer.length >= 1140 && buffer.length <= 1160) {
    return false;
  }
  if (buffer.length === 2557 || buffer.length === 726) {
    return false;
  }

  // Reject DuckDuckGo default placeholder (282 bytes or 742 bytes)
  if (buffer.length === 282 || buffer.length === 742) {
    return false;
  }

  // Magic bytes inspection
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isIco = buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00;
  const isWebp = buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  const isSvg = textHead.includes("<svg") || (contentType && contentType.includes("svg"));

  // Reject .ico files that are only 16x16 low-res placeholders
  if (isIco && buffer.length < 2000) {
    return false;
  }

  return Boolean(isPng || isJpg || isWebp || isSvg);
}

/**
 * Searches Groww IPO database for official high-resolution company logos
 */
export async function fetchGrowwIpoLogo(companyName: string): Promise<{ url: string; buffer: Buffer } | null> {
  try {
    const cleanQuery = companyName
      .replace(/\s*(?:IPO|Alert|Update|Review|Details|Date|Price|Limited|Ltd|Pvt|Private)\b/gi, "")
      .trim();

    const searchUrl = `https://groww.in/v1/api/search/v1/entity?app=false&entity_type=ipo&q=${encodeURIComponent(cleanQuery)}&size=3`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const entities = data.content || [];

    for (const ent of entities) {
      const searchId = ent.search_id || ent.id;
      if (!searchId) continue;

      const pageUrl = `https://groww.in/ipo/${searchId}`;
      const pageRes = await fetch(pageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!pageRes.ok) continue;
      const html = await pageRes.text();
      const logoMatch = html.match(/https?:\/\/assets-netstorage\.groww\.in\/stocks-ipo\/logos\/[^\s"']+/i);

      if (logoMatch && logoMatch[0]) {
        const imgUrl = logoMatch[0];
        const imgRes = await fetch(imgUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (isValidImageBuffer(buf, imgRes.headers.get("content-type"))) {
            return { url: imgUrl, buffer: buf };
          }
        }
      }
    }
  } catch (err) {
    // Non-fatal, cascade to next provider
  }
  return null;
}

/**
 * Extracts candidate website domain from article HTML
 */
export function extractDomainFromHtml(html: string): string | null {
  if (!html) return null;

  const anchorMatch = html.match(
    /(?:website|official website|company website|portal)[^<]*<a[^>]+href=["'](https?:\/\/[^"']+)["']/i
  );
  if (anchorMatch && anchorMatch[1]) {
    try {
      const u = new URL(anchorMatch[1]);
      if (!u.hostname.includes("ipowatch.in") && !u.hostname.includes("chittorgarh.com")) {
        return u.hostname.replace(/^www\./i, "");
      }
    } catch {}
  }

  const plainMatch = html.match(
    /(?:website|official website|portal)\s*[:–-]\s*(?:https?:\/\/)?(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  );
  if (plainMatch && plainMatch[1]) {
    return plainMatch[1].replace(/^www\./i, "");
  }

  return null;
}

/**
 * Generates candidate domains for a company
 */
export function buildCandidateDomains(domain?: string, companyName?: string): string[] {
  const domains: string[] = [];

  if (domain && domain.trim()) {
    const clean = domain
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0]
      .trim();

    if (clean.includes(".")) {
      domains.push(clean);
      if (clean.endsWith(".com")) {
        const base = clean.replace(/\.com$/, "");
        domains.push(`${base}.in`, `${base}.co.in`);
      } else if (clean.endsWith(".in")) {
        const base = clean.replace(/\.co\.in$/, "").replace(/\.in$/, "");
        domains.push(`${base}.com`);
      }
    }
  }

  if (companyName) {
    const simplified = companyName
      .toLowerCase()
      .replace(/\s*(?:pvt|ltd|limited|private|technologies|solutions|industries|india|infra|holdings|services|enterprise|enterprises)\b/gi, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

    if (simplified.length >= 3) {
      const dCom = `${simplified}.com`;
      const dIn = `${simplified}.in`;
      if (!domains.includes(dCom)) domains.push(dCom);
      if (!domains.includes(dIn)) domains.push(dIn);
    }
  }

  return Array.from(new Set(domains));
}

/**
 * Derives 2-letter executive monogram initials
 */
export function getInitials(name: string): string {
  const clean = name.replace(/\s*(?:IPO|Alert|Update|Review|Details|Date|Price|Limited|Ltd|Pvt|Private)\b/gi, "").trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2 && words[0] && words[1]) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "IP";
}

/**
 * Deterministically generates a branded vector SVG icon badge
 * Guarantees on-disk asset exists so Remotion never encounters 404 or EncodingError
 */
export function generateBrandedVectorBadge(companyName: string, initials: string, outFilePath: string): Buffer {
  const displayInitials = initials || getInitials(companyName);
  const cleanName = companyName.toUpperCase().replace(/\s*(?:IPO|LTD|LIMITED|PVT|PRIVATE)\b/g, "").trim().slice(0, 18);

  // Deterministic color palette derived from company name hash
  const colors = [
    { bg: "#E11D48", text: "#FFFFFF", border: "#BE123C", accent: "#FFE4E6" }, // Rose
    { bg: "#2563EB", text: "#FFFFFF", border: "#1D4ED8", accent: "#DBEAFE" }, // Blue
    { bg: "#059669", text: "#FFFFFF", border: "#047857", accent: "#D1FAE5" }, // Emerald
    { bg: "#7C3AED", text: "#FFFFFF", border: "#6D28D9", accent: "#EDE9FE" }, // Violet
    { bg: "#D97706", text: "#FFFFFF", border: "#B45309", accent: "#FEF3C7" }, // Amber
    { bg: "#0891B2", text: "#FFFFFF", border: "#0E7490", accent: "#CFFAFE" }, // Cyan
    { bg: "#DC2626", text: "#FFFFFF", border: "#B91C1C", accent: "#FEE2E2" }, // Red
  ];

  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = (hash << 5) - hash + companyName.charCodeAt(i);
    hash |= 0;
  }
  const theme = colors[Math.abs(hash) % colors.length];

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg}" />
      <stop offset="100%" stop-color="${theme.border}" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bgGrad)" stroke="${theme.border}" stroke-width="8" filter="url(#shadow)" />
  <rect x="24" y="24" width="464" height="464" rx="80" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4" />
  <text x="256" y="295" font-family="'Outfit', 'Inter', 'Segoe UI', Arial, sans-serif" font-size="190" font-weight="900" fill="${theme.text}" text-anchor="middle" letter-spacing="-4">${displayInitials}</text>
  <rect x="76" y="360" width="360" height="54" rx="27" fill="rgba(0,0,0,0.25)" />
  <text x="256" y="396" font-family="'Outfit', 'Inter', 'Segoe UI', Arial, sans-serif" font-size="26" font-weight="800" fill="${theme.accent}" text-anchor="middle" letter-spacing="2">${cleanName}</text>
</svg>`;

  const buffer = Buffer.from(svgContent, "utf-8");
  fs.writeFileSync(outFilePath, buffer);
  return buffer;
}

/**
 * Robust Multi-Tier Company Logo Engine
 */
export async function fetchAndCacheCompanyLogo(opts: FetchLogoOptions): Promise<FetchLogoResult> {
  const { companyName, slug, domain, articleHtml } = opts;
  const logosDir = path.resolve(__dirname, "../public/logos");
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  const localFileName = `${slug}.png`;
  const localFilePath = path.join(logosDir, localFileName);
  const relativePublicPath = `logos/${localFileName}`;

  // 1. If already downloaded and valid (> 500 bytes and not generic placeholder), reuse
  if (fs.existsSync(localFilePath)) {
    const buf = fs.readFileSync(localFilePath);
    if (isValidImageBuffer(buf)) {
      console.log(`   🎨 [Logo Engine] Using verified local logo: ${relativePublicPath} (${buf.length} bytes)`);
      return {
        success: true,
        localPath: relativePublicPath,
        resolvedUrl: relativePublicPath,
        provider: "local_cache",
        sizeBytes: buf.length,
      };
    } else {
      console.log(`   ⚠️ [Logo Engine] Cached logo file is a placeholder/invalid. Refreshing...`);
    }
  }

  console.log(`   🔍 [Logo Engine] Resolving brand logo for "${companyName}"...`);

  // Tier 1: Groww IPO CDN (India's official IPO logo database)
  const growwResult = await fetchGrowwIpoLogo(companyName);
  if (growwResult && isValidImageBuffer(growwResult.buffer)) {
    fs.writeFileSync(localFilePath, growwResult.buffer);
    console.log(`   ✅ [Logo Engine] Retrieved official logo via Groww IPO CDN (${growwResult.buffer.length} bytes)`);
    console.log(`      Saved to: public/${relativePublicPath}`);
    return {
      success: true,
      localPath: relativePublicPath,
      resolvedUrl: relativePublicPath,
      sourceUrl: growwResult.url,
      provider: "Groww IPO CDN",
      sizeBytes: growwResult.buffer.length,
    };
  }

  // Tier 2: Domain Favicons & Web Brand CDNs Cascade
  const resolvedDomain = domain || (articleHtml ? extractDomainFromHtml(articleHtml) : null);
  const candidateDomains = buildCandidateDomains(resolvedDomain || undefined, companyName);

  for (const cd of candidateDomains) {
    const providers = [
      { name: "Google Favicon High-Res", url: `https://www.google.com/s2/favicons?domain=${cd}&sz=256` },
      { name: "Unavatar Multi-Engine", url: `https://unavatar.io/${cd}?fallback=false` },
      { name: "DuckDuckGo Favicon", url: `https://icons.duckduckgo.com/ip3/${cd}.ico` },
      { name: "Icon Horse CDN", url: `https://icon.horse/icon/${cd}` },
      { name: "Apple Touch Icon", url: `https://${cd}/apple-touch-icon.png` },
      { name: "Direct Root Favicon", url: `https://${cd}/favicon.ico` },
    ];

    for (const p of providers) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(p.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "image/png,image/jpeg,image/webp,image/svg+xml,image/*,*/*;q=0.8",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const buf = Buffer.from(await res.arrayBuffer());
        if (isValidImageBuffer(buf, res.headers.get("content-type"))) {
          fs.writeFileSync(localFilePath, buf);
          console.log(`   ✅ [Logo Engine] Retrieved verified icon via [${p.name}] (${buf.length} bytes from ${cd})`);
          console.log(`      Saved to: public/${relativePublicPath}`);
          return {
            success: true,
            localPath: relativePublicPath,
            resolvedUrl: relativePublicPath,
            sourceUrl: p.url,
            provider: p.name,
            sizeBytes: buf.length,
          };
        }
      } catch {}
    }
  }

  // Tier 3: Zero-Failure Guaranteed Branded Vector Badge Fallback
  console.log(`   🎨 [Logo Engine] Generating crisp vector executive badge for "${companyName}"...`);
  const vectorBuffer = generateBrandedVectorBadge(companyName, getInitials(companyName), localFilePath);
  console.log(`   ✅ [Logo Engine] Generated verified on-disk vector icon: public/${relativePublicPath} (${vectorBuffer.length} bytes)`);

  return {
    success: true,
    localPath: relativePublicPath,
    resolvedUrl: relativePublicPath,
    provider: "Generated Branded Vector Badge",
    sizeBytes: vectorBuffer.length,
  };
}

/**
 * Ensures an IPOData object has a verified on-disk logo before video render
 */
export async function ensureVerifiedCompanyLogo(data: IPOData): Promise<FetchLogoResult> {
  const result = await fetchAndCacheCompanyLogo({
    companyName: data.companyName,
    slug: data.id,
    domain: data.domain,
  });

  data.logoUrl = result.localPath;
  if (!data.logoInitials) {
    data.logoInitials = getInitials(data.companyName);
  }

  return result;
}
