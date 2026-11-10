import fs from "fs";
import path from "path";
import { isIPOProcessed, normalizeName } from "./tracker";

export interface DiscoveredIPO {
  rawTitle: string;
  companyName: string;
  slug: string;
  link: string;
  pubDate: string;
  source?: string;
}

export function cleanCompanyName(title: string): string {
  let cleaned = title
    // 1. Remove CDATA
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    // Decode common HTML entities
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // 2. Remove parenthetical tags like (BSE SME), (NSE SME), (Mainboard), etc.
    .replace(/\(.*?\)/g, "")
    // 3. Remove leading editorial tags
    .replace(/^(?:IPO\s*(?:Alert|Update|Watch|Review|Details)?\s*[:\-–—]\s*)/i, "")
    // 4. Remove author suffixes like "Review by Dilip Davda"
    .replace(/Review\s+by\s+.*/i, "")
    // 5. Remove status badges attached to names (e.g. "SteelsListed" -> "Steels")
    .replace(/\b(?:Listed|Upcoming|Closed|Bidding|Allotment Out)\b/gi, "")
    .trim();

  // 6. If "IPO" appears as an isolated word, extract company name from the left side
  if (/\bIPO\b/i.test(cleaned)) {
    const parts = cleaned.split(/\bIPO\b/i);
    if (parts[0].trim().length >= 2) {
      cleaned = parts[0].trim();
    } else if (parts[1] && parts[1].trim().length >= 2) {
      cleaned = parts[1].trim();
    }
  }

  // 7. Strip trailing boilerplate terms that may occur
  cleaned = cleaned
    .replace(/\s*(?:Date|Review|Price|Details|Allotment|GMP|Subscription|Status|Analysis|Band|Size|Dates).*$/i, "")
    // 8. Strip trailing hyphens, colons, commas, or pipes
    .replace(/[\s\-–—,:|]+$/, "")
    // 9. Normalize spacing
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

/**
 * Source 1: Chittorgarh Mainboard & SME IPO Dashboard
 */
async function fetchChittorgarhIPOs(): Promise<DiscoveredIPO[]> {
  const urls = [
    "https://www.chittorgarh.com/ipo/ipo_dashboard.asp",
    "https://www.chittorgarh.com/ipo/ipo_dashboard.asp?a=sme",
  ];

  const results: DiscoveredIPO[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS });
      if (!res.ok) continue;
      const html = await res.text();

      // Matches: <a href="/ipo/<slug>-ipo/<id>/">Company Name</a>
      const regex = /<a[^>]+href="(\/ipo\/[a-z0-9-]+-ipo\/\d+\/)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(html)) !== null) {
        const pathUrl = match[1];
        const rawName = match[2].replace(/<[^>]+>/g, "").trim();
        const companyName = cleanCompanyName(rawName);

        if (companyName.length <= 2) continue;
        const norm = normalizeName(companyName);
        if (seen.has(norm)) continue;
        seen.add(norm);

        const slug = generateSlug(companyName);
        results.push({
          rawTitle: rawName,
          companyName,
          slug,
          link: `https://www.chittorgarh.com${pathUrl}`,
          pubDate: new Date().toISOString().split("T")[0],
          source: "Chittorgarh",
        });
      }
    } catch {
      // Continue to next source
    }
  }

  return results;
}

/**
 * Source 2: IPOWatch Upcoming IPOs & GMP Page
 */
async function fetchIPOWatchIPOs(): Promise<DiscoveredIPO[]> {
  const urls = [
    "https://ipowatch.in/upcoming-ipo-list/",
    "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/",
  ];

  const results: DiscoveredIPO[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS });
      if (!res.ok) continue;
      const html = await res.text();

      // Matches links like: <a href="https://ipowatch.in/<slug>-ipo-details/">...</a> or relative
      const regex = /<a[^>]+href="([^"]*(?:-ipo-details|-ipo)\/?)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(html)) !== null) {
        let link = match[1];
        if (link.startsWith("/")) link = `https://ipowatch.in${link}`;
        const rawName = match[2].replace(/<[^>]+>/g, "").trim();
        const companyName = cleanCompanyName(rawName);

        if (companyName.length <= 2) continue;
        if (/upcoming|grey market|gmp|subscription|allotment|review|list/i.test(companyName)) continue;

        const norm = normalizeName(companyName);
        if (seen.has(norm)) continue;
        seen.add(norm);

        const slug = generateSlug(companyName);
        results.push({
          rawTitle: rawName,
          companyName,
          slug,
          link,
          pubDate: new Date().toISOString().split("T")[0],
          source: "IPOWatch",
        });
      }
    } catch {
      // Continue to next source
    }
  }

  return results;
}

/**
 * Source 3: Unworked local IPO data files in src/data/*.json
 * Ensures offline or custom IPOs are automatically detected in pipeline
 */
export function getLocalUnprocessedIPOs(): DiscoveredIPO[] {
  const dataDir = path.resolve(__dirname, "../src/data");
  if (!fs.existsSync(dataDir)) return [];

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const results: DiscoveredIPO[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(dataDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(raw);
      if (json && json.companyName && json.id) {
        if (!isIPOProcessed(json.id) && !isIPOProcessed(json.companyName)) {
          results.push({
            rawTitle: json.companyName,
            companyName: json.companyName,
            slug: json.id,
            link: filePath,
            pubDate: json.listingDate || new Date().toISOString().split("T")[0],
            source: "Local Dataset",
          });
        }
      }
    } catch {}
  }

  return results;
}

/**
 * Discovers active IPOs across all available sources (Chittorgarh + IPOWatch + Local)
 */
export async function fetchLatestIPOs(): Promise<DiscoveredIPO[]> {
  const all: DiscoveredIPO[] = [];
  const seen = new Set<string>();

  const addUnique = (items: DiscoveredIPO[]) => {
    for (const item of items) {
      const norm = normalizeName(item.companyName);
      if (!seen.has(norm) && !seen.has(item.slug)) {
        seen.add(norm);
        seen.add(item.slug);
        all.push(item);
      }
    }
  };

  // 1. Fetch live from Chittorgarh
  const chittorgarhList = await fetchChittorgarhIPOs();
  addUnique(chittorgarhList);

  // 2. Fetch live from IPOWatch
  const ipoWatchList = await fetchIPOWatchIPOs();
  addUnique(ipoWatchList);

  // 3. Fallback: Include any unworked local datasets in src/data/
  const localList = getLocalUnprocessedIPOs();
  addUnique(localList);

  return all;
}

/**
 * Returns all discovered IPOs that have NOT yet been marked completed in tracker
 */
export async function getUnprocessedIPOs(): Promise<DiscoveredIPO[]> {
  const all = await fetchLatestIPOs();
  return all.filter((ipo) => !isIPOProcessed(ipo.companyName) && !isIPOProcessed(ipo.slug));
}

// Standalone CLI runner
if (require.main === module) {
  (async () => {
    console.log("🔍 Searching latest IPOs across Chittorgarh, IPOWatch & local store...");
    const all = await fetchLatestIPOs();
    console.log(`📡 Discovered ${all.length} total IPO candidate(s).`);

    const unprocessed = await getUnprocessedIPOs();
    console.log(`\n📋 Found ${unprocessed.length} unworked IPO(s) ready to render:`);
    unprocessed.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.companyName} (${item.slug}) [Source: ${item.source || "Web"}]`);
      console.log(`     URL: ${item.link}`);
    });
  })();
}
