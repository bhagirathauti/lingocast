import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface GlobeNetworkProps {
  color?: string;
  cx?: number;
  cy?: number;
  radius?: number;
  delay?: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const GlobeNetwork: React.FC<GlobeNetworkProps> = ({
  color = "rgba(96,165,250,0.4)",
  cx = 800,
  cy = 400,
  radius = 250,
  delay = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rand = seededRandom(77);

  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Generate nodes on a sphere projected to 2D
  const nodeCount = 18;
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = radius * (0.6 + rand() * 0.4);
    return {
      x: cx + r * Math.sin(phi) * Math.cos(theta + frame * 0.005),
      y: cy + r * Math.sin(phi) * Math.sin(theta + frame * 0.005) * 0.6,
      z: Math.cos(phi),
      size: 3 + rand() * 4,
      delay: Math.floor(rand() * 20),
    };
  });

  // Generate connections between nearby nodes
  const connections: Array<[number, number]> = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius * 0.8 && connections.length < 25) {
        connections.push([i, j]);
      }
    }
  }

  // Rotating ellipse rings
  const rotation = interpolate(frame, [0, 300], [0, 360], {
    extrapolateRight: "extend",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryProgress }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Globe outline rings */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={radius}
          ry={radius * 0.6}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
          transform={`rotate(${rotation * 0.1}, ${cx}, ${cy})`}
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={radius * 0.7}
          ry={radius}
          fill="none"
          stroke={color}
          strokeWidth={0.8}
          opacity={0.2}
          transform={`rotate(${rotation * -0.05 + 30}, ${cx}, ${cy})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.25}
        />

        {/* Connections */}
        {connections.map(([a, b], i) => {
          const lineProgress = spring({
            frame: frame - delay - 10 - i * 2,
            fps,
            config: { damping: 20, stiffness: 100 },
          });

          return (
            <line
              key={`c-${i}`}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={interpolate(lineProgress, [0, 1], [nodes[a].x, nodes[b].x])}
              y2={interpolate(lineProgress, [0, 1], [nodes[a].y, nodes[b].y])}
              stroke={color}
              strokeWidth={1}
              opacity={0.4 * lineProgress}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const nodeProgress = spring({
            frame: frame - delay - node.delay,
            fps,
            config: { damping: 12, stiffness: 150 },
          });

          const pulseScale = 1 + Math.sin(frame * 0.1 + i) * 0.15;

          return (
            <g key={`n-${i}`}>
              {/* Glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size * 3 * nodeProgress * pulseScale}
                fill={color}
                opacity={0.1 * nodeProgress}
              />
              {/* Core */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size * nodeProgress}
                fill={color}
                opacity={0.8 * nodeProgress}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
