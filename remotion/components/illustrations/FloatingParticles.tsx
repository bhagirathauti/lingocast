import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
  speed: number;
  opacity: number;
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  seed?: number;
  style?: "dots" | "diamonds" | "mixed";
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  color = "rgba(255,255,255,0.15)",
  seed = 42,
  style = "dots",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rand = seededRandom(seed);

  const particles: Particle[] = Array.from({ length: count }, () => ({
    x: rand() * 1080,
    y: rand() * 1920,
    size: 3 + rand() * 8,
    delay: Math.floor(rand() * 30),
    speed: 0.3 + rand() * 0.7,
    opacity: 0.1 + rand() * 0.3,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {particles.map((p, i) => {
          const entryProgress = spring({
            frame: frame - p.delay,
            fps,
            config: { damping: 20, stiffness: 80 },
          });

          const floatY = interpolate(
            frame,
            [0, 300],
            [0, -60 * p.speed],
            { extrapolateRight: "extend" }
          );

          const floatX = Math.sin((frame + p.delay * 10) * 0.02 * p.speed) * 15;

          const cy = ((p.y + floatY) % 1960) - 20;
          const cx = p.x + floatX;

          if (style === "diamonds" || (style === "mixed" && i % 3 === 0)) {
            return (
              <g
                key={i}
                transform={`translate(${cx}, ${cy}) rotate(45)`}
                opacity={entryProgress * p.opacity}
              >
                <rect
                  x={-p.size / 2}
                  y={-p.size / 2}
                  width={p.size}
                  height={p.size}
                  fill={color}
                  rx={1}
                />
              </g>
            );
          }

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={p.size * entryProgress}
              fill={color}
              opacity={entryProgress * p.opacity}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
