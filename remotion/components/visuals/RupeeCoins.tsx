import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Floating ₹ symbols and coins — for finance/currency/budget topics */
export const RupeeCoins: React.FC<{ color?: string }> = ({ color = "rgba(251,191,36,0.3)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const coins = [
    { x: 820, y: 300, size: 70, delay: 0, rot: 0 },
    { x: 920, y: 500, size: 50, delay: 8, rot: 15 },
    { x: 750, y: 650, size: 40, delay: 5, rot: -10 },
    { x: 880, y: 180, size: 35, delay: 12, rot: 20 },
    { x: 150, y: 1400, size: 55, delay: 3, rot: -15 },
    { x: 250, y: 1550, size: 38, delay: 10, rot: 8 },
    { x: 100, y: 1300, size: 30, delay: 15, rot: -25 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {coins.map((c, i) => {
          const p = spring({ frame: frame - c.delay, fps, config: { damping: 14, stiffness: 100 } });
          const floatY = Math.sin(frame * 0.03 + i * 2) * 12;
          const rotation = c.rot + Math.sin(frame * 0.02 + i) * 5;

          return (
            <g key={i} transform={`translate(${c.x}, ${c.y + floatY}) rotate(${rotation}) scale(${p})`} opacity={p * 0.7}>
              {/* Coin circle */}
              <circle cx={0} cy={0} r={c.size / 2} fill="none" stroke={color} strokeWidth={2} />
              <circle cx={0} cy={0} r={c.size / 2 - 5} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
              {/* ₹ symbol */}
              <text x={0} y={c.size * 0.15} textAnchor="middle" fontSize={c.size * 0.55} fontWeight={700} fontFamily="system-ui" fill={color}>₹</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
