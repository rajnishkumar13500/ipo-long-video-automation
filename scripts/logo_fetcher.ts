import fs from "fs";
import path from "path";
import { IPOData } from "../src/types/ipo";

export interface LogoFetchResult {
  success: boolean;
  localPath?: string;
  sourceUrl?: string;
  provider?: string;
  sizeBytes?: number;
}

/**
 * Normalizes a website domain string
 */
export function cleanDomainString(domainOrUrl?: string, companyName?: string): string {
  if (domainOrUrl && domainOrUrl.trim()) {
    const d = domainOrUrl
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .trim();

    if (d && d.includes(".")) {
      return d;
    }
  }

  // Derive plausible domain from company name if not provided
  if (companyName) {
    const simplified = companyName
      .toLowerCase()
      .replace(/\s*(pvt|ltd|limited|private|technologies|solutions|industries|india|infra|holdings|services)\b/gi, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

    if (simplified.length >= 3) {
      return `${simplified}.com`;
    }
  }

  return "";
}

/**
 * Generates plausible candidate domains (including .com, .in, and .co.in variations)
 */
export function buildCandidateDomains(domainOrUrl?: string, companyName?: string): string[] {
  const domains: string[] = [];
  const primary = cleanDomainString(domainOrUrl, companyName);

  if (primary) {
    domains.push(primary);
    if (primary.endsWith(".com")) {
      const base = primary.replace(/\.com$/, "");
      domains.push(`${base}.in`);
      domains.push(`${base}.co.in`);
    } else if (primary.endsWith(".in")) {
      const base = primary.replace(/\.co\.in$/, "").replace(/\.in$/, "");
      domains.push(`${base}.com`);
    }
  }

  if (companyName) {
    const simplified = companyName
      .toLowerCase()
      .replace(/\s*(pvt|ltd|limited|private|technologies|solutions|industries|india|infra|holdings|services)\b/gi, "")
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
 * Verifies if an image buffer is a genuine, non-placeholder icon
 */
export function isValidImageBuffer(buffer: Buffer, contentType?: string | null): boolean {
  // 1. Must have minimum size (placeholder icons & 1x1 pixels are usually < 350 bytes)
  if (!buffer || buffer.length < 400) {
    return false;
  }

  // 2. Reject HTML error responses that return 200 OK
  const textHead = buffer.subarray(0, 150).toString("utf-8").toLowerCase();
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

  // 3. Inspect magic bytes for common image types
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isIco = buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00;
  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  const isSvg = textHead.includes("<svg") || (contentType && contentType.includes("svg"));

  if (!isPng && !isJpg && !isIco && !isWebp && !isSvg) {
    return false;
  }

  // 4. Reject Google's generic grey default globe icon
  // Google returns a 256px generic globe of approx 1140-1160 bytes or 2557 bytes when no favicon exists
  if (buffer.length >= 1140 && buffer.length <= 1160) {
    return false;
  }
  if (buffer.length === 2557) {
    return false;
  }

  // 5. Reject DuckDuckGo default generic globe icon (282 bytes or 742 bytes)
  if (buffer.length === 282 || buffer.length === 742) {
    return false;
  }

  return true;
}

/**
 * Robust, multi-provider logo fetching and verification cascade.
 * Tries multiple independent websites across domains with timeout failovers and downloads the verified file locally.
 */
export async function fetchAndVerifyCompanyLogo(
  companyName: string,
  rawDomain?: string,
  slug?: string
): Promise<LogoFetchResult> {
  const targetSlug = slug || companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const candidateDomains = buildCandidateDomains(rawDomain, companyName);

  if (candidateDomains.length === 0) {
    console.log(`   ℹ️ [Logo Fetcher] No valid domain could be derived for "${companyName}". Using verified monogram avatar.`);
    return { success: false };
  }

  const logosDir = path.resolve(__dirname, "../public/logos");
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  const outFileName = `${targetSlug}.png`;
  const outFilePath = path.join(logosDir, outFileName);
  const relativeRemotionPath = `logos/${outFileName}`;

  // If already locally cached and valid, reuse it
  if (fs.existsSync(outFilePath) && fs.statSync(outFilePath).size > 400) {
    console.log(`   ⚡ [Logo Fetcher] Local verified logo found: ${relativeRemotionPath}`);
    return {
      success: true,
      localPath: relativeRemotionPath,
      provider: "local_cache",
      sizeBytes: fs.statSync(outFilePath).size,
    };
  }

  console.log(`   🔍 [Logo Fetcher] Searching icon for "${companyName}" across ${candidateDomains.length} domain(s)...`);

  for (const domain of candidateDomains) {
    // ── Multi-Website Candidate Sources Cascade ──────────────────────────────
    const candidateProviders = [
      {
        name: "Google Favicon High-Res",
        url: `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      },
      {
        name: "Unavatar Multi-Engine",
        url: `https://unavatar.io/${domain}?fallback=false`,
      },
      {
        name: "DuckDuckGo Favicon",
        url: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      },
      {
        name: "Icon Horse CDN",
        url: `https://icon.horse/icon/${domain}`,
      },
      {
        name: "Favicon.im CDN",
        url: `https://favicon.im/${domain}?larger=true`,
      },
      {
        name: "Direct Root Favicon",
        url: `https://${domain}/favicon.ico`,
      },
      {
        name: "Direct Apple Touch Icon",
        url: `https://${domain}/apple-touch-icon.png`,
      },
    ];

    for (const provider of candidateProviders) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(provider.url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          continue;
        }

        const contentType = res.headers.get("content-type");
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (isValidImageBuffer(buffer, contentType)) {
          fs.writeFileSync(outFilePath, buffer);
          console.log(
            `   ✅ [Logo Fetcher] Successfully retrieved & verified icon via [${provider.name}] (${buffer.length} bytes)`
          );
          console.log(`      Saved locally to: public/${relativeRemotionPath}`);

          return {
            success: true,
            localPath: relativeRemotionPath,
            sourceUrl: provider.url,
            provider: provider.name,
            sizeBytes: buffer.length,
          };
        }
      } catch (_) {
        // Continue to next provider in cascade
      }
    }
  }

  console.log(
    `   ℹ️ [Logo Fetcher] No verified icon available across fallback providers for "${companyName}". Verified fallback to executive monogram badge.`
  );

  return { success: false };
}

/**
 * Ensures an IPOData object has a verified local logo or clean monogram fallback
 */
export async function ensureVerifiedCompanyLogo(data: IPOData): Promise<LogoFetchResult> {
  const result = await fetchAndVerifyCompanyLogo(data.companyName, data.domain, data.id);

  if (result.success && result.localPath) {
    data.logoUrl = result.localPath;
  } else {
    data.logoUrl = ""; // Explicitly clear any stale external 404 URLs to prevent Remotion console errors
  }

  return result;
}
