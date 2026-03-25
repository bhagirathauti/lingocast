import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface QuoteDecorationProps {
  color?: string;
  delay?: number;
}

export const QuoteDecoration: React.FC<QuoteDecorationProps> = ({
  color = "rgba(251,191,36,0.2)",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Decorative lines that sweep in
  const lineProgress = interpolate(frame - delay, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating ornamental dots
  const dots = [
    { x: 920, y: 600, size: 6, delay: 10 },
    { x: 960, y: 700, size: 4, delay: 15 },
    { x: 880, y: 750, size: 8, delay: 8 },
    { x: 950, y: 850, size: 5, delay: 20 },
    { x: 100, y: 1200, size: 7, delay: 12 },
    { x: 140, y: 1300, size: 4, delay: 18 },
    { x: 80, y: 1100, size: 6, delay: 14 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryProgress }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Top-right decorative corner */}
        <path
          d={`M 980,100 Q 980,300 880,400`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="8,6"
          opacity={lineProgress * 0.6}
        />
        <path
          d={`M 1000,150 Q 1000,350 900,450`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4,8"
          opacity={lineProgress * 0.4}
        />

        {/* Bottom-left decorative corner */}
        <path
          d={`M 100,1400 Q 100,1200 200,1100`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="8,6"
          opacity={lineProgress * 0.6}
        />
        <path
          d={`M 80,1350 Q 80,1150 180,1050`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4,8"
          opacity={lineProgress * 0.4}
        />

        {/* Horizontal accent lines */}
        <line
          x1={70}
          y1={800}
          x2={interpolate(lineProgress, [0, 1], [70, 200])}
          y2={800}
          stroke={color}
          strokeWidth={2}
          opacity={0.5}
        />
        <line
          x1={880}
          y1={1100}
          x2={interpolate(lineProgress, [0, 1], [880, 1010])}
          y2={1100}
          stroke={color}
          strokeWidth={2}
          opacity={0.5}
        />

        {/* Ornamental dots */}
        {dots.map((dot, i) => {
          const dotProgress = spring({
            frame: frame - delay - dot.delay,
            fps,
            config: { damping: 12, stiffness: 120 },
          });

          const pulse = 1 + Math.sin(frame * 0.08 + i * 2) * 0.2;

          return (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y + Math.sin(frame * 0.03 + i) * 8}
              r={dot.size * dotProgress * pulse}
              fill={color}
              opacity={dotProgress * 0.6}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
