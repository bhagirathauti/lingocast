import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

interface SparkleEffectProps {
  color?: string;
  count?: number;
  seed?: number;
  delay?: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const StarPath: React.FC<{ x: number; y: number; size: number; rotation: number }> = ({
  x, y, size, rotation,
}) => {
  // 4-pointed star
  const r = size;
  const ri = size * 0.3;
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + (rotation * Math.PI) / 180;
    const radius = i % 2 === 0 ? r : ri;
    points.push(`${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`);
  }
  return <polygon points={points.join(" ")} />;
};

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  color = "rgba(251,113,133,0.4)",
  count = 12,
  seed = 99,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rand = seededRandom(seed);

  const sparkles = Array.from({ length: count }, () => ({
    x: 100 + rand() * 880,
    y: 300 + rand() * 1300,
    size: 6 + rand() * 14,
    delay: Math.floor(rand() * 40),
    rotationSpeed: 0.5 + rand() * 2,
    phaseOffset: rand() * Math.PI * 2,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {sparkles.map((s, i) => {
          const entryProgress = spring({
            frame: frame - delay - s.delay,
            fps,
            config: { damping: 10, stiffness: 150 },
          });

          // Twinkle effect
          const twinkle = Math.sin(frame * 0.12 + s.phaseOffset);
          const scale = 0.5 + twinkle * 0.5;
          const rotation = frame * s.rotationSpeed;

          return (
            <g
              key={i}
              fill={color}
              opacity={entryProgress * (0.3 + scale * 0.7)}
              transform={`translate(${s.x}, ${s.y}) scale(${entryProgress * scale})`}
            >
              <StarPath x={0} y={0} size={s.size} rotation={rotation} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
