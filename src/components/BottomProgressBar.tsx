import React from "react";
import { useCurrentFrame } from "remotion";
import { C, PAD_H } from "./Tokens";
import { ChapterTiming } from "../types/ipo";

interface BottomProgressBarProps {
  chapters: ChapterTiming[];
  totalFrames: number;
}

export const BottomProgressBar: React.FC<BottomProgressBarProps> = ({
  chapters,
}) => {
  const f = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: PAD_H,
        right: PAD_H,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 100,
      }}
    >
      {/* Segmented chapter bars */}
      <div style={{ display: "flex", gap: 6, width: "100%", height: 6 }}>
        {chapters.map((ch, idx) => {
          const isPassed = f >= ch.from + ch.durationInFrames;
          const isCurrent = f >= ch.from && f < ch.from + ch.durationInFrames;
          const segmentProgress = isPassed
            ? 1
            : isCurrent
            ? (f - ch.from) / ch.durationInFrames
            : 0;

          return (
            <div
              key={idx}
              style={{
                flex: ch.durationInFrames,
                height: "100%",
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: 4,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${segmentProgress * 100}%`,
                  background: isCurrent
                    ? `linear-gradient(90deg, ${C.blue}, ${C.cyan})`
                    : C.blue,
                  boxShadow: isCurrent ? `0 0 10px ${C.blue}` : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Chapter Names Micro Label Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 2,
          paddingRight: 2,
        }}
      >
        {chapters.map((ch, idx) => {
          const isCurrent = f >= ch.from && f < ch.from + ch.durationInFrames;
          return (
            <div
              key={idx}
              style={{
                fontSize: 11,
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? C.text : C.textDim,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {idx + 1}. {ch.shortTitle}
            </div>
          );
        })}
      </div>
    </div>
  );
};
