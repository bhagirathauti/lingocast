import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

interface PulseRingsProps {
  cx?: number;
  cy?: number;
  color?: string;
  rings?: number;
  maxRadius?: number;
  delay?: number;
}

export const PulseRings: React.FC<PulseRingsProps> = ({
  cx = 540,
  cy = 960,
  color = "rgba(255,255,255,0.08)",
  rings = 4,
  maxRadius = 400,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {Array.from({ length: rings }, (_, i) => {
          const ringDelay = delay + i * 25;
          const loopFrame = (frame - ringDelay) % 120;
          const progress = interpolate(
            loopFrame < 0 ? 0 : loopFrame,
            [0, 120],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const radius = progress * maxRadius;
          const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0]);

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={frame - ringDelay < 0 ? 0 : opacity}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
