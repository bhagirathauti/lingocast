import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface TrendArrowsProps {
  color?: string;
  direction?: "up" | "down" | "mixed";
  delay?: number;
}

export const TrendArrows: React.FC<TrendArrowsProps> = ({
  color = "rgba(52,211,153,0.25)",
  direction = "up",
  delay = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrows = [
    { x: 150, y: 1400, size: 60, d: "up", delay: 0 },
    { x: 300, y: 1500, size: 45, d: "up", delay: 5 },
    { x: 80, y: 1300, size: 35, d: "up", delay: 10 },
    { x: 900, y: 1450, size: 55, d: "down", delay: 3 },
    { x: 750, y: 1350, size: 40, d: "up", delay: 8 },
    { x: 980, y: 1250, size: 30, d: "up", delay: 12 },
    { x: 500, y: 1550, size: 50, d: "up", delay: 6 },
  ].map((a) => ({
    ...a,
    d: direction === "mixed" ? a.d : direction,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {arrows.map((arrow, i) => {
          const progress = spring({
            frame: frame - delay - arrow.delay,
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          const floatY = interpolate(
            frame,
            [0, 200],
            [0, arrow.d === "up" ? -80 : 80],
            { extrapolateRight: "extend" }
          );

          const y = arrow.y + floatY;
          const s = arrow.size;
          const isUp = arrow.d === "up";

          const path = isUp
            ? `M${arrow.x},${y + s} L${arrow.x},${y + s * 0.3} L${arrow.x - s * 0.3},${y + s * 0.6} M${arrow.x},${y + s * 0.3} L${arrow.x + s * 0.3},${y + s * 0.6}`
            : `M${arrow.x},${y} L${arrow.x},${y + s * 0.7} L${arrow.x - s * 0.3},${y + s * 0.4} M${arrow.x},${y + s * 0.7} L${arrow.x + s * 0.3},${y + s * 0.4}`;

          return (
            <path
              key={i}
              d={path}
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
              opacity={progress * 0.6}
            />
          );
        })}

        {/* Trend line */}
        <TrendLine
          frame={frame}
          fps={fps}
          color={color}
          delay={delay + 5}
          direction={direction}
        />
      </svg>
    </AbsoluteFill>
  );
};

const TrendLine: React.FC<{
  frame: number;
  fps: number;
  color: string;
  delay: number;
  direction: string;
}> = ({ frame, fps, color, delay, direction }) => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const points = direction === "down"
    ? "50,1600 200,1620 400,1580 550,1640 700,1610 850,1660 1030,1630"
    : "50,1700 200,1680 400,1650 550,1620 700,1600 850,1560 1030,1520";

  const dashLength = 2000;

  return (
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashLength}
      strokeDashoffset={dashLength * (1 - progress)}
      opacity={0.5}
    />
  );
};
