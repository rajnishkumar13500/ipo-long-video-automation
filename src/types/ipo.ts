export interface ChapterScripts {
  chapter_1: string; // 01: The Hook & Overview (~80-100 words)
  chapter_2: string; // 02: Business Model & Revenue Segments (~100-130 words)
  chapter_3: string; // 03: Industry & Market TAM (~80-110 words)
  chapter_4: string; // 04: 3-Year Financial Deep Dive (~130-160 words)
  chapter_5: string; // 05: Issue Details & Objects of Offer (~90-120 words)
  chapter_6: string; // 06: Peer Benchmarking & Valuation (~100-130 words)
  chapter_7: string; // 07: Red Flags & Key Risks (~90-120 words)
  chapter_8: string; // 08: Final Verdict & Decision Scorecard (~90-130 words)
}

export interface ChapterTiming {
  index: number;
  id: string; // "chapter_1" ... "chapter_8"
  title: string; // e.g. "01 / The Hook & Overview"
  shortTitle: string; // e.g. "Overview"
  from: number;
  durationInFrames: number;
  audioDurationSec?: number;
  audioFile?: string;
}

export interface SceneTiming {
  id: string;
  chapterIndex: number;
  title: string;
  from: number;
  durationInFrames: number;
  audioDurationSec?: number;
  audioFile?: string;
  scriptText?: string;
}

export interface VideoTimeline {
  totalFrames: number;
  fps: number;
  voiceId?: string;
  chapters: ChapterTiming[];
  scenes?: SceneTiming[];
}

export interface PeerComparisonRow {
  name: string;
  peRatio: string; // e.g. "28.4x"
  pbRatio?: string; // e.g. "4.2x"
  evEbitda?: string; // e.g. "18.5x"
  revenueFormatted: string; // e.g. "₹2,840 Cr"
  patFormatted: string; // e.g. "₹310 Cr"
  ronwFormatted: string; // e.g. "17.4%"
  isTargetCompany?: boolean;
}

export interface RiskItemData {
  severity: "High" | "Medium" | "Low";
  tag: string; // e.g. "Credit Risk", "Regulatory", "Concentration"
  title: string;
  detail: string;
}

export interface IPOData {
  id: string; // e.g. "moneyview"
  companyName: string; // e.g. "Money View Technologies"
  ticker?: string; // e.g. "MONEYVIEW"
  industry: string; // e.g. "Fintech & Digital Lending"
  domain?: string;
  logoUrl?: string;
  logoUrls?: string[];
  logoInitials?: string;
  logoBgColor?: string;
  exchange?: string; // e.g. "NSE • BSE"
  badgeSubtitle?: string; // e.g. "IPO Deep-Dive Analysis"
  listingDate?: string; // e.g. "2026-09-25"
  scripts?: ChapterScripts;
  sceneScripts?: Record<string, string>;
  timeline?: VideoTimeline;
  bgMusic?: {
    file: string;
    volume?: number;
  };

  // Chapter 1 & 5: Issue Details & Objects of the Offer
  issue: {
    totalFormatted: string; // e.g. "₹1,200 Cr"
    freshFormatted: string; // e.g. "₹800 Cr"
    freshPercent?: string; // e.g. "66.7%"
    ofsFormatted: string; // e.g. "₹400 Cr"
    ofsPercent?: string; // e.g. "33.3%"
    priceBand: string; // e.g. "₹120 – ₹128"
    lotSize: string; // e.g. "115 shares"
    minInvestment: string; // e.g. "₹14,720"
    retailQuota?: string; // e.g. "35%"
    qibQuota?: string; // e.g. "50%"
    niiQuota?: string; // e.g. "15%"
    biddingDates?: string; // e.g. "Oct 14 – Oct 16, 2026"
    allotmentDate?: string;
    listingDate?: string;
    objectsOfIssue?: Array<{
      purpose: string;
      amountFormatted: string;
      percentage: string;
    }>;
  };

  // Chapter 2: Business Model & Revenue Segments
  businessModel: {
    headline: string;
    description: string;
    segments: Array<{
      name: string;
      sharePercent: number; // e.g. 62
      description: string;
      amountFormatted?: string;
    }>;
    keyHighlights: Array<{
      label: string;
      value: string;
      subtext?: string;
    }>;
  };

  // Chapter 3: Industry Backdrop & TAM
  industryContext: {
    sectorName: string;
    marketSizeFormatted: string; // e.g. "$45 Billion by 2028"
    cagrText: string; // e.g. "22% Industry CAGR"
    drivers: Array<{
      title: string;
      detail: string;
    }>;
    marketPosition: string; // e.g. "#3 Digital Lending Platform in India"
  };

  // Chapter 4: 3-Year Historical Financials
  financials: {
    years: [string, string, string]; // e.g. ["FY23", "FY24", "FY25"]
    revenue: {
      valuesFormatted: [string, string, string]; // e.g. ["₹577 Cr", "₹1,012 Cr", "₹1,620 Cr"]
      rawCr: [number, number, number];
      cagr: string; // e.g. "67% CAGR"
    };
    ebitda: {
      valuesFormatted: [string, string, string];
      marginsPercent: [string, string, string]; // e.g. ["12.5%", "15.8%", "18.2%"]
      rawCr: [number, number, number];
    };
    pat: {
      valuesFormatted: [string, string, string]; // e.g. ["-₹12 Cr", "₹78 Cr", "₹172 Cr"]
      marginsPercent: [string, string, string];
      isProfitableNow: boolean;
    };
    balanceSheet: {
      debtToEquity: string; // e.g. "0.38x"
      cashFromOperations: string; // e.g. "₹142 Cr"
      ronwFormatted: string; // e.g. "19.5%"
      roceFormatted?: string; // e.g. "22.1%"
    };
  };

  // Chapter 6: Listed Peer Comparison
  peers: {
    industryAveragePe: string; // e.g. "34.5x"
    commentary: string; // e.g. "Priced at a 15% discount to peer median."
    table: PeerComparisonRow[];
  };

  // Chapter 7: Risks & Red Flags
  risks: {
    items: RiskItemData[];
    overallRiskLevel: "Low" | "Moderate" | "High";
    bottomNote: string;
  };

  // Chapter 8: Final Verdict & Decision Scorecard
  verdict: {
    gmp: {
      currentGmpFormatted: string; // e.g. "₹28 (22%)"
      estimatedListingPrice: string; // e.g. "₹156"
      trend: "Bullish" | "Neutral" | "Bearish";
    };
    scorecard: {
      businessMoat: number; // 1-10
      financialGrowth: number; // 1-10
      profitabilityQuality: number; // 1-10
      valuationFairness: number; // 1-10
      overallRating: string; // e.g. "7.8 / 10"
    };
    shortTermVerdict: "Apply for Listing Gains" | "May Apply" | "Avoid";
    shortTermRationale: string;
    longTermVerdict: "Subscribe for Long Term" | "Wait for Dips" | "Avoid";
    longTermRationale: string;
    summaryTake: string;
  };
}
