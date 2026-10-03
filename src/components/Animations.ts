import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// ─── Classic Animations (updated) ────────────────────────────────────────────

export function useFadeIn(delay = 0, dur = 18) {
  const f = useCurrentFrame();
  return interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
}

export function useSlideUp(delay = 0, dist = 65) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 100, mass: 0.9 } });
  return interpolate(p, [0, 1], [dist, 0]);
}

export function useSlideRight(delay = 0, dist = 200) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 15, stiffness: 110 } });
  return interpolate(p, [0, 1], [dist, 0]);
}

export function useSlideLeft(delay = 0, dist = 200) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 15, stiffness: 110 } });
  return interpolate(p, [0, 1], [-dist, 0]);
}

export function useScaleIn(delay = 0) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 13, stiffness: 150, mass: 0.7 } });
}

// ─── New Cinematic Animations ────────────────────────────────────────────────

/** Counts from 0 to target value. Returns the current interpolated number. */
export function useCountUp(target: number, delay = 0, dur = 30) {
  const f = useCurrentFrame();
  const progress = interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return target * progress;
}

/** Returns 0→1 progress for drawing SVG stroke paths (strokeDashoffset). */
export function useSketchDraw(delay = 0, dur = 25) {
  const f = useCurrentFrame();
  return interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
}

/** Typewriter: returns the number of characters to show. */
export function useTypewriter(textLength: number, delay = 0, charsPerFrame = 1.2) {
  const f = useCurrentFrame();
  const elapsed = Math.max(0, f - delay);
  return Math.min(Math.floor(elapsed * charsPerFrame), textLength);
}

/** Bar grow: returns 0→1 for height scaling. */
export function useBarGrow(delay = 0, dur = 22) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: f - delay,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1.0 },
  });
  return interpolate(p, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Line trace: returns 0→1 progress for drawing line charts. */
export function useLineTrace(delay = 0, dur = 30) {
  const f = useCurrentFrame();
  return interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });
}

/** Pie reveal: returns 0→360 degrees for conic gradient animation. */
export function usePieReveal(delay = 0, dur = 30) {
  const f = useCurrentFrame();
  const progress = interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return 360 * progress;
}

/** Slam in: scale from large to 1 with bounce. */
export function useSlamIn(delay = 0) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: f - delay,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });
  const scale = interpolate(p, [0, 1], [2.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(p, [0, 0.3, 1], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { scale, opacity };
}

/** Zoom focus: scales up element and adds a glow. */
export function useZoomFocus(delay = 0) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: f - delay,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });
  return interpolate(p, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Glitch: returns a brief shake offset for glitch effects. */
export function useGlitch(delay = 0, dur = 8) {
  const f = useCurrentFrame();
  const elapsed = f - delay;
  if (elapsed < 0 || elapsed >= dur) return { x: 0, y: 0, opacity: 1 };
  const intensity = interpolate(elapsed, [0, dur / 2, dur], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = Math.sin(elapsed * 13.7) * 8 * intensity;
  const y = Math.cos(elapsed * 17.3) * 4 * intensity;
  return { x, y, opacity: 1 - intensity * 0.3 };
}

/** Pulse glow: rhythmic glow pulse. Returns 0→1→0 repeating. */
export function usePulseGlow(speed = 0.04) {
  const f = useCurrentFrame();
  return 0.5 + 0.5 * Math.sin(f * speed * Math.PI * 2);
}

/** Parallax depth: returns offset based on depth layer. */
export function useParallax(depth = 1, speed = 0.3) {
  const f = useCurrentFrame();
  return f * speed * depth;
}

/** Gauge fill: returns 0→target fraction for circular gauges. */
export function useGaugeFill(targetFraction: number, delay = 0, dur = 28) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: f - delay,
    fps,
    config: { damping: 18, stiffness: 70, mass: 1.2 },
  });
  return targetFraction * p;
}

/** Camera shake: returns xy offset for dramatic emphasis moments. */
export function useCameraShake(delay = 0, dur = 10, intensity = 5) {
  const f = useCurrentFrame();
  const elapsed = f - delay;
  if (elapsed < 0 || elapsed >= dur) return { x: 0, y: 0 };
  const decay = interpolate(elapsed, [0, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  return {
    x: Math.sin(elapsed * 23.1) * intensity * decay,
    y: Math.cos(elapsed * 31.7) * intensity * 0.6 * decay,
  };
}

/** Stagger delay helper: returns delay for item at index in a list. */
export function staggerDelay(baseDelay: number, index: number, gap = 8) {
  return baseDelay + index * gap;
}

/** Wipe progress: returns 0→1 for directional wipe transitions. */
export function useWipe(delay = 0, dur = 15) {
  const f = useCurrentFrame();
  return interpolate(f, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
}

/** Elastic pop: returns 0→1 with overshoot for pop-in effects. */
export function useElasticPop(delay = 0) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: f - delay,
    fps,
    config: { damping: 6, stiffness: 180, mass: 0.5 },
  });
}
