import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./Tokens";

/** Film grain texture overlay for cinematic depth. */
export const GrainOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.035 }) => {
  const f = useCurrentFrame();
  // Pseudo-random grain using frame-based offset
  const seedX = (f * 7.31) % 100;
  const seedY = (f * 13.17) % 100;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999,
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
        backgroundPosition: `${seedX}px ${seedY}px`,
        mixBlendMode: "overlay",
      }}
    />
  );
};

/** Ambient particle field for atmospheric depth. */
export const ParticleField: React.FC<{
  count?: number;
  color?: string;
  speed?: number;
}> = ({ count = 30, color = C.blue, speed = 0.5 }) => {
  const f = useCurrentFrame();

  // Generate deterministic particles
  const particles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (i * 67.3 + 23.7) % 100,
        y: (i * 41.9 + 17.1) % 100,
        size: 1.5 + (i % 4) * 0.8,
        speedMul: 0.5 + (i % 3) * 0.3,
        opacityBase: 0.15 + (i % 5) * 0.08,
      });
    }
    return arr;
  }, [count]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {particles.map((p, i) => {
        const yOffset = (f * speed * p.speedMul) % 120;
        const currentY = ((p.y + yOffset) % 120) - 10;
        const pulse = 0.5 + 0.5 * Math.sin(f * 0.03 + i * 1.7);
        const currentOpacity = p.opacityBase * pulse;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${currentY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: currentOpacity,
              boxShadow: `0 0 ${p.size * 4}px ${color}60`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Ambient gradient spotlight that drifts slowly. */
export const AmbientSpotlight: React.FC<{
  color?: string;
  size?: number;
  x?: string;
  y?: string;
}> = ({ color = C.blue, size = 800, x = "50%", y = "30%" }) => {
  const f = useCurrentFrame();
  const driftX = Math.sin(f * 0.008) * 50;
  const driftY = Math.cos(f * 0.006) * 30;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.7,
        transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px)`,
        background: `radial-gradient(ellipse at center, ${color}18 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};
