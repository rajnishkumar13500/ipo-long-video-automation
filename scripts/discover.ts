import { isIPOProcessed, normalizeName } from "./tracker";

export interface DiscoveredIPO {
  rawTitle: string;
  companyName: string;
  slug: string;
  link: string;
  pubDate: string;
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
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // 2. Remove parenthetical tags like (BSE SME), (NSE SME), (Mainboard), etc.
    .replace(/\(.*?\)/g, "")
    // 3. Remove leading editorial tags
    .replace(/^(?:IPO\s*(?:Alert|Update|Watch|Review|Details)?\s*[:\-–—]\s*)/i, "")
    // 4. Remove author suffixes like "Review by Dilip Davda"
    .replace(/Review\s+by\s+.*/i, "")
    .trim();

  // 5. If "IPO" appears as an isolated word, extract company name from the left side
  if (/\bIPO\b/i.test(cleaned)) {
    const parts = cleaned.split(/\bIPO\b/i);
    if (parts[0].trim().length >= 2) {
      cleaned = parts[0].trim();
    } else if (parts[1] && parts[1].trim().length >= 2) {
      cleaned = parts[1].trim();
    }
  }

  // 6. Strip trailing boilerplate terms that may occur
  cleaned = cleaned
    .replace(/\s*(?:Date|Review|Price|Details|Allotment|GMP|Subscription|Status|Analysis|Band|Size|Dates).*$/i, "")
    // 7. Strip trailing hyphens, colons, commas, or pipes
    .replace(/[\s\-–—,:|]+$/, "")
    // 8. Normalize spacing
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}


export async function fetchLatestIPOs(): Promise<DiscoveredIPO[]> {
  const feedUrl = "https://ipowatch.in/feed/";
  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feed: ${res.statusText}`);
    }

    const xml = await res.text();
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g;
    let match: RegExpExecArray | null;

    const list: DiscoveredIPO[] = [];
    const seen = new Set<string>();

    while ((match = itemRegex.exec(xml)) !== null) {
      const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
      const link = match[2].trim();
      const pubDate = match[3].trim();

      const companyName = cleanCompanyName(rawTitle);
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const norm = normalizeName(companyName);

      if (!seen.has(norm) && companyName.length > 2) {
        seen.add(norm);
        list.push({
          rawTitle,
          companyName,
          slug,
          link,
          pubDate,
        });
      }
    }

    return list;
  } catch (error) {
    console.error("Error fetching latest IPOs from feed:", error);
    return [];
  }
}

export async function getUnprocessedIPOs(): Promise<DiscoveredIPO[]> {
  const all = await fetchLatestIPOs();
  return all.filter((ipo) => !isIPOProcessed(ipo.companyName) && !isIPOProcessed(ipo.slug));
}

// CLI runner
if (require.main === module) {
  (async () => {
    console.log("🔍 Searching latest IPOs...");
    const unprocessed = await getUnprocessedIPOs();
    console.log(`\n📋 Found ${unprocessed.length} unworked IPO(s):`);
    unprocessed.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.companyName} (${item.rawTitle}) [Published: ${item.pubDate}]`);
    });
  })();
}
