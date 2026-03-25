import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Classical bank/RBI building silhouette — for banking/RBI/monetary policy topics */
export const BankBuilding: React.FC<{ color?: string }> = ({ color = "rgba(96,165,250,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const buildP = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 80 } });

  const cx = 850;
  const baseY = 500;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: buildP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        <g transform={`translate(${cx}, ${baseY}) scale(${buildP})`} opacity={0.6}>
          {/* Pediment (triangle roof) */}
          <polygon points="-120,-100 0,-160 120,-100" fill="none" stroke={color} strokeWidth={2} />

          {/* Columns */}
          {[-80, -30, 20, 70].map((x, i) => (
            <g key={i}>
              <rect x={x} y={-95} width={12} height={interpolate(buildP, [0, 1], [0, 120])} fill="none" stroke={color} strokeWidth={1.5} rx={2} />
              {/* Column cap */}
              <rect x={x - 3} y={-98} width={18} height={4} fill={color} opacity={0.5} rx={1} />
              {/* Column base */}
              <rect x={x - 3} y={25} width={18} height={4} fill={color} opacity={0.5} rx={1} />
            </g>
          ))}

          {/* Base platform */}
          <rect x={-130} y={30} width={260} height={8} fill="none" stroke={color} strokeWidth={1.5} rx={2} />
          <rect x={-140} y={38} width={280} height={6} fill="none" stroke={color} strokeWidth={1} rx={1} opacity={0.4} />

          {/* Steps */}
          {[0, 1, 2].map((i) => (
            <rect key={`s${i}`} x={-140 - i * 10} y={44 + i * 8} width={280 + i * 20} height={6} fill="none" stroke={color} strokeWidth={0.8} rx={1} opacity={0.3} />
          ))}

          {/* Door */}
          <rect x={-15} y={-30} width={30} height={55} fill="none" stroke={color} strokeWidth={1.5} rx={3} />
          <circle cx={8} cy={0} r={2} fill={color} opacity={0.5} />
        </g>

        {/* Percentage symbols floating */}
        {[
          { x: 700, y: 300, size: 24, delay: 15 },
          { x: 950, y: 250, size: 18, delay: 20 },
          { x: 780, y: 620, size: 20, delay: 25 },
        ].map((s, i) => {
          const p = spring({ frame: frame - s.delay, fps, config: { damping: 12, stiffness: 100 } });
          const floatY = Math.sin(frame * 0.04 + i * 3) * 10;
          return (
            <text key={i} x={s.x} y={s.y + floatY} fontSize={s.size} fontFamily="system-ui" fontWeight={700} fill={color} opacity={p * 0.4} textAnchor="middle">
              %
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
