import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

/** Gears + factory silhouette — for industry/manufacturing/production topics */
export const FactoryGears: React.FC<{ color?: string }> = ({ color = "rgba(167,139,250,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 80 } });
  const rotation = frame * 0.5;

  // Gear tooth generator
  const gearPath = (cx: number, cy: number, r: number, teeth: number) => {
    const points: string[] = [];
    const toothDepth = r * 0.2;
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (i * Math.PI) / teeth;
      const radius = i % 2 === 0 ? r + toothDepth : r - toothDepth;
      points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
    }
    return `M ${points.join(" L ")} Z`;
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Large gear */}
        <g transform={`rotate(${rotation}, 880, 350)`}>
          <path d={gearPath(880, 350, 55, 10)} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
          <circle cx={880} cy={350} r={20} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
        </g>

        {/* Medium gear (interlocked) */}
        <g transform={`rotate(${-rotation * 1.25}, 810, 420)`}>
          <path d={gearPath(810, 420, 40, 8)} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
          <circle cx={810} cy={420} r={15} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
        </g>

        {/* Small gear */}
        <g transform={`rotate(${rotation * 1.6}, 950, 310)`}>
          <path d={gearPath(950, 310, 28, 6)} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />
          <circle cx={950} cy={310} r={10} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
        </g>

        {/* Factory silhouette (bottom left) */}
        <g transform="translate(80, 1380)" opacity={entryP * 0.35}>
          {/* Main building */}
          <rect x={0} y={20} width={80} height={80} fill="none" stroke={color} strokeWidth={1.5} />
          {/* Roof */}
          <polygon points="0,20 40,-10 80,20" fill="none" stroke={color} strokeWidth={1.5} />
          {/* Chimney */}
          <rect x={55} y={-30} width={15} height={50} fill="none" stroke={color} strokeWidth={1.5} />
          {/* Smoke */}
          {[0, 1, 2].map((i) => {
            const smokeP = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 20, stiffness: 60 } });
            const yOff = -35 - i * 18 - Math.sin(frame * 0.04 + i) * 5;
            return (
              <circle key={i} cx={62 + Math.sin(frame * 0.03 + i * 2) * 8} cy={yOff} r={8 + i * 3} fill="none" stroke={color} strokeWidth={1} opacity={smokeP * 0.3} />
            );
          })}
          {/* Windows */}
          <rect x={10} y={40} width={15} height={15} fill={color} opacity={0.2} rx={1} />
          <rect x={35} y={40} width={15} height={15} fill={color} opacity={0.2} rx={1} />
          <rect x={10} y={65} width={15} height={15} fill={color} opacity={0.15} rx={1} />
          <rect x={35} y={65} width={15} height={15} fill={color} opacity={0.15} rx={1} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
