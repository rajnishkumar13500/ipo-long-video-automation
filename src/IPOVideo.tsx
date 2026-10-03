import React from "react";
import { AbsoluteFill, Sequence, getInputProps, Audio, staticFile, interpolate, useCurrentFrame } from "remotion";
import { C } from "./components/Tokens";
import { TopNavBar } from "./components/TopNavBar";
import { BottomProgressBar } from "./components/BottomProgressBar";
import { GrainOverlay } from "./components/GrainOverlay";
import { ChapterTitleCard } from "./components/ChapterTitleCard";
import { IPOData, ChapterTiming } from "./types/ipo";
import moneyviewData from "./data/moneyview.json";

// ─── Scene Imports ────────────────────────────────────────────────────────────
import { Scene01ColdOpen } from "./scenes/Scene01ColdOpen";
import { Scene02LogoReveal } from "./scenes/Scene02LogoReveal";
import { Scene03IssueNumbers } from "./scenes/Scene03IssueNumbers";
import { Scene04Timeline } from "./scenes/Scene04Timeline";
import { Scene06BusinessStory } from "./scenes/Scene06BusinessStory";
import { Scene07RevenueDonut } from "./scenes/Scene07RevenueDonut";
import { Scene08BusinessMetrics } from "./scenes/Scene08BusinessMetrics";
import { Scene10TAMReveal } from "./scenes/Scene10TAMReveal";
import { Scene11GrowthDrivers } from "./scenes/Scene11GrowthDrivers";
import { Scene12MarketPosition } from "./scenes/Scene12MarketPosition";
import { Scene14RevenueChart } from "./scenes/Scene14RevenueChart";
import { Scene15ProfitArc } from "./scenes/Scene15ProfitArc";
import { Scene16BalanceSheet } from "./scenes/Scene16BalanceSheet";
import { Scene17FinancialSummary } from "./scenes/Scene17FinancialSummary";
import { Scene18IssueSplit } from "./scenes/Scene18IssueSplit";
import { Scene19ObjectsOfIssue } from "./scenes/Scene19ObjectsOfIssue";
import { Scene20InvestorQuota } from "./scenes/Scene20InvestorQuota";
import { Scene22PeerComparison } from "./scenes/Scene22PeerComparison";
import { Scene23ValuationSummary } from "./scenes/Scene23ValuationSummary";
import { Scene25RiskCards } from "./scenes/Scene25RiskCards";
import { Scene26RiskSummary } from "./scenes/Scene26RiskSummary";
import { Scene27Scorecard } from "./scenes/Scene27Scorecard";
import { Scene28Outro } from "./scenes/Scene28Outro";

export interface IPOVideoProps {
  data?: IPOData;
  [key: string]: unknown;
}

export const defaultIPOData = moneyviewData as unknown as IPOData;

export function resolveIPOData(props?: Record<string, unknown>): IPOData {
  // 1. Highest priority: Remotion CLI inputProps (if provided via --props)
  const cliProps = getInputProps() as Record<string, unknown>;
  if (cliProps?.data && typeof cliProps.data === "object" && "companyName" in (cliProps.data as Record<string, unknown>)) {
    return cliProps.data as IPOData;
  }
  if (cliProps && "companyName" in cliProps && typeof cliProps.companyName === "string") {
    return cliProps as unknown as IPOData;
  }

  // 2. React prop passed directly
  if (props?.data && typeof props.data === "object" && "companyName" in (props.data as Record<string, unknown>)) {
    return props.data as IPOData;
  }
  if (props && "companyName" in props && typeof props.companyName === "string") {
    return props as unknown as IPOData;
  }

  // 3. Fallback to default
  return defaultIPOData;
}

// ─── Sub-Scene Definitions ────────────────────────────────────────────────────
// Each chapter is broken into multiple cinematic sub-scenes.
// When timeline chapters are provided, sub-scenes are distributed within each chapter's frame range.

interface SubScene {
  id: string;
  chapterIndex: number; // 0-7 mapping to chapter_1 to chapter_8
  fractionOfChapter: number; // fraction of parent chapter duration (0-1)
  render: (data: IPOData) => React.ReactNode;
}

const SUB_SCENES: SubScene[] = [
  // Chapter 1: Hook (4 sub-scenes)
  { id: "cold_open", chapterIndex: 0, fractionOfChapter: 0.18, render: (d) => <Scene01ColdOpen data={d} /> },
  { id: "logo_reveal", chapterIndex: 0, fractionOfChapter: 0.24, render: (d) => <Scene02LogoReveal data={d} /> },
  { id: "issue_numbers", chapterIndex: 0, fractionOfChapter: 0.34, render: (d) => <Scene03IssueNumbers data={d} /> },
  { id: "timeline_stakes", chapterIndex: 0, fractionOfChapter: 0.24, render: (d) => <Scene04Timeline data={d} /> },

  // Chapter 2: Business Model (4 sub-scenes)
  { id: "biz_title", chapterIndex: 1, fractionOfChapter: 0.10, render: () => <ChapterTitleCard chapterNumber={2} title="How Does It Make Money?" subtitle="Revenue streams, product offerings, and monetization channels" color={C.cyan} icon="🏢" /> },
  { id: "biz_story", chapterIndex: 1, fractionOfChapter: 0.30, render: (d) => <Scene06BusinessStory data={d} /> },
  { id: "biz_donut", chapterIndex: 1, fractionOfChapter: 0.35, render: (d) => <Scene07RevenueDonut data={d} /> },
  { id: "biz_metrics", chapterIndex: 1, fractionOfChapter: 0.25, render: (d) => <Scene08BusinessMetrics data={d} /> },

  // Chapter 3: Industry & TAM (4 sub-scenes)
  { id: "ind_title", chapterIndex: 2, fractionOfChapter: 0.10, render: () => <ChapterTitleCard chapterNumber={3} title="Market Opportunity" subtitle="Sector dynamics, growth vectors, and competitive positioning" color={C.yellow} icon="🌍" /> },
  { id: "tam_reveal", chapterIndex: 2, fractionOfChapter: 0.30, render: (d) => <Scene10TAMReveal data={d} /> },
  { id: "growth_drivers", chapterIndex: 2, fractionOfChapter: 0.40, render: (d) => <Scene11GrowthDrivers data={d} /> },
  { id: "market_position", chapterIndex: 2, fractionOfChapter: 0.20, render: (d) => <Scene12MarketPosition data={d} /> },

  // Chapter 4: Financials (5 sub-scenes)
  { id: "fin_title", chapterIndex: 3, fractionOfChapter: 0.08, render: () => <ChapterTitleCard chapterNumber={4} title="3-Year Financial Deep Dive" subtitle="Revenue, margins, profitability, and balance sheet" color={C.green} icon="📊" /> },
  { id: "revenue_chart", chapterIndex: 3, fractionOfChapter: 0.27, render: (d) => <Scene14RevenueChart data={d} /> },
  { id: "profit_arc", chapterIndex: 3, fractionOfChapter: 0.27, render: (d) => <Scene15ProfitArc data={d} /> },
  { id: "balance_sheet", chapterIndex: 3, fractionOfChapter: 0.22, render: (d) => <Scene16BalanceSheet data={d} /> },
  { id: "fin_summary", chapterIndex: 3, fractionOfChapter: 0.16, render: (d) => <Scene17FinancialSummary data={d} /> },

  // Chapter 5: Issue Details (3 sub-scenes)
  { id: "issue_title", chapterIndex: 4, fractionOfChapter: 0.10, render: () => <ChapterTitleCard chapterNumber={5} title="Issue Details & Use of Proceeds" subtitle="Where will your capital be deployed?" color={C.blue} icon="💰" /> },
  { id: "issue_split", chapterIndex: 4, fractionOfChapter: 0.35, render: (d) => <Scene18IssueSplit data={d} /> },
  { id: "objects_issue", chapterIndex: 4, fractionOfChapter: 0.30, render: (d) => <Scene19ObjectsOfIssue data={d} /> },
  { id: "investor_quota", chapterIndex: 4, fractionOfChapter: 0.25, render: (d) => <Scene20InvestorQuota data={d} /> },

  // Chapter 6: Valuation & Peers (3 sub-scenes)
  { id: "val_title", chapterIndex: 5, fractionOfChapter: 0.08, render: () => <ChapterTitleCard chapterNumber={6} title="Cheap or Expensive?" subtitle="Benchmarking against listed market peers" color={C.purple} icon="⚖️" /> },
  { id: "peer_comparison", chapterIndex: 5, fractionOfChapter: 0.55, render: (d) => <Scene22PeerComparison data={d} /> },
  { id: "val_summary", chapterIndex: 5, fractionOfChapter: 0.37, render: (d) => <Scene23ValuationSummary data={d} /> },

  // Chapter 7: Risks (3 sub-scenes)
  { id: "risk_title", chapterIndex: 6, fractionOfChapter: 0.08, render: () => <ChapterTitleCard chapterNumber={7} title="Critical Risks & Red Flags" subtitle="Structural threats that could derail performance" color={C.coral} icon="⚠️" /> },
  { id: "risk_cards", chapterIndex: 6, fractionOfChapter: 0.62, render: (d) => <Scene25RiskCards data={d} /> },
  { id: "risk_summary", chapterIndex: 6, fractionOfChapter: 0.30, render: (d) => <Scene26RiskSummary data={d} /> },

  // Chapter 8: Verdict (2 sub-scenes)
  { id: "verdict_title", chapterIndex: 7, fractionOfChapter: 0.08, render: () => <ChapterTitleCard chapterNumber={8} title="Final Verdict: Apply or Avoid?" subtitle="Listing gains probability & analyst scorecard" color={C.green} icon="🏆" /> },
  { id: "scorecard", chapterIndex: 7, fractionOfChapter: 0.58, render: (d) => <Scene27Scorecard data={d} /> },
  { id: "outro", chapterIndex: 7, fractionOfChapter: 0.34, render: (d) => <Scene28Outro data={d} /> },
];

export const DEFAULT_CHAPTERS: ChapterTiming[] = [
  { index: 0, id: "chapter_1", title: "Overview & Issue Highlights", shortTitle: "Overview", from: 0, durationInFrames: 1385 },
  { index: 1, id: "chapter_2", title: "Business Model & Monetization", shortTitle: "Business", from: 1385, durationInFrames: 1475 },
  { index: 2, id: "chapter_3", title: "Industry Backdrop & Market TAM", shortTitle: "Industry", from: 2860, durationInFrames: 1501 },
  { index: 3, id: "chapter_4", title: "3-Year Financial Statements", shortTitle: "Financials", from: 4361, durationInFrames: 1758 },
  { index: 4, id: "chapter_5", title: "Issue Details & Fresh Capital", shortTitle: "Issue", from: 6119, durationInFrames: 1556 },
  { index: 5, id: "chapter_6", title: "Valuation & Peer Benchmarking", shortTitle: "Valuation", from: 7675, durationInFrames: 1598 },
  { index: 6, id: "chapter_7", title: "Structural Red Flags & Risks", shortTitle: "Risks", from: 9273, durationInFrames: 1675 },
  { index: 7, id: "chapter_8", title: "Final Decision & Analyst Scorecard", shortTitle: "Verdict", from: 10948, durationInFrames: 1454 },
];

export const IPOVideo: React.FC<IPOVideoProps> = (props) => {
  const data = resolveIPOData(props);
  const f = useCurrentFrame();

  const chapters: ChapterTiming[] =
    data.timeline?.chapters && data.timeline.chapters.length === 8
      ? data.timeline.chapters
      : DEFAULT_CHAPTERS;

  const totalFrames = data.timeline?.totalFrames ?? 12402;

  // Build all sub-scene sequences
  const sequences: Array<{
    id: string;
    from: number;
    duration: number;
    audioFile?: string;
    render: React.ReactNode;
  }> = [];

  const hasSceneTimings = Boolean(data.timeline?.scenes && data.timeline.scenes.length > 0);

  if (hasSceneTimings) {
    for (const subScene of SUB_SCENES) {
      const sceneTiming = data.timeline!.scenes!.find((s) => s.id === subScene.id);
      if (sceneTiming) {
        sequences.push({
          id: subScene.id,
          from: sceneTiming.from,
          duration: sceneTiming.durationInFrames,
          audioFile: sceneTiming.audioFile,
          render: subScene.render(data),
        });
      }
    }
  } else {
    for (const subScene of SUB_SCENES) {
      const chapter = chapters[subScene.chapterIndex];
      if (!chapter) continue;

      // Calculate this sub-scene's position within its chapter
      const chapterSubScenes = SUB_SCENES.filter((s) => s.chapterIndex === subScene.chapterIndex);
      const indexInChapter = chapterSubScenes.indexOf(subScene);

      // Calculate cumulative fraction before this sub-scene
      let cumulativeFraction = 0;
      for (let i = 0; i < indexInChapter; i++) {
        cumulativeFraction += chapterSubScenes[i].fractionOfChapter;
      }

      const from = chapter.from + Math.round(cumulativeFraction * chapter.durationInFrames);
      const duration = Math.round(subScene.fractionOfChapter * chapter.durationInFrames);

      sequences.push({
        id: subScene.id,
        from,
        duration: Math.max(30, duration), // minimum 1 second
        render: subScene.render(data),
      });
    }
  }

  // Top watermark appearance: start after Dalal Street logo reveal, hide during final verdict & outro
  const issueNumbersSeq = sequences.find((s) => s.id === "issue_numbers");
  const verdictTitleSeq = sequences.find((s) => s.id === "verdict_title");
  const outroSeq = sequences.find((s) => s.id === "outro");
  const watermarkStart = issueNumbersSeq ? issueNumbersSeq.from : 450;
  const watermarkEnd = verdictTitleSeq ? verdictTitleSeq.from : (outroSeq ? outroSeq.from : totalFrames - 300);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* All sub-scene sequences */}
      {sequences.map((seq) => (
        <Sequence key={seq.id} from={seq.from} durationInFrames={seq.duration}>
          {seq.render}
        </Sequence>
      ))}

      {/* Audio playback: Scene-level precision audio (preferred) or legacy chapter tracks */}
      {hasSceneTimings
        ? sequences.map((seq) =>
            seq.audioFile ? (
              <Sequence key={`audio-${seq.id}`} from={seq.from} durationInFrames={seq.duration}>
                <Audio src={staticFile(seq.audioFile)} />
              </Sequence>
            ) : null
          )
        : chapters.map((ch) =>
            ch.audioFile ? (
              <Sequence key={`audio-${ch.id}`} from={ch.from} durationInFrames={ch.durationInFrames}>
                <Audio src={staticFile(ch.audioFile)} />
              </Sequence>
            ) : null
          )}

      {/* Background Music with smooth fade-in and fade-out */}
      {data.bgMusic?.file && (
        <Audio
          src={staticFile(data.bgMusic.file)}
          loop
          volume={(frame) => {
            const targetVol = data.bgMusic?.volume ?? 0.05;
            const fadeIn = interpolate(frame, [0, 45], [0, targetVol], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(frame, [totalFrames - 60, totalFrames], [targetVol, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}

      {/* Global grain overlay */}
      <GrainOverlay opacity={0.025} />

      {/* Centered Top Brand Mark (Logo + Name, no navbar background) */}
      {f >= watermarkStart && f < watermarkEnd && (
        <TopNavBar
          data={data}
          style={{
            opacity: interpolate(f, [watermarkStart, watermarkStart + 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      )}

      {/* Persistent Bottom Segmented Progress Timeline */}
      <BottomProgressBar chapters={chapters} totalFrames={totalFrames} />
    </AbsoluteFill>
  );
};
