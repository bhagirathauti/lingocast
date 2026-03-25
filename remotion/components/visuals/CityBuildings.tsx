import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** City skyline — for real estate/infrastructure/urban topics */
export const CityBuildings: React.FC<{ color?: string }> = ({ color = "rgba(96,165,250,0.2)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 70 } });

  const buildings = [
    { x: 700, w: 45, h: 180, windows: 6, delay: 3 },
    { x: 755, w: 55, h: 240, windows: 8, delay: 5 },
    { x: 820, w: 40, h: 150, windows: 5, delay: 7 },
    { x: 870, w: 60, h: 280, windows: 9, delay: 4 },
    { x: 940, w: 35, h: 130, windows: 4, delay: 9 },
    { x: 985, w: 50, h: 200, windows: 7, delay: 6 },
  ];

  const baseY = 580;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Ground line */}
        <line x1={680} y1={baseY} x2={1050} y2={baseY} stroke={color} strokeWidth={1} opacity={entryP * 0.4} />

        {/* Buildings */}
        {buildings.map((b, i) => {
          const buildP = spring({ frame: frame - b.delay, fps, config: { damping: 14, stiffness: 90 } });
          const h = b.h * buildP;

          return (
            <g key={i} opacity={0.5}>
              {/* Building body */}
              <rect x={b.x} y={baseY - h} width={b.w} height={h} fill="none" stroke={color} strokeWidth={1.5} rx={2} />

              {/* Windows */}
              {Array.from({ length: Math.floor(b.windows * buildP) }, (_, wi) => {
                const row = Math.floor(wi / 2);
                const col = wi % 2;
                const wx = b.x + 8 + col * (b.w - 24);
                const wy = baseY - h + 15 + row * 22;
                const lit = Math.sin(frame * 0.05 + i * 3 + wi * 2) > 0.3;
                return (
                  <rect key={wi} x={wx} y={wy} width={8} height={10} rx={1} fill={color} opacity={lit ? 0.4 : 0.15} />
                );
              })}

              {/* Antenna on tallest */}
              {b.h > 250 && (
                <g>
                  <line x1={b.x + b.w / 2} y1={baseY - h} x2={b.x + b.w / 2} y2={baseY - h - 25 * buildP} stroke={color} strokeWidth={1} />
                  <circle cx={b.x + b.w / 2} cy={baseY - h - 25 * buildP} r={3} fill={color} opacity={Math.sin(frame * 0.15) > 0 ? 0.6 : 0.2} />
                </g>
              )}
            </g>
          );
        })}

        {/* Crane (construction) */}
        <g transform="translate(660, 430)" opacity={entryP * 0.3}>
          <line x1={0} y1={0} x2={0} y2={150} stroke={color} strokeWidth={2} />
          <line x1={0} y1={0} x2={60} y2={0} stroke={color} strokeWidth={2} />
          <line x1={0} y1={0} x2={-20} y2={0} stroke={color} strokeWidth={1.5} />
          {/* Cable */}
          <line x1={50} y1={0} x2={50} y2={30 + Math.sin(frame * 0.04) * 5} stroke={color} strokeWidth={0.8} />
          <rect x={45} y={30 + Math.sin(frame * 0.04) * 5} width={10} height={8} fill="none" stroke={color} strokeWidth={1} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
