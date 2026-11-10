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
function cleanAmount(val: string): string {
  return val
    .replace(/₹\s*/g, "")
    .replace(/(\d+)\.00(?!\d)/g, "$1")
    .replace(/(\d+\.\d)0(?!\d)/g, "$1")
    .replace(/(\d+(?:\.\d+)?)\s*Cr\b/gi, "$1 crore")
    .replace(/(\d+(?:\.\d+)?)\s*Lakh\b/gi, "$1 lakh")
    .replace(/\bCr\b/gi, "crore");
}

function buildLongFormPrompt(data: IPOData): string {
  const cleanTotal = cleanAmount(data.issue?.totalFormatted || "500 crore");
  const cleanFresh = cleanAmount(data.issue?.freshFormatted || "350 crore");
  const cleanOfs = cleanAmount(data.issue?.ofsFormatted || "150 crore");
  const cleanPrice = (data.issue?.priceBand || "85 to 92").replace(/₹\s*/g, "").replace(/–/g, "to");
  const cleanMin = (data.issue?.minInvestment || "14,800").replace(/₹\s*/g, "");

  const fin = data.financials;
  const revSummary = fin?.years
    ? fin.years.map((y, i) => `${y}: ${cleanAmount(fin.revenue?.valuesFormatted?.[i] || "")}`).join(", ")
    : "Steady growth across 3 years";
  const ebitdaSummary = fin?.years
    ? fin.years.map((y, i) => `${y} margin ${fin.ebitda?.marginsPercent?.[i] || "14%"}`).join(", ")
    : "Double digit margins";
  const patSummary = fin?.years
    ? fin.years.map((y, i) => `${y}: ${cleanAmount(fin.pat?.valuesFormatted?.[i] || "")}`).join(", ")
    : "Profitable operations";

  const peersSummary = data.peers?.table
    ? data.peers.table.map((p) => `${p.name} (P/E ${p.peRatio || "25x"}, RoNW ${p.ronwFormatted || "18%"})`).join("; ")
    : "Peer benchmark multiples";

  const risksSummary = data.risks?.items
    ? data.risks.items.map((r) => `[${r.severity}] ${r.title}: ${r.detail}`).join("; ")
    : "Key concentration and market risks";

  return `You are a top Indian financial YouTuber and seasoned equity research analyst (in the style of Think School, Zerodha Varsity, Finology, and Akshat Shrivastava) writing an engaging, deep-dive 5-minute video script analyzing the upcoming IPO of "${data.companyName}".
Tone: Engaging, fast-paced, authoritative, analytical, retail-investor friendly.
Language: High-quality Hinglish (conversational Hindi written in English/Latin script, as used in Indian YouTube finance breakdown videos).

Financial Dossier for ${data.companyName}:
- Company: ${data.companyName} (${data.exchange || "NSE/BSE"}), Industry: ${data.industry || "Manufacturing"}
- Total Issue: ${cleanTotal} (${cleanFresh} Fresh Issue, ${cleanOfs} OFS)
- Price Band: ${cleanPrice}, Lot Size: ${data.issue?.lotSize || "160 shares"}, Min Investment: ${cleanMin}
- Bidding Dates: ${data.issue?.biddingDates || "Upcoming"}
- Business Model: ${data.businessModel?.headline || "Scalable platform"}. ${data.businessModel?.description || ""}
- Revenue Segments: ${data.businessModel?.segments?.map((s) => `${s.name} (${s.sharePercent}%)`).join(", ") || "Core operations"}
- Industry TAM: ${data.industryContext?.marketSizeFormatted || "$30B"}, CAGR: ${data.industryContext?.cagrText || "15%"}
- 3-Year Revenue: ${revSummary} (${fin?.revenue?.cagr || "25% CAGR"})
- EBITDA Margins: ${ebitdaSummary}
- PAT (Net Profit/Loss): ${patSummary}
- Balance Sheet: Debt to Equity ${fin?.balanceSheet?.debtToEquity || "0.8x"}, Cash from Operations ${fin?.balanceSheet?.cashFromOperations || "Positive"}, RoNW ${fin?.balanceSheet?.ronwFormatted || "18%"}
- Peer Valuation: ${peersSummary} (Industry Avg P/E: ${data.peers?.industryAveragePe || "28x"})
- Objects of Fresh Issue: ${data.issue?.objectsOfIssue?.map((o) => `${o.purpose} (${o.percentage})`).join("; ") || "Capital expansion"}
- Key Risks: ${risksSummary}
- Grey Market Premium (GMP): ${data.verdict?.gmp?.currentGmpFormatted || "N/A"}, Estimated Listing Price: ${data.verdict?.gmp?.estimatedListingPrice || "N/A"}
- Verdict Scorecard: ${data.verdict?.scorecard?.overallRating || "7.8/10"}. Short-Term: ${data.verdict?.shortTermVerdict || "Apply"}. Long-Term: ${data.verdict?.longTermVerdict || "Subscribe"}.

CRITICAL HINGLISH, PRONUNCIATION & SCRIPT RULES:
- Write strictly in HINGLISH using the Latin/English alphabet (DO NOT use Devanagari script). Example: "Kya yeh IPO aapke liye ek solid opportunity hai ya overhyped trap? Chaliye detail me samajhte hain."
- Keep all financial and business terms in standard English: "IPO", "EBITDA", "Price Band", "Lot Size", "PAT", "Debt to Equity", "Return on Net Worth", "Market Share", "P E ratio", "Listing Gains", "Fresh Issue", "Offer for Sale".
- NEVER use the currency symbol "₹" anywhere!
- Always write "crore" instead of "Cr" (e.g., "1,200 crore", "78 crore") and "lakh" instead of "Lakh".
- For financial years (FY23, FY24, FY25), always write "financial year 24", "financial year 25", "financial year 26". NEVER use the word "fiscal".
- Use natural Indian YouTube conversational phrases: "Dosto, aaj hum analyze karenge...", "Pehle samajhte hain company paise kaise kamati hai...", "Bottom line par ebitda margins...", "Valuation ke hisaab se...", "Toh aakhir me humara verdict kya hai?".

STRICT OUTPUT FORMAT:
You must output a single JSON object with EXACTLY these 8 keys: "chapter_1", "chapter_2", "chapter_3", "chapter_4", "chapter_5", "chapter_6", "chapter_7", "chapter_8".
Do NOT include markdown formatting or backticks, return raw JSON only.

Chapter Word Counts (Target ~800 words total):
- "chapter_1" (~85-105 words): Hook the viewer in Hinglish, introduce company, total issue size, price band, and core question: kya yeh aapke hard-earned capital ke liye worth it hai?
- "chapter_2" (~105-135 words): Business model breakdown in Hinglish: company kya karti hai, core revenue segments kaise contribute karte hain.
- "chapter_3" (~85-110 words): Industry landscape and TAM in Hinglish: sector kitna tezi se grow kar raha hai aur structural tailwinds kya hain.
- "chapter_4" (~130-165 words): 3-year financial health in Hinglish: revenue CAGR, operating EBITDA margins, PAT growth, debt-to-equity, aur cash flows.
- "chapter_5" (~90-120 words): Issue details in Hinglish: Fresh issue vs OFS breakdown aur fresh funds kahan spend honge.
- "chapter_6" (~105-135 words): Valuation benchmarking in Hinglish: compare P/E, P/B, RoNW against listed peers and evaluate margin of safety.
- "chapter_7" (~95-125 words): Critical red flags and structural risks in Hinglish: client concentration, raw material volatility, and key concerns.
- "chapter_8" (~95-130 words): Final verdict in Hinglish: GMP status, scorecard rating, short-term listing gain vs long-term investment recommendation, with a call to like and subscribe.`;
}

/**
 * Tier 1: Groq API (Llama 3.3 / Qwen)
 */
async function generateWithGroq(data: IPOData): Promise<{ scripts: ChapterScripts; model: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  const candidateModels = Array.from(
    new Set([process.env.GROQ_MODEL, "openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b"].filter(Boolean))
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
  const cleanTotal = cleanAmount(data.issue?.totalFormatted || "500 crore");
  const cleanFresh = cleanAmount(data.issue?.freshFormatted || "350 crore");
  const cleanOfs = cleanAmount(data.issue?.ofsFormatted || "150 crore");
  const cleanPrice = (data.issue?.priceBand || "85 to 92").replace(/₹\s*/g, "").replace(/–/g, "to");
  const cleanMin = (data.issue?.minInvestment || "14,800").replace(/₹\s*/g, "");
  const fin = data.financials;

  const y0 = fin?.years?.[0] || "financial year 24";
  const y2 = fin?.years?.[2] || "financial year 26";
  const rev1 = cleanAmount(fin?.revenue?.valuesFormatted?.[0] || "500 crore");
  const rev3 = cleanAmount(fin?.revenue?.valuesFormatted?.[2] || "1,000 crore");
  const revCagr = fin?.revenue?.cagr || "25% CAGR";
  const ebitdaMargin = fin?.ebitda?.marginsPercent?.[2] || "15%";
  const pat3 = cleanAmount(fin?.pat?.valuesFormatted?.[2] || "80 crore");
  const deRatio = fin?.balanceSheet?.debtToEquity || "0.85x";
  const cashFlow = fin?.balanceSheet?.cashFromOperations || "clean operating cash flows";
  const ronw = fin?.balanceSheet?.ronwFormatted || "18.5%";
  const indPe = data.peers?.industryAveragePe || "25.0x";
  const targetPe = data.peers?.table?.[0]?.peRatio || "22.0x";
  const gmpVal = data.verdict?.gmp?.currentGmpFormatted || "positive premium";
  const estList = data.verdict?.gmp?.estimatedListingPrice || "reasonable upside";
  const overallRating = data.verdict?.scorecard?.overallRating || "7.8 / 10";
  const shortTerm = data.verdict?.shortTermVerdict || "Apply for Listing Gains";
  const longTerm = data.verdict?.longTermVerdict || "Subscribe for Long Term";

  const seg1Name = data.businessModel?.segments?.[0]?.name || "Core Operations";
  const seg1Share = data.businessModel?.segments?.[0]?.sharePercent || 65;
  const otherSegs = data.businessModel?.segments?.slice(1) || [];
  const otherSegsStr =
    otherSegs.length > 0
      ? otherSegs.map((s) => `${s.name} at ${s.sharePercent} percent`).join(" and ")
      : "diversified commercial services";

  const tam = data.industryContext?.marketSizeFormatted || "$30 Billion by 2030";
  const tamCagr = data.industryContext?.cagrText || "15% Industry CAGR";

  const objPurpose = data.issue?.objectsOfIssue?.[0]?.purpose || "growth capital expansion";
  const risk1 = data.risks?.items?.[0]?.title?.toLowerCase() || "customer concentration";
  const risk2 = data.risks?.items?.[1]?.title?.toLowerCase() || "raw material price volatility";
  const risk3 = data.risks?.items?.[2]?.title?.toLowerCase() || "working capital requirements";

  return {
    chapter_1: `${data.companyName} primary market me enter kar rahi hai apne ${cleanTotal} ke initial public offering ke sath, jisme ${cleanFresh} ka fresh issue aur ${cleanOfs} ka offer for sale shamil hai. ${cleanPrice} ke price band me retail investors ${cleanMin} ke minimum investment ke sath apply kar sakte hain. Lekin kya yeh IPO aapke hard-earned capital ke liye ek solid opportunity hai ya phir ek overhyped trap? Is deep-dive video me hum analyze karenge company ka business model, three-year financial performance, peer valuation aur humara final verdict.`,
    chapter_2: `Kisi bhi IPO me invest karne se pehle yeh samajhna zaroori hai ki company paise kaise kamati hai. ${data.companyName} operate karti hai as a ${data.businessModel?.headline?.toLowerCase() || "scaled operating platform"}, jahan inka primary revenue aata hai ${seg1Name} se, jo total turnover ka lagbhag ${seg1Share} percent contribute karta hai. Baki revenue drive hota hai ${otherSegsStr} se. Inka diversified operating base company ko long-term revenue stability provide karta hai.`,
    chapter_3: `Ab dekhte hain sector landscape aur industry opportunities. Market projection ke anusaar, overall industry expand hokar ${tam} tak pahunch sakti hai, growing at a rapid ${tamCagr}. Key structural growth drivers me domestic manufacturing expansion, rising infrastructure spending, aur strong customer demand shamil hain, jiska direct faayda ${data.companyName} ko milne ki ummeed hai.`,
    chapter_4: `Chaliye ab company ke three-year financial trajectory ko examine karte hain. ${y0} se ${y2} ke dauran revenue rapidly surge hokar ${rev1} se ${rev3} tak pahunch gaya, delivering an impressive ${revCagr}. Operating front par ebitda margin ${ebitdaMargin} par record hua hai, aur latest net profit ${pat3} touch kar chuka hai. Balance sheet par debt-to-equity ratio ${deRatio} hai aur operating cash flows ${cashFlow} hain, jo steady financial discipline ko darshata hai.`,
    chapter_5: `Issue details ko dekhein toh offer me ${data.issue?.freshPercent || "70%"} fresh capital hai aur ${data.issue?.ofsPercent || "30%"} offer for sale shamil hai. Fresh proceeds ko company primarily use karegi ${objPurpose} ke liye, sath hi general corporate purposes aur future expansion me deploy kiya jayega. Fresh growth capital ka high proportion incoming investors ke liye hamesha ek positive signal hota hai.`,
    chapter_6: `Valuation front par, upper price band par ${data.companyName} trade kar rahi hai at a price to earnings ratio of ${targetPe}. Agar listed industry peers se compare karein, toh industry average P E multiple ${indPe} ke aas-paas hai. ${ronw} ke return on net worth ke sath, yeh IPO established peers ke mukable ek reasonable valuation aur margin of safety provide karta hai.`,
    chapter_7: `Lekin kisi bhi investment me risks ko ignore nahi kiya ja sakta. Har smart investor ko teen key red flags par dhyan dena chahiye: pehla, ${risk1}; doosra, ${risk2}; aur teesra, ${risk3}. Aise factors company ke future margins aur working capital cycle ko temporarily impact kar sakte hain.`,
    chapter_8: `To conclude, grey market me premium trend kar raha hai around ${gmpVal}, pointing towards an estimated listing price of ${estList}. Humare analyst fundamental scorecard par company ne score kiya hai ${overallRating}. Humara verdict: short-term listing gains ke liye ${shortTerm}, aur long-term investors ke liye ${longTerm}. Agar aapko yeh analysis helpful laga toh video ko like karein, channel ko subscribe karein, aur apna view comments me zaroor batayein!`,
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
