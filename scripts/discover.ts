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
    // Remove prefixes/suffixes like "Review by Dilip Davda", "Subscription Status", "(BSE SME)", etc.
    .replace(/\s*IPO\s*(Review.*|Subscription.*|Allotment.*|GMP.*|Details.*)?/i, "")
    .replace(/\(.*?\)/g, "")
    .replace(/Review by.*/i, "")
    .trim();

  // If still ends with IPO, remove it
  cleaned = cleaned.replace(/\s+IPO$/i, "").trim();
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
