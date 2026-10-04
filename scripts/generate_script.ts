import "dotenv/config";
import fs from "fs";
import path from "path";
import { IPOData, ChapterScripts } from "../src/types/ipo";

export interface ScriptGenerationResult {
  source: "groq" | "gemini" | "deterministic";
  modelUsed?: string;
  scripts: ChapterScripts;
}

/**
 * Builds the structured long-form prompt given the IPO data
 */
function buildLongFormPrompt(data: IPOData): string {
  const cleanTotal = data.issue.totalFormatted.replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const cleanFresh = data.issue.freshFormatted.replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const cleanOfs = data.issue.ofsFormatted.replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const cleanPrice = data.issue.priceBand.replace(/₹\s*/g, "").replace(/–/g, "to");
  const cleanMin = data.issue.minInvestment.replace(/₹\s*/g, "");

  const fin = data.financials;
  const revSummary = fin.years
    .map((y, i) => `${y}: ${fin.revenue.valuesFormatted[i].replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore")}`)
    .join(", ");
  const ebitdaSummary = fin.years
    .map((y, i) => `${y} margin ${fin.ebitda.marginsPercent[i]}`)
    .join(", ");
  const patSummary = fin.years
    .map((y, i) => `${y}: ${fin.pat.valuesFormatted[i].replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore")}`)
    .join(", ");

  const peersSummary = data.peers.table
    .map((p) => `${p.name} (P/E ${p.peRatio}, RoNW ${p.ronwFormatted})`)
    .join("; ");

  const risksSummary = data.risks.items
    .map((r) => `[${r.severity}] ${r.title}: ${r.detail}`)
    .join("; ");

  return `You are a top Indian financial YouTuber and seasoned equity research analyst writing an engaging, deep-dive 5-minute video script analyzing the upcoming IPO of "${data.companyName}".
Tone: Professional, analytical, fast-paced, authoritative, retail investor friendly (think Think School / Zerodha Varsity / Finology style).
Language: Indian English.

Financial Dossier for ${data.companyName}:
- Company: ${data.companyName} (${data.exchange || "NSE/BSE"}), Industry: ${data.industry}
- Total Issue: ${cleanTotal} (${cleanFresh} Fresh Issue, ${cleanOfs} OFS)
- Price Band: ${cleanPrice}, Lot Size: ${data.issue.lotSize}, Min Investment: ${cleanMin}
- Bidding Dates: ${data.issue.biddingDates || "Upcoming"}
- Business Model: ${data.businessModel.headline}. ${data.businessModel.description}
- Revenue Segments: ${data.businessModel.segments.map((s) => `${s.name} (${s.sharePercent}%)`).join(", ")}
- Industry TAM: ${data.industryContext.marketSizeFormatted}, CAGR: ${data.industryContext.cagrText}
- 3-Year Revenue: ${revSummary} (${fin.revenue.cagr})
- EBITDA Margins: ${ebitdaSummary}
- PAT (Net Profit/Loss): ${patSummary}
- Balance Sheet: Debt to Equity ${fin.balanceSheet.debtToEquity}, Cash from Operations ${fin.balanceSheet.cashFromOperations}, RoNW ${fin.balanceSheet.ronwFormatted}
- Peer Valuation: ${peersSummary} (Industry Avg P/E: ${data.peers.industryAveragePe})
- Objects of Fresh Issue: ${data.issue.objectsOfIssue?.map((o) => `${o.purpose} (${o.percentage})`).join("; ") || "Capital expansion"}
- Key Risks: ${risksSummary}
- Grey Market Premium (GMP): ${data.verdict.gmp.currentGmpFormatted}, Estimated Listing Price: ${data.verdict.gmp.estimatedListingPrice}
- Verdict Scorecard: ${data.verdict.scorecard.overallRating}. Short-Term: ${data.verdict.shortTermVerdict}. Long-Term: ${data.verdict.longTermVerdict}.

CRITICAL PRONUNCIATION & CURRENCY RULES:
- NEVER use the symbol "₹" anywhere!
- Write "crore" instead of "Cr" (e.g., "1,200 crore", "78 crore").
- Do NOT repeatedly say "rupees" in every sentence. Just say numbers naturally like "priced between 120 and 128", "minimum investment under 15,000", "swung to a 172 crore profit".
- For financial years (FY23, FY24, FY25), always write "financial year 23", "financial year 24", "financial year 25". NEVER use the word "fiscal" as speech synthesizers mispronounce it as "physical".

STRICT OUTPUT FORMAT:
You must output a single JSON object with EXACTLY these 8 keys: "chapter_1", "chapter_2", "chapter_3", "chapter_4", "chapter_5", "chapter_6", "chapter_7", "chapter_8".
Do NOT include markdown formatting or backticks, return raw JSON only.

Chapter Word Counts (Target ~800 words total):
- "chapter_1" (~85-105 words): Hook the viewer, introduce the company, total issue size, price band, and core question: is it worth your hard-earned capital?
- "chapter_2" (~105-135 words): Business model breakdown: what do they do, who are the customers, and how do their revenue segments contribute to the top line?
- "chapter_3" (~85-110 words): Industry landscape, market TAM, and structural tailwinds powering their sector.
- "chapter_4" (~130-165 words): In-depth 3-year financial statement analysis: revenue CAGR, operating EBITDA margins, PAT turnaround, debt-to-equity, and cash from operations.
- "chapter_5" (~90-120 words): Issue details, Fresh issue vs OFS breakdown, and exactly where fresh funds will be spent (objects of offer).
- "chapter_6" (~105-135 words): Valuation benchmarking against listed peers: compare P/E, P/B, RoNW multiples and margin of safety.
- "chapter_7" (~95-125 words): Critical red flags and structural risks: loan concentration, regulatory scrutiny, and what could go wrong.
- "chapter_8" (~95-130 words): Final verdict: GMP analysis, scorecard rating, short-term listing gain vs long-term investment recommendation, and a call to subscribe and comment.`;
}

/**
 * Tier 1: Groq API (Llama 3.3 / Qwen)
 */
async function generateWithGroq(data: IPOData): Promise<{ scripts: ChapterScripts; model: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  const candidateModels = Array.from(
    new Set([process.env.GROQ_MODEL, "qwen/qwen3.8-27b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"].filter(Boolean))
  ) as string[];

  for (const model of candidateModels) {
    console.log(`📡 [AI Script] Attempting Groq API (Model: ${model})...`);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a professional financial video producer who outputs strictly valid JSON only. Never use the rupee symbol.",
            },
            {
              role: "user",
              content: buildLongFormPrompt(data),
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 1800,
          temperature: 0.35,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ [AI Script] Groq HTTP ${res.status} (${model}): ${errText.substring(0, 150)}`);
        continue;
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content;
      if (!content) continue;

      const scripts = JSON.parse(content) as ChapterScripts;
      return { scripts, model };
    } catch (error) {
      console.warn(`⚠️ [AI Script] Groq error (${model}):`, error instanceof Error ? error.message : error);
    }
  }

  return null;
}

/**
 * Tier 2: Google Gemini API (gemini-2.5-flash)
 */
async function generateWithGemini(data: IPOData): Promise<ChapterScripts | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log(`📡 [AI Script] Attempting Secondary: Gemini API (Model: ${model})...`);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildLongFormPrompt(data) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35,
          maxOutputTokens: 2200,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
    }

    const json = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Empty response from Gemini");

    return JSON.parse(content) as ChapterScripts;
  } catch (error) {
    console.warn(`⚠️ [AI Script] Gemini generation failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Tier 3: Deterministic Financial Copy Engine (Zero API Safety Net)
 */
export function generateDeterministicScript(data: IPOData): ChapterScripts {
  const cleanTotal = data.issue.totalFormatted.replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const cleanFresh = data.issue.freshFormatted.replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const cleanOfs = data.issue.ofsFormatted.replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const cleanPrice = data.issue.priceBand.replace(/₹\s*/g, "").replace(/–/g, "to");
  const cleanMin = data.issue.minInvestment.replace(/₹\s*/g, "");
  const fin = data.financials;

  const rev1 = fin.revenue.valuesFormatted[0].replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const rev3 = fin.revenue.valuesFormatted[2].replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");
  const pat3 = fin.pat.valuesFormatted[2].replace(/₹\s*/g, "").replace(/\bCr\b/g, "crore");

  return {
    chapter_1: `${data.companyName} is making its debut on the primary market with a ${cleanTotal} initial public offering, comprising a ${cleanFresh} fresh issue and a ${cleanOfs} offer for sale. Priced between ${cleanPrice}, retail investors can participate with an investment of under ${cleanMin}. But in an increasingly competitive market, does this IPO offer genuine value or is it overpriced hype? In this in-depth analysis, we break down their business model, 3-year financial health, peer valuations, and our final verdict.`,
    chapter_2: `To evaluate ${data.companyName}, we first need to understand how the company makes money. Operating as a ${data.businessModel.headline.toLowerCase()}, their core revenue comes from ${data.businessModel.segments[0].name}, contributing ${data.businessModel.segments[0].sharePercent} percent of total turnover. The remaining revenue is driven by ${data.businessModel.segments.slice(1).map((s) => `${s.name} at ${s.sharePercent} percent`).join(" and ")}. Their proprietary platform enables rapid customer acquisition with low operating overheads.`,
    chapter_3: `The macroeconomic backdrop provides strong tailwinds for this sector. The industry is projected to reach ${data.industryContext.marketSizeFormatted}, growing at an impressive ${data.industryContext.cagrText}. Key structural drivers include expanding digital penetration, automated credit underwriting, and rising consumer demand across non-metro cities. ${data.companyName} is well-positioned to capitalize on this ongoing expansion.`,
    chapter_4: `Now let's examine the three-year financial trajectory. Between ${fin.years[0]} and ${fin.years[2]}, top-line revenue expanded rapidly from ${rev1} to ${rev3}, delivering a strong ${fin.revenue.cagr}. Operating EBITDA margins improved to ${fin.ebitda.marginsPercent[2]}, with latest net profit reaching ${pat3}. On the balance sheet, debt-to-equity stands at a healthy ${fin.balanceSheet.debtToEquity} with positive operating cash flow of ${fin.balanceSheet.cashFromOperations}, indicating disciplined capital management.`,
    chapter_5: `Examining the issue structure, the offer consists of ${data.issue.freshPercent || "67%"} fresh capital and ${data.issue.ofsPercent || "33%"} offer for sale. Looking at the objects of the offer, the company plans to utilize fresh proceeds primarily for ${data.issue.objectsOfIssue?.[0]?.purpose || "growth capital expansion"}, followed by technology infrastructure investments and general corporate expenses. The high proportion of fresh growth capital is a positive signal for incoming investors.`,
    chapter_6: `On the valuation front, at the upper price band, ${data.companyName} trades at a price to earnings ratio of ${data.peers.table[0]?.peRatio || "24.6 times"}. Comparing this to listed peers, the industry average P/E stands at ${data.peers.industryAveragePe}. With a return on net worth of ${fin.balanceSheet.ronwFormatted}, the IPO is priced at a reasonable valuation compared to established industry peers, offering an attractive margin of safety.`,
    chapter_7: `However, no investment is without risk. There are three key red flags retail investors should be aware of: first, ${data.risks.items[0]?.title.toLowerCase()} which could impact margins; second, ${data.risks.items[1]?.title.toLowerCase()}; and third, ${data.risks.items[2]?.title.toLowerCase()}. Investors should carefully monitor asset quality and regulatory developments going forward.`,
    chapter_8: `To conclude, in the grey market, the premium is trending at ${data.verdict.gmp.currentGmpFormatted}, signaling an estimated listing price of ${data.verdict.gmp.estimatedListingPrice}. On our fundamental scorecard, the company scores ${data.verdict.scorecard.overallRating}. Our verdict: ${data.verdict.shortTermVerdict} for short-term listing gains, and ${data.verdict.longTermVerdict} for long-term investors. If you found this breakdown helpful, remember to subscribe to the channel and leave your comments below!`,
  };
}

/**
 * Master Dispatcher: Groq -> Gemini -> Deterministic Fallback
 */
export async function generateIPOScripts(data: IPOData): Promise<ScriptGenerationResult> {
  // 1. Try Groq
  const groqResult = await generateWithGroq(data);
  if (groqResult && validateLongFormScripts(groqResult.scripts)) {
    console.log(`✅ [AI Script] Successfully generated scripts via Groq (${groqResult.model})`);
    return { source: "groq", modelUsed: groqResult.model, scripts: groqResult.scripts };
  }

  // 2. Try Gemini
  const geminiScripts = await generateWithGemini(data);
  if (geminiScripts && validateLongFormScripts(geminiScripts)) {
    console.log(`✅ [AI Script] Successfully generated scripts via Gemini (${process.env.GEMINI_MODEL || "gemini-2.5-flash"})`);
    return { source: "gemini", modelUsed: process.env.GEMINI_MODEL || "gemini-2.5-flash", scripts: geminiScripts };
  }

  // 3. Deterministic Fallback
  console.log(`🛡️ [AI Script] Using internal deterministic long-form financial copy engine.`);
  const fallbackScripts = generateDeterministicScript(data);
  return { source: "deterministic", scripts: fallbackScripts };
}

export const generateScripts = generateIPOScripts;

function validateLongFormScripts(scripts: unknown): scripts is ChapterScripts {
  if (!scripts || typeof scripts !== "object") return false;
  const s = scripts as Record<string, unknown>;
  for (let i = 1; i <= 8; i++) {
    const key = `chapter_${i}`;
    if (typeof s[key] !== "string" || (s[key] as string).trim().length < 20) {
      return false;
    }
  }
  return true;
}

// Standalone CLI runner
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    let target = "moneyview";
    for (const a of args) {
      if (a.startsWith("--ipo=")) target = a.replace("--ipo=", "").trim().toLowerCase();
    }

    const jsonPath = path.resolve(__dirname, `../src/data/${target}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.error(`File not found: ${jsonPath}`);
      process.exit(1);
    }

    const ipoData = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as IPOData;
    console.log(`🎬 Generating long-form narration scripts for ${ipoData.companyName}...`);

    const result = await generateIPOScripts(ipoData);
    ipoData.scripts = result.scripts;

    fs.writeFileSync(jsonPath, JSON.stringify(ipoData, null, 2));
    console.log(`\n📄 Generated Scripts [Source: ${result.source}${result.modelUsed ? ` - ${result.modelUsed}` : ""}]:`);
    let totalWords = 0;
    for (let i = 1; i <= 8; i++) {
      const key = `chapter_${i}` as keyof ChapterScripts;
      const text = result.scripts[key];
      const wordCount = text.split(/\s+/).length;
      totalWords += wordCount;
      console.log(`  [Chapter ${i}] (${wordCount} words): "${text.substring(0, 80)}..."`);
    }
    console.log(`\n📊 Total Script Length: ${totalWords} words (~${(totalWords / 150).toFixed(1)} minutes of narration)`);
    console.log(`💾 Saved scripts into: ${jsonPath}`);
  })();
}
