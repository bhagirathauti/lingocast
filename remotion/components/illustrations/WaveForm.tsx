import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface WaveFormProps {
  color?: string;
  bars?: number;
  position?: "bottom" | "center" | "top";
  delay?: number;
}

export const WaveForm: React.FC<WaveFormProps> = ({
  color = "rgba(167,139,250,0.3)",
  bars = 40,
  position = "bottom",
  delay = 5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const yBase =
    position === "bottom" ? 1650 :
    position === "top" ? 200 : 960;

  const barWidth = 14;
  const gap = 6;
  const totalWidth = bars * (barWidth + gap);
  const startX = (1080 - totalWidth) / 2;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {Array.from({ length: bars }, (_, i) => {
          const phase = (frame * 0.08 + i * 0.4);
          const amplitude = 30 + Math.sin(i * 0.3) * 20;
          const height = Math.abs(Math.sin(phase) * amplitude + Math.cos(phase * 0.7 + i) * 15);

          const x = startX + i * (barWidth + gap);
          const barOpacity = interpolate(
            i,
            [0, bars * 0.3, bars * 0.7, bars],
            [0.3, 1, 1, 0.3]
          );

          return (
            <rect
              key={i}
              x={x}
              y={yBase - height * entryProgress}
              width={barWidth}
              height={height * 2 * entryProgress}
              rx={barWidth / 2}
              fill={color}
              opacity={barOpacity * entryProgress}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
