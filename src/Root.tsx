import React from "react";
import { Composition, Still } from "remotion";
import { IPOVideo, defaultIPOData, resolveIPOData } from "./IPOVideo";
import { Thumbnail } from "./components/Thumbnail";
import { CANVAS_W, CANVAS_H } from "./components/Tokens";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="IPOVideo"
      component={IPOVideo}
      durationInFrames={12402}
      fps={30}
      width={CANVAS_W}
      height={CANVAS_H}
      defaultProps={defaultIPOData}
      calculateMetadata={({ props }) => {
        const data = resolveIPOData(props);
        const durationInFrames = data.timeline?.totalFrames || 8860;
        return {
          durationInFrames,
          fps: 30,
          width: CANVAS_W,
          height: CANVAS_H,
          props: { data },
        };
      }}
    />

    <Still
      id="Thumbnail"
      component={Thumbnail}
      width={1280}
      height={720}
      defaultProps={defaultIPOData}
      calculateMetadata={({ props }) => {
        const data = resolveIPOData(props);
        return {
          props: { data },
        };
      }}
    />
  </>
);