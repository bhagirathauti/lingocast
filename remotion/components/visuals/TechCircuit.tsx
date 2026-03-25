import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Circuit board traces + nodes — for tech/AI/digital topics */
export const TechCircuit: React.FC<{ color?: string }> = ({ color = "rgba(96,165,250,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 3, fps, config: { damping: 18, stiffness: 80 } });

  // Circuit paths (right side)
  const paths = [
    { d: "M 850,200 L 850,300 L 950,300 L 950,400", delay: 0 },
    { d: "M 900,250 L 1000,250 L 1000,350", delay: 5 },
    { d: "M 800,350 L 800,450 L 900,450", delay: 8 },
    { d: "M 950,400 L 950,500 L 850,500", delay: 12 },
  ];

  // Circuit paths (bottom left)
  const paths2 = [
    { d: "M 100,1350 L 200,1350 L 200,1450 L 300,1450", delay: 10 },
    { d: "M 150,1400 L 150,1500 L 250,1500", delay: 15 },
    { d: "M 250,1350 L 350,1350 L 350,1400", delay: 18 },
  ];

  // Nodes (junction points)
  const nodes = [
    { x: 850, y: 300, delay: 5 }, { x: 950, y: 300, delay: 8 },
    { x: 950, y: 400, delay: 12 }, { x: 1000, y: 250, delay: 10 },
    { x: 800, y: 450, delay: 15 }, { x: 900, y: 450, delay: 18 },
    { x: 200, y: 1350, delay: 14 }, { x: 200, y: 1450, delay: 18 },
    { x: 150, y: 1500, delay: 20 }, { x: 350, y: 1350, delay: 22 },
  ];

  // Data pulse along a path
  const pulsePos = interpolate(frame % 60, [0, 60], [0, 1]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Circuit traces */}
        {[...paths, ...paths2].map((p, i) => {
          const drawP = spring({ frame: frame - p.delay, fps, config: { damping: 20, stiffness: 60 } });
          return (
            <path key={i} d={p.d} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="600" strokeDashoffset={600 * (1 - drawP)} opacity={0.6} />
          );
        })}

        {/* Junction nodes */}
        {nodes.map((n, i) => {
          const nodeP = spring({ frame: frame - n.delay, fps, config: { damping: 12, stiffness: 120 } });
          const pulse = Math.sin(frame * 0.1 + i * 1.5) * 0.3 + 0.7;
          return (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={8 * nodeP} fill="none" stroke={color} strokeWidth={1.5} opacity={nodeP * 0.5} />
              <circle cx={n.x} cy={n.y} r={3 * nodeP} fill={color} opacity={nodeP * pulse * 0.6} />
            </g>
          );
        })}

        {/* Chip/processor icon */}
        <g transform={`translate(900, 370) scale(${entryP})`} opacity={0.3}>
          <rect x={-20} y={-20} width={40} height={40} fill="none" stroke={color} strokeWidth={2} rx={4} />
          {[-12, 0, 12].map((pos) => (
            <React.Fragment key={pos}>
              <line x1={pos} y1={-20} x2={pos} y2={-28} stroke={color} strokeWidth={1.5} />
              <line x1={pos} y1={20} x2={pos} y2={28} stroke={color} strokeWidth={1.5} />
              <line x1={-20} y1={pos} x2={-28} y2={pos} stroke={color} strokeWidth={1.5} />
              <line x1={20} y1={pos} x2={28} y2={pos} stroke={color} strokeWidth={1.5} />
            </React.Fragment>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
