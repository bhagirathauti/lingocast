import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

/** People silhouettes + connections — for employment/social/workforce topics */
export const PeopleNetwork: React.FC<{ color?: string }> = ({ color = "rgba(167,139,250,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 80 } });

  // Person icon (head + shoulders)
  const PersonIcon: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <circle cx={0} cy={-12} r={8} fill="none" stroke={color} strokeWidth={1.5} />
      <path d="M -14,8 Q -14,-2 0,-2 Q 14,-2 14,8" fill="none" stroke={color} strokeWidth={1.5} />
    </g>
  );

  const people = [
    { x: 830, y: 300, scale: 1, delay: 5 },
    { x: 900, y: 360, scale: 0.8, delay: 8 },
    { x: 760, y: 360, scale: 0.85, delay: 10 },
    { x: 870, y: 430, scale: 0.7, delay: 13 },
    { x: 940, y: 280, scale: 0.75, delay: 12 },
    // Bottom group
    { x: 120, y: 1380, scale: 0.9, delay: 15 },
    { x: 190, y: 1420, scale: 0.75, delay: 18 },
    { x: 250, y: 1380, scale: 0.8, delay: 20 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 3], [0, 4], [1, 4],
    [5, 6], [6, 7], [5, 7],
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Connection lines */}
        {connections.map(([a, b], i) => {
          const lineP = spring({ frame: frame - 15 - i * 2, fps, config: { damping: 20, stiffness: 80 } });
          return (
            <line key={`c${i}`}
              x1={people[a].x} y1={people[a].y}
              x2={people[a].x + (people[b].x - people[a].x) * lineP}
              y2={people[a].y + (people[b].y - people[a].y) * lineP}
              stroke={color} strokeWidth={1} opacity={lineP * 0.3}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* People */}
        {people.map((p, i) => {
          const personP = spring({ frame: frame - p.delay, fps, config: { damping: 12, stiffness: 120 } });
          const floatY = Math.sin(frame * 0.03 + i * 2) * 5;
          return (
            <g key={i} opacity={personP * 0.5} transform={`translate(0, ${floatY})`}>
              <PersonIcon x={p.x} y={p.y} scale={p.scale} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
