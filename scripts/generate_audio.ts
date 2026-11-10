import "dotenv/config";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import * as mm from "music-metadata";
import { EdgeTTS } from "@andresaya/edge-tts";
import { IPOData, VideoTimeline, ChapterTiming, SceneTiming } from "../src/types/ipo";
import { getCartesiaKeys, markKeyExhausted, maskKey } from "./key_manager";

export { getCartesiaKeys } from "./key_manager";

export const CHAPTER_METADATA = [
  { id: "chapter_1", title: "Overview & Issue Highlights", shortTitle: "Overview" },
  { id: "chapter_2", title: "Business Model & Monetization", shortTitle: "Business" },
  { id: "chapter_3", title: "Industry Backdrop & Market TAM", shortTitle: "Industry" },
  { id: "chapter_4", title: "3-Year Financial Statements", shortTitle: "Financials" },
  { id: "chapter_5", title: "Issue Details & Fresh Capital", shortTitle: "Issue" },
  { id: "chapter_6", title: "Valuation & Peer Benchmarking", shortTitle: "Valuation" },
  { id: "chapter_7", title: "Structural Red Flags & Risks", shortTitle: "Risks" },
  { id: "chapter_8", title: "Final Decision & Analyst Scorecard", shortTitle: "Verdict" },
];

export interface SubSceneMeta {
  id: string;
  chapterIndex: number;
  title: string;
  minFrames: number;
}

export const SUB_SCENE_DEFINITIONS: SubSceneMeta[] = [
  // Chapter 1: Overview & Hook (4 scenes)
  { id: "cold_open", chapterIndex: 0, title: "Cold Open Hook", minFrames: 120 },
  { id: "logo_reveal", chapterIndex: 0, title: "Dalal Street Entrance", minFrames: 150 },
  { id: "issue_numbers", chapterIndex: 0, title: "Key Issue Numbers", minFrames: 240 },
  { id: "timeline_stakes", chapterIndex: 0, title: "IPO Roadmap & Dates", minFrames: 210 },

  // Chapter 2: Business Model (4 scenes)
  { id: "biz_title", chapterIndex: 1, title: "Business Model Intro", minFrames: 90 },
  { id: "biz_story", chapterIndex: 1, title: "Platform Value Proposition", minFrames: 240 },
  { id: "biz_donut", chapterIndex: 1, title: "Revenue Segment Breakdown", minFrames: 240 },
  { id: "biz_metrics", chapterIndex: 1, title: "Operational Scale & AUM", minFrames: 180 },

  // Chapter 3: Industry & TAM (4 scenes)
  { id: "ind_title", chapterIndex: 2, title: "Market Opportunity Intro", minFrames: 90 },
  { id: "tam_reveal", chapterIndex: 2, title: "Addressable Market TAM", minFrames: 210 },
  { id: "growth_drivers", chapterIndex: 2, title: "Structural Growth Drivers", minFrames: 240 },
  { id: "market_position", chapterIndex: 2, title: "Competitive Positioning", minFrames: 150 },

  // Chapter 4: Financial Statements (5 scenes)
  { id: "fin_title", chapterIndex: 3, title: "Financials Deep Dive Intro", minFrames: 90 },
  { id: "revenue_chart", chapterIndex: 3, title: "3-Year Revenue Growth", minFrames: 240 },
  { id: "profit_arc", chapterIndex: 3, title: "Profitability Turnaround & EBITDA", minFrames: 270 },
  { id: "balance_sheet", chapterIndex: 3, title: "Balance Sheet & Cash Flows", minFrames: 240 },
  { id: "fin_summary", chapterIndex: 3, title: "Financial Health Takeaway", minFrames: 150 },

  // Chapter 5: Issue Details & Fresh Capital (4 scenes)
  { id: "issue_title", chapterIndex: 4, title: "Issue Details Intro", minFrames: 90 },
  { id: "issue_split", chapterIndex: 4, title: "Fresh Issue vs OFS Split", minFrames: 240 },
  { id: "objects_issue", chapterIndex: 4, title: "Objects of the Offer", minFrames: 240 },
  { id: "investor_quota", chapterIndex: 4, title: "Reservation Quotas", minFrames: 210 },

  // Chapter 6: Peer Valuation (3 scenes)
  { id: "val_title", chapterIndex: 5, title: "Valuation & Peers Intro", minFrames: 90 },
  { id: "peer_comparison", chapterIndex: 5, title: "Peer Benchmarking Matrix", minFrames: 300 },
  { id: "val_summary", chapterIndex: 5, title: "Valuation Assessment", minFrames: 180 },

  // Chapter 7: Structural Risks (3 scenes)
  { id: "risk_title", chapterIndex: 6, title: "Key Risks Intro", minFrames: 90 },
  { id: "risk_cards", chapterIndex: 6, title: "Primary Structural Risks", minFrames: 150 },
  { id: "risk_summary", chapterIndex: 6, title: "Asset Quality & Risk Rating", minFrames: 150 },

  // Chapter 8: Decision & Scorecard (3 scenes)
  { id: "verdict_title", chapterIndex: 7, title: "Verdict & Scorecard Intro", minFrames: 90 },
  { id: "scorecard", chapterIndex: 7, title: "GMP & Analyst Scorecard", minFrames: 240 },
  { id: "outro", chapterIndex: 7, title: "Bidding Strategy & Outro", minFrames: 200 },
];

export interface AudioGenerationOptions {
  force?: boolean;
  voiceId?: string;
  modelId?: string;
  speed?: number;
  volume?: number;
}

export interface AudioGenerationResult {
  timeline: VideoTimeline;
  audioFiles: string[];
  usedFallbackTTS: boolean;
}

/**
 * Cleans narration text for natural, engaging text-to-speech pronunciation:
 * - Completely removes "₹", "Rs.", "INR"
 * - Converts "Cr" -> "crore"
 * - Converts ranges like "120 - 128" -> "120 to 128"
 * - Converts "-18 Cr" -> "negative 18 crore"
 * - Converts "%" -> "percent"
 * - Converts "P/E", "CAGR", "AUM", "NPA", "GMP", etc. to spoken formats
 */
export function cleanScriptForSpeech(text: string): string {
  return text
    // Handle Tier classifications BEFORE negative numbers
    .replace(/\bTier\s*[-–—]\s*(\d+)\b/gi, "Tier $1")
    // Avoid double-negatives in financial statements like "loss of -18"
    .replace(/\b(?:loss\s+of|from\s+a\s+loss\s+of)\s*[-–—]\s*/gi, "a loss of ")
    // Exchanges: convert bullets to "and" and space letters for clear pronunciation
    .replace(/\bNSE\s*[•·\-\/]\s*BSE\b/gi, "N S E and B S E")
    .replace(/\bBSE\s*[•·\-\/]\s*NSE\b/gi, "B S E and N S E")
    .replace(/\bNSE\b/g, "N S E")
    .replace(/\bBSE\b/g, "B S E")
    // Currency removal/conversion
    .replace(/₹\s*/g, "")
    .replace(/\bRs\.?\s*/gi, "")
    .replace(/\bINR\s*/gi, "")
    .replace(/Indian\s+Rupees?/gi, "")
    .replace(/\$(\d+(\.\d+)?)\s*Billion/gi, "$1 billion dollars")
    .replace(/\$(\d+(\.\d+)?)\s*Million/gi, "$1 million dollars")
    // Clean trailing zero decimals before unit expansion so TTS never says "point zero zero" or glitches
    .replace(/(\d+)\.00(?!\d)/g, "$1")
    .replace(/(\d+\.\d)0(?!\d)/g, "$1")
    .replace(/(\d+)\.0(?!\d)/g, "$1")
    // Ranges & negative signs
    .replace(/(\d+)\s*[-–—]\s*(\d+)/g, "$1 to $2")
    .replace(/(^|[\s(])[-–—](\d+(\.\d+)?)/g, "$1negative $2")
    // Units & Abbreviations (support full integer and decimal values like 270.58 Cr or 45 Cr)
    .replace(/(\d+(?:\.\d+)?)\s*Cr\b/gi, "$1 crore")
    .replace(/(\d+(?:\.\d+)?)\s*crores?\b/gi, "$1 crore")
    .replace(/\bCr\b/gi, "crore")
    .replace(/(\d+(?:\.\d+)?)\s*Lakh\b/gi, "$1 lakh")
    .replace(/(\d+(?:\.\d+)?)\s*lakhs?\b/gi, "$1 lakh")
    .replace(/(\d+)\s*M\+/gi, "$1 million plus")
    .replace(/#(\d+)/g, "number $1")
    .replace(/(\d+(\.\d+)?)x\b/gi, "$1 times")
    .replace(/%/g, " percent")
    // Fiscal years
    .replace(/\bFY\s*(\d{2,4})\b/gi, "financial year $1")
    .replace(/\bfiscal\s+(\d{2,4})\b/gi, "financial year $1")
    .replace(/\bfiscal\s+year\b/gi, "financial year")
    // Financial ratios & Acronyms
    .replace(/\bP\/E\b/gi, "P E")
    .replace(/\bP\/B\b/gi, "P B")
    .replace(/\bEV\/EBITDA\b/gi, "EV to ebitda")
    .replace(/\bEBITDA\b/g, "ebitda")
    .replace(/\bRoNW\b/gi, "return on net worth")
    .replace(/\bROCE\b/gi, "return on capital employed")
    .replace(/\bCAGR\b/gi, "compound annual growth rate")
    .replace(/\bAUM\b/gi, "A U M")
    .replace(/\bNPA\b/gi, "N P A")
    .replace(/\bQIB\b/gi, "Q I B")
    .replace(/\bNII\b/gi, "N I I")
    .replace(/\bOFS\b/gi, "O F S")
    .replace(/\bGMP\b/gi, "G M P")
    // Calendar months (prevents TTS engines from spelling out abbreviations like "O-C-T" or "S-E-P")
    .replace(/\bJan\b\.?/gi, "January")
    .replace(/\bFeb\b\.?/gi, "February")
    .replace(/\bMar\b\.?/gi, "March")
    .replace(/\bApr\b\.?/gi, "April")
    .replace(/\bJun\b\.?/gi, "June")
    .replace(/\bJul\b\.?/gi, "July")
    .replace(/\bAug\b\.?/gi, "August")
    .replace(/\b(?:Sep|Sept)\b\.?/gi, "September")
    .replace(/\bOct\b\.?/gi, "October")
    .replace(/\bNov\b\.?/gi, "November")
    .replace(/\bDec\b\.?/gi, "December")
    // Clean up bullets and excess whitespace
    .replace(/[•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds precise, sub-scene level scripts that describe what is VISUALLY
 * visible on screen in each specific sub-scene.
 */
export function buildSceneScripts(data: IPOData): Record<string, string> {
  const exchangeText = data.exchange
    ? data.exchange.replace(/[•·\-\/]/g, " and ")
    : "National and Bombay Stock Exchanges";

  // Financial calculations
  const rawPatFirst = data.financials?.pat?.valuesFormatted?.[0] || "0";
  const isFirstYearLoss = rawPatFirst.includes("-") || rawPatFirst.toLowerCase().includes("loss");
  const patLossCleaned = rawPatFirst.replace(/[-–—]/g, "");

  // Peers dynamic extraction
  const peers = data.peers?.table || [];
  const targetPeer = peers.find((p) => p.isTargetCompany) || peers[0];
  const listedPeers = peers.filter((p) => p !== targetPeer);

  let peerSnippet = "";
  if (listedPeers.length >= 2) {
    const p1 = listedPeers[0];
    const p2 = listedPeers[1];
    const p1Ratio = p1.peRatio && p1.peRatio !== "N/A" ? `at ${p1.peRatio}` : "unlisted multiples par";
    const p2Ratio = p2.peRatio && p2.peRatio !== "N/A" ? `at ${p2.peRatio}` : "unlisted multiples par";
    peerSnippet = `jabki listed peers me ${p1.name} ${p1Ratio} aur ${p2.name} ${p2Ratio} par trade kar rahe hain.`;
  } else if (listedPeers.length === 1) {
    const p1 = listedPeers[0];
    const p1Ratio = p1.peRatio && p1.peRatio !== "N/A" ? `at ${p1.peRatio}` : "unlisted multiples par";
    peerSnippet = `jabki listed peer ${p1.name} ${p1Ratio} par trade kar raha hai.`;
  } else {
    peerSnippet = `broader sector multiples ke mukable.`;
  }

  // Dates
  const allotmentPart = data.issue?.allotmentDate ? `, allotment finalize hoga on ${data.issue.allotmentDate}` : "";
  const listingPart = data.issue?.listingDate ? `, aur listing hogi on ${data.issue.listingDate}` : "";

  // Sector / Industry
  const sectorName = data.industryContext?.sectorName || data.industry || "industry";

  // Profit arc
  const patLast = data.financials?.pat?.valuesFormatted?.[2] || "strong net profit";
  const patMarginLast = data.financials?.pat?.marginsPercent?.[2] || "healthy";
  const ebitdaLast = data.financials?.ebitda?.valuesFormatted?.[2] || "strong operating profit";

  const profitArcText = isFirstYearLoss
    ? `Bottom line par ebitda scale hua hai to ${ebitdaLast}, jabki net profit ne loss of ${patLossCleaned} se sharp turnaround karke positive ${patLast} deliver kiya hai with ${patMarginLast} profit margin.`
    : `Bottom line par ebitda scale hua hai to ${ebitdaLast}, aur net profit expand hokar ${rawPatFirst} se ${patLast} tak pahunch gaya hai with a ${patMarginLast} profit margin.`;

  const scripts: Record<string, string> = {
    // 01: Cold Open
    cold_open: `Kya India ki yeh upcoming company aapke paise ke liye ek solid opportunity hai, ya phir ek overhyped trap? Apply karne se pehle chaliye poora analysis detail me samajhte hain.`,

    // 02: Dalal Street Entrance
    logo_reveal: `${data.companyName} Dalal Street par enter kar rahi hai apne landmark IPO ke sath on the ${exchangeText}.`,

    // 03: Key Issue Numbers
    issue_numbers: `Company raise kar rahi hai ${data.issue?.totalFormatted || "capital"}, jiska price band hai ${data.issue?.priceBand || "band"} per share. Lot size ${data.issue?.lotSize || "lot"} ka hai, jisme minimum investment lagbhag ${data.issue?.minInvestment || "fifteen thousand"} ki hogi.`,

    // 04: IPO Roadmap & Dates
    timeline_stakes: `Bidding open ho rahi hai on ${data.issue?.biddingDates || "announced dates"}${allotmentPart}${listingPart}. Apne calendar me yeh dates zaroor note kar lijiye.`,

    // 05: Business Model Intro
    biz_title: `Chapter two: Business Model. Aakhir ${data.companyName} paise kaise kamati hai? Chaliye inke core revenue streams ko break down karte hain.`,

    // 06: Platform Value Proposition
    biz_story: `${data.businessModel?.headline || "Scaled commercial platform"}. ${data.businessModel?.description || ""}`,

    // 07: Revenue Segment Breakdown
    biz_donut: `Revenue contribution ki baat karein toh, ${data.businessModel?.segments ? data.businessModel.segments.map((s) => `${s.name} contribute karta hai ${s.sharePercent} percent`).join(", aur ") : "core business lines drive karte hain majority revenues"}.`,

    // 08: Operational Scale & AUM
    biz_metrics: `Operational scale par platform ke paas hai ${data.businessModel?.keyHighlights ? data.businessModel.keyHighlights.map((k) => `${k.value} ${k.label}`).join(", ") : "established operating footprint"}.`,

    // 09: Market Opportunity Intro
    ind_title: `Chapter three: Market Opportunity. India ka ${sectorName} space kitna bada hai, aur is growth ko kaunse structural tailwinds drive kar rahe hain?`,

    // 10: Addressable Market TAM
    tam_reveal: `${data.industryContext?.sectorName || "Yeh sector"} expand hokar reach kar sakta hai ${data.industryContext?.marketSizeFormatted || "multi-billion market"}, compounding at a rapid ${data.industryContext?.cagrText || "healthy CAGR"}.`,

    // 11: Structural Growth Drivers
    growth_drivers: `Key structural growth catalysts me shamil hain ${data.industryContext?.drivers ? data.industryContext.drivers.map((d) => d.title).join(", sath hi ") : "rising domestic demand aur supply chain localization"}.`,

    // 12: Competitive Positioning
    market_position: `${data.companyName} hold karti hai ek strong market presence, currently ${data.industryContext?.marketPosition || "positioned among leading suppliers"}.`,

    // 13: Financials Deep Dive Intro
    fin_title: `Chapter four: Financial Deep Dive. Chaliye ab inke revenue growth, profitability turnaround aur balance sheet strength ko evaluate karte hain.`,

    // 14: 3-Year Revenue Growth
    revenue_chart: `Topline revenue surge hua hai from ${data.financials?.revenue?.valuesFormatted?.[0] || "initial levels"} in ${data.financials?.years?.[0] || "early periods"} to ${data.financials?.revenue?.valuesFormatted?.[2] || "expanded levels"} in ${data.financials?.years?.[2] || "latest year"}, representing an impressive ${data.financials?.revenue?.cagr || "compound growth"}.`,

    // 15: Profitability Turnaround & EBITDA
    profit_arc: profitArcText,

    // 16: Balance Sheet & Cash Flows
    balance_sheet: `Balance sheet quality disciplined nazar aati hai: debt-to-equity ratio hai ${data.financials?.balanceSheet?.debtToEquity || "under one"}, operating cash flow ${data.financials?.balanceSheet?.cashFromOperations || "positive cash"} hai, aur return on net worth khada hai at ${data.financials?.balanceSheet?.ronwFormatted || "healthy returns"}.`,

    // 17: Financial Health Takeaway
    fin_summary: `Overall, ${data.companyName} demonstrate karti hai solid operating leverage aur reliable cash generation heading into the public markets.`,

    // 18: Issue Details Intro
    issue_title: `Chapter five: Issue Details aur Capital Allocation. Aakhir aapka invest kiya hua paisa kahan deploy kiya jayega?`,

    // 19: Fresh Issue vs OFS Split
    issue_split: `Issue structure me shamil hai ${data.issue?.freshFormatted || "fresh capital"} ka fresh capital issue, yaani ${data.issue?.freshPercent || "major portion"}, aur ${data.issue?.ofsFormatted || "offer for sale"} ka offer for sale component, yaani ${data.issue?.ofsPercent || "secondary component"}.`,

    // 20: Objects of the Offer
    objects_issue: `Fresh proceeds deploy kiye jayenge ${data.issue?.objectsOfIssue && data.issue.objectsOfIssue.length > 0 ? data.issue.objectsOfIssue.map((o) => `${o.percentage} towards ${o.purpose}`).join(", aur ") : "debt repayment aur growth expansion me"}.`,

    // 21: Reservation Quotas
    investor_quota: `Reservation quotas me retail investors ke liye allocated hai ${data.issue?.retailQuota || "35 percent"}, Q I B ke liye ${data.issue?.qibQuota || "50 percent"}, aur N I I ke liye ${data.issue?.niiQuota || "15 percent"}.`,

    // 22: Valuation & Peers Intro
    val_title: `Chapter six: Valuation aur Peer Benchmarking. Kya yeh issue listed competitors ke mukable attractively priced hai?`,

    // 23: Peer Benchmarking Matrix
    peer_comparison: `Upper price band par ${data.companyName} trade kar rahi hai at a price-to-earnings multiple of ${targetPeer?.peRatio || "attractive valuation"}, ${peerSnippet}`,

    // 24: Valuation Assessment
    val_summary: `Against an industry average P E of ${data.peers?.industryAveragePe || "twenty-five times"}, ${data.peers?.commentary || "issue pricing provides a reasonable margin of safety compared to peers."}`,

    // 25: Key Risks Intro
    risk_title: `Chapter seven: Critical Risks aur Red Flags. Har smart investor ko in key vulnerabilities par zaroor dhyan dena chahiye.`,

    // 26: Primary Structural Risks
    risk_cards: `Pehla bada risk hai ${data.risks?.items?.[0]?.title || "market concentration"}${data.risks?.items?.[0]?.detail ? `, primarily driven by ${data.risks.items[0].detail}` : ""}. Iske alawa investors ko monitor karna hoga ${data.risks?.items?.[1]?.title || "raw material costs"} aur ${data.risks?.items?.[2]?.title || "working capital requirements"}.`,

    // 27: Asset Quality & Risk Rating
    risk_summary: `Overall risk profile moderate assessed hai. ${data.risks?.bottomNote || "Investors ko in risk factors ko carefully evaluate karna chahiye before bidding."}`,

    // 28: Verdict & Scorecard Intro
    verdict_title: `Chapter eight: Final Decision aur Scorecard. Chaliye dekhte hain latest grey market premium aur humara comprehensive analyst scorecard.`,

    // 29: GMP & Analyst Scorecard
    scorecard: `Active grey market premium trend kar raha hai at ${data.verdict?.gmp?.currentGmpFormatted || "positive trend"}, signaling an estimated listing price of ${data.verdict?.gmp?.estimatedListingPrice || "premium listing"}. Humara verdict: short term gains ke liye ${data.verdict?.shortTermVerdict || "Apply for listing gains"}, aur long term compounding ke liye ${data.verdict?.longTermVerdict || "Subscribe"}, achieving an overall scorecard rating of ${data.verdict?.scorecard?.overallRating || "7.8 out of 10"}.`,

    // 30: Bidding Strategy & Outro
    outro: `Aapki bidding strategy kya hai ${data.companyName} ke liye? Apne thoughts comments me zaroor share karein! Video pasand aaya ho toh like karein aur daily IPO analysis ke liye channel ko subscribe karein.`,
  };

  return scripts;
}

/**
 * Synthesizes audio using Google Translate Web TTS (cross-platform, zero dependencies, works in Linux CI)
 */
async function synthesizeWithGoogleTTS(text: string, outMp3Path: string): Promise<boolean> {
  try {
    const rawChunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks: string[] = [];

    for (const chunk of rawChunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;
      if (trimmed.length <= 180) {
        chunks.push(trimmed);
      } else {
        const words = trimmed.split(" ");
        let curr = "";
        for (const w of words) {
          if ((curr + " " + w).trim().length <= 180) {
            curr = (curr + " " + w).trim();
          } else {
            if (curr) chunks.push(curr);
            curr = w;
          }
        }
        if (curr) chunks.push(curr);
      }
    }

    const buffers: Buffer[] = [];
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      if (!res.ok) {
        throw new Error(`Google TTS returned HTTP ${res.status}`);
      }
      const arr = await res.arrayBuffer();
      buffers.push(Buffer.from(arr));
    }

    if (buffers.length > 0) {
      const totalBuffer = Buffer.concat(buffers);
      fs.writeFileSync(outMp3Path, totalBuffer);
      if (fs.existsSync(outMp3Path) && fs.statSync(outMp3Path).size > 1000) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn(`   ⚠️ Google TTS fallback error:`, err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Offline Speech Synthesis Fallback (Windows SAPI via PowerShell)
 */
function generateOfflineTTS(text: string, outWavPath: string): boolean {
  try {
    const cleanText = text.replace(/["\r\n]+/g, " ").replace(/'/g, "''").trim();
    const script = [
      `Add-Type -AssemblyName System.Speech`,
      `$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer`,
      `$synth.SetOutputToWaveFile('${outWavPath.replace(/\\/g, "/")}')`,
      `$synth.Speak('${cleanText}')`,
      `$synth.Dispose()`,
    ].join("; ");

    const encoded = Buffer.from(script, "utf16le").toString("base64");
    const result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded], {
      timeout: 30000,
    });

    if (result.status === 0 && fs.existsSync(outWavPath) && fs.statSync(outWavPath).size > 1000) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Synthesizes audio using Edge-TTS with multi-voice retry
 */
async function synthesizeWithEdgeTTS(
  text: string,
  voiceName: string,
  outMp3Path: string,
  speed: number = 1.25,
  volume: number = 1.6
): Promise<boolean> {
  const candidateVoices = [
    voiceName,
    "hi-IN-MadhurNeural",
    "hi-IN-SwaraNeural",
    "en-IN-PrabhatNeural",
    "en-IN-NeerjaNeural",
    "en-US-ChristopherNeural",
    "en-US-GuyNeural",
  ];
  const uniqueVoices = Array.from(new Set(candidateVoices));
  const ratePercent = Math.round((speed - 1) * 100);
  const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
  const volPercent = Math.round((volume - 1) * 100);
  const volStr = volPercent >= 0 ? `+${volPercent}%` : `${volPercent}%`;

  for (const v of uniqueVoices) {
    try {
      const tts = new EdgeTTS();
      await tts.synthesize(text, v, { rate: rateStr, pitch: "+0Hz", volume: volStr });
      await tts.toFile(outMp3Path);

      if (fs.existsSync(outMp3Path) && fs.statSync(outMp3Path).size > 1000) {
        return true;
      }
    } catch {
      // try next voice in list
    }
  }
  return false;
}

/**
 * Synthesizes audio using Cartesia Sonic API (/tts/bytes endpoint)
 * Directly returns MP3 binary stream
 */
async function synthesizeWithCartesia(
  text: string,
  outMp3Path: string,
  apiKey: string,
  voiceId: string,
  modelId: string,
  language: string = "hi",
  speed: number = 1.25,
  volume: number = 1.6
): Promise<{ success: boolean; status: number; error?: string }> {
  try {
    const res = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: modelId,
        transcript: text,
        voice: {
          mode: "id",
          id: voiceId,
        },
        output_format: {
          container: "mp3",
          sample_rate: 44100,
          bit_rate: 128000,
        },
        language,
        generation_config: {
          speed: Math.max(0.6, Math.min(1.5, speed)),
          volume: Math.max(0.5, Math.min(2.0, volume)),
        },
      }),
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      fs.writeFileSync(outMp3Path, Buffer.from(arrayBuffer));
      return { success: true, status: res.status };
    }

    const errText = await res.text();
    return { success: false, status: res.status, error: errText };
  } catch (err: any) {
    return { success: false, status: 0, error: err?.message || String(err) };
  }
}

/**
 * Cascade voice synthesizer for an audio track:
 * 1. Cartesia Sonic Multi-Key Failover Pool (rotates keys & auto-skips exhausted/rate-limited keys)
 * 2. Microsoft Neural Indian English (Edge-TTS)
 * 3. Cross-platform Web Speech (Google TTS)
 * 4. Local offline speech synthesis (Windows SAPI)
 */
async function synthesizeSpeech(
  text: string,
  outMp3Path: string,
  outWavPath: string,
  keys: string[],
  voiceId: string,
  modelId: string,
  startKeyIndex: number = 0,
  language: string = "hi",
  speed: number = 1.25,
  volume: number = 1.6
): Promise<{ filePath: string; isFallback: boolean; usedKeyIndex: number }> {
  // Option 1: Cartesia Multi-Key Failover Pool
  if (keys.length > 0) {
    for (let offset = 0; offset < keys.length; offset++) {
      const kIdx = (startKeyIndex + offset) % keys.length;
      const key = keys[kIdx];
      const keyLabel = `Key #${kIdx + 1} (${maskKey(key)})`;

      const cartesiaRes = await synthesizeWithCartesia(text, outMp3Path, key, voiceId, modelId, language, speed, volume);
      if (cartesiaRes.success) {
        console.log(`   ✅ Synthesized with Cartesia ${keyLabel} (${speed}x speed, ${volume}x vol)`);
        return { filePath: outMp3Path, isFallback: false, usedKeyIndex: kIdx };
      }

      console.warn(`   ⚠️ Cartesia ${keyLabel} returned HTTP ${cartesiaRes.status}: ${(cartesiaRes.error || "").slice(0, 90)}`);

      const isQuotaOrAuth =
        cartesiaRes.status === 401 ||
        cartesiaRes.status === 402 ||
        cartesiaRes.status === 429 ||
        cartesiaRes.error?.toLowerCase().includes("quota") ||
        cartesiaRes.error?.toLowerCase().includes("credit") ||
        cartesiaRes.error?.toLowerCase().includes("limit") ||
        cartesiaRes.error?.toLowerCase().includes("rate");

      if (isQuotaOrAuth) {
        console.warn(`   ⚠️ [Cartesia Pool] ${keyLabel} quota/credits exhausted. Moving to next key in pool...`);
        markKeyExhausted(key, `HTTP ${cartesiaRes.status}`);
      }
    }
  }

  // Option 2: Microsoft Neural Indian English Voice (Edge-TTS)
  console.log(`   🎙️ Falling back to Microsoft Neural Voice (Edge-TTS)...`);
  const defaultIndianVoice = process.env.EDGE_TTS_VOICE || "hi-IN-MadhurNeural";
  const edgeOk = await synthesizeWithEdgeTTS(text, defaultIndianVoice, outMp3Path, speed);
  if (edgeOk) {
    return { filePath: outMp3Path, isFallback: true, usedKeyIndex: -1 };
  }

  // Option 3: Cross-platform Web Speech (Google TTS)
  console.log(`   🎙️ Falling back to Cross-Platform Web Speech synthesizer...`);
  const googleOk = await synthesizeWithGoogleTTS(text, outMp3Path);
  if (googleOk) {
    return { filePath: outMp3Path, isFallback: true, usedKeyIndex: -1 };
  }

  // Option 4: Local offline speech synthesis (Windows SAPI)
  console.log(`   🎙️ Falling back to offline local voice synthesizer...`);
  const success = generateOfflineTTS(text, outWavPath);
  if (success) {
    return { filePath: outWavPath, isFallback: true, usedKeyIndex: -1 };
  }

  throw new Error(`Failed to synthesize voice for text: "${text.slice(0, 40)}..."`);
}

/**
 * Granular scene-by-scene audio generation (Approach 1):
 * - Generates 1-to-1 audio files for every visual sub-scene
 * - Accurately probes each audio duration with music-metadata
 * - Assigns exact frames to each scene so audio and visuals are perfectly synchronized
 * - Aggregates chapters for the bottom progress bar
 */
export async function generateAudioAndTimeline(
  ipoData: IPOData,
  options: AudioGenerationOptions = {}
): Promise<AudioGenerationResult> {
  const slug = ipoData.id;
  const audioDir = path.resolve(__dirname, `../public/audio/${slug}`);
  const scenesAudioDir = path.join(audioDir, "scenes");

  if (!fs.existsSync(scenesAudioDir)) {
    fs.mkdirSync(scenesAudioDir, { recursive: true });
  }

  // Build granular scene scripts
  const sceneScripts = buildSceneScripts(ipoData);
  ipoData.sceneScripts = sceneScripts;

  const keys = getCartesiaKeys();
  const voiceId = options.voiceId || process.env.CARTESIA_VOICE_ID || "fd2ada67-c2d9-4afe-b474-6386b87d8fc3";
  const modelId = options.modelId || process.env.CARTESIA_MODEL_ID || "sonic-3.6";
  const language = process.env.CARTESIA_LANGUAGE || "hi";
  const speed = options.speed || parseFloat(process.env.CARTESIA_SPEED || process.env.VIDEO_SPEED || "1.25");
  const volume = options.volume ?? parseFloat(process.env.CARTESIA_VOLUME || process.env.VOICE_VOLUME || "1.6");

  console.log(`\n🎧 ======================================================`);
  console.log(`🎧 GENERATING SCENE-BY-SCENE AUDIO & TIMELINE: ${ipoData.companyName}`);
  console.log(`🎧 Slug: ${slug} | 30 Granular Sub-Scenes across 8 Chapters`);
  console.log(`🎧 Cartesia Failover Pool: ${keys.length} API key(s) detected`);
  console.log(`🎧 Voice ID: ${voiceId} | Model: ${modelId} | Speed: ${speed}x | Volume: ${volume}x`);
  console.log(`🎧 ======================================================`);

  const generatedAudioFiles: string[] = [];
  const scenes: SceneTiming[] = [];
  let anyFallbackUsed = false;
  let currentFrom = 0;
  let activeKeyIndex = 0;

  for (let idx = 0; idx < SUB_SCENE_DEFINITIONS.length; idx++) {
    const sceneDef = SUB_SCENE_DEFINITIONS[idx];
    const rawScript = sceneScripts[sceneDef.id] || "";
    const scriptText = cleanScriptForSpeech(rawScript);

    const mp3File = path.join(scenesAudioDir, `scene_${sceneDef.id}.mp3`);
    const wavFile = path.join(scenesAudioDir, `scene_${sceneDef.id}.wav`);

    console.log(`\n🔊 [${idx + 1}/30] Scene "${sceneDef.id}" (Ch ${sceneDef.chapterIndex + 1}): "${scriptText.slice(0, 60)}..."`);

    let activeFilePath = "";
    const hasValidMp3 = fs.existsSync(mp3File) && fs.statSync(mp3File).size > 1000;
    const hasValidWav = fs.existsSync(wavFile) && fs.statSync(wavFile).size > 1000;
    const forceRecreate = Boolean(options.force);

    if (!forceRecreate && (hasValidMp3 || hasValidWav)) {
      activeFilePath = hasValidMp3 ? mp3File : wavFile;
      console.log(`   ⚡ [Cache Hit] Reusing: ${path.basename(activeFilePath)}`);
    } else {
      const res = await synthesizeSpeech(scriptText, mp3File, wavFile, keys, voiceId, modelId, activeKeyIndex, language, speed, volume);
      if (res.usedKeyIndex >= 0) {
        activeKeyIndex = res.usedKeyIndex;
      }
      activeFilePath = res.filePath;
      if (res.isFallback) anyFallbackUsed = true;
    }

    // Measure exact audio duration
    const metadata = await mm.parseFile(activeFilePath);
    const durationSec = metadata.format.duration || 5.0;

    // Scale minimum frames and buffer by speed for tight, high-energy pacing
    const scaledMinFrames = Math.round(sceneDef.minFrames / speed);
    const breathBufferSec = 0.28 / Math.max(1, speed * 0.9);
    const neededFrames = Math.ceil((durationSec + breathBufferSec) * 30);
    const durationInFrames = Math.max(scaledMinFrames, neededFrames);

    const relativeRemotionPath = `audio/${slug}/scenes/${path.basename(activeFilePath)}`;
    generatedAudioFiles.push(activeFilePath);

    const sceneTiming: SceneTiming = {
      id: sceneDef.id,
      chapterIndex: sceneDef.chapterIndex,
      title: sceneDef.title,
      from: currentFrom,
      durationInFrames,
      audioDurationSec: durationSec,
      audioFile: relativeRemotionPath,
      scriptText,
    };

    scenes.push(sceneTiming);
    currentFrom += durationInFrames;

    console.log(`   ⏱️  Duration: ${durationSec.toFixed(2)}s | Frames: ${durationInFrames} (from ${sceneTiming.from})`);
  }

  // Aggregate chapters for the bottom segmented progress timeline
  const chapters: ChapterTiming[] = [];
  for (let chIdx = 0; chIdx < CHAPTER_METADATA.length; chIdx++) {
    const meta = CHAPTER_METADATA[chIdx];
    const scenesInChapter = scenes.filter((s) => s.chapterIndex === chIdx);

    const chFrom = scenesInChapter.length > 0 ? scenesInChapter[0].from : 0;
    const chDuration = scenesInChapter.reduce((acc, s) => acc + s.durationInFrames, 0);
    const totalAudioSec = scenesInChapter.reduce((acc, s) => acc + (s.audioDurationSec || 0), 0);

    chapters.push({
      index: chIdx,
      id: meta.id,
      title: meta.title,
      shortTitle: meta.shortTitle,
      from: chFrom,
      durationInFrames: chDuration,
      audioDurationSec: totalAudioSec,
    });
  }

  const totalFrames = currentFrom;

  const timeline: VideoTimeline = {
    totalFrames,
    fps: 30,
    voiceId,
    chapters,
    scenes,
  };

  // Background Music setup
  const globalBg1 = path.resolve(__dirname, "../public/audio/background.mp3");
  const globalBg2 = path.resolve(__dirname, "../public/audio/bg_music.mp3");
  const localBg = path.join(audioDir, "background.mp3");

  let bgFileRelative: string | undefined;
  if (fs.existsSync(localBg) && fs.statSync(localBg).size > 1000) {
    bgFileRelative = `audio/${slug}/background.mp3`;
  } else if (fs.existsSync(globalBg1) && fs.statSync(globalBg1).size > 1000) {
    bgFileRelative = "audio/background.mp3";
  } else if (fs.existsSync(globalBg2) && fs.statSync(globalBg2).size > 1000) {
    bgFileRelative = "audio/bg_music.mp3";
  }

  const bgVolume = process.env.BG_MUSIC_VOLUME ? parseFloat(process.env.BG_MUSIC_VOLUME) : 0.05;

  if (bgFileRelative) {
    ipoData.bgMusic = {
      file: bgFileRelative,
      volume: bgVolume,
    };
    console.log(`\n🎵 [Background Music] Active: ${bgFileRelative} (${(bgVolume * 100).toFixed(0)}% volume bed)`);
  }

  // Update IPOData and write back to src/data/{slug}.json
  ipoData.timeline = timeline;
  const jsonPath = path.resolve(__dirname, `../src/data/${slug}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(ipoData, null, 2), "utf-8");

  console.log(`\n======================================================`);
  console.log(`📊 30 SCENE-BY-SCENE TIMELINE COMPUTED (FPS: 30)`);
  console.log(`======================================================`);
  chapters.forEach((ch) => {
    const fromSec = (ch.from / 30).toFixed(2);
    const durSec = (ch.durationInFrames / 30).toFixed(2);
    console.log(`   Ch ${ch.index + 1} [${ch.shortTitle}]: from ${ch.from} (${fromSec}s) | dur: ${ch.durationInFrames} frames (${durSec}s)`);
  });
  console.log(`------------------------------------------------------`);
  console.log(`🎬 Total Video Duration: ${totalFrames} frames (~${(totalFrames / 30 / 60).toFixed(2)} minutes)`);
  console.log(`💾 Saved updated dataset to: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`======================================================\n`);

  return {
    timeline,
    audioFiles: generatedAudioFiles,
    usedFallbackTTS: anyFallbackUsed,
  };
}

// Standalone CLI runner
if (require.main === module) {
  const args = process.argv.slice(2);
  let slug = "moneyview";
  let force = false;
  let voiceId: string | undefined = undefined;

  for (const arg of args) {
    if (arg.startsWith("--ipo=")) slug = arg.replace("--ipo=", "").trim().toLowerCase();
    if (arg.startsWith("--voice=")) voiceId = arg.replace("--voice=", "").trim();
    if (arg === "--force") force = true;
  }

  const jsonPath = path.resolve(__dirname, `../src/data/${slug}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Data file not found: ${jsonPath}`);
    process.exit(1);
  }

  const ipoData = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as IPOData;

  generateAudioAndTimeline(ipoData, { force, voiceId })
    .then(() => {
      console.log(`✅ Scene-by-scene audio and timeline generation completed successfully!`);
    })
    .catch((err) => {
      console.error(`❌ Audio generation failed:`, err);
      process.exit(1);
    });
}
