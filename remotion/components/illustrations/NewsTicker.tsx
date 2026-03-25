import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface NewsTickerProps {
  color?: string;
  delay?: number;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({
  color = "rgba(96,165,250,0.3)",
  delay = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Scrolling ticker bars at bottom
  const scrollX = interpolate(frame, [0, 300], [0, -600], {
    extrapolateRight: "extend",
  });

  const bars = Array.from({ length: 8 }, (_, i) => ({
    width: 80 + (i % 3) * 60,
    gap: 30,
  }));

  let currentX = scrollX % 1200;
  if (currentX > 0) currentX -= 1200;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Ticker track background */}
        <rect
          x={0}
          y={1780}
          width={1080}
          height={60}
          fill="rgba(0,0,0,0.3)"
          opacity={entryProgress}
          rx={0}
        />

        {/* Scrolling bars */}
        <g opacity={entryProgress * 0.7}>
          {bars.map((bar, i) => {
            const barX = currentX + i * (bar.width + bar.gap);
            return (
              <rect
                key={i}
                x={barX}
                y={1795}
                width={bar.width}
                height={10}
                rx={5}
                fill={color}
                opacity={0.6}
              />
            );
          })}
          {/* Second set for seamless loop */}
          {bars.map((bar, i) => {
            const barX = currentX + 1200 + i * (bar.width + bar.gap);
            return (
              <rect
                key={`b-${i}`}
                x={barX}
                y={1795}
                width={bar.width}
                height={10}
                rx={5}
                fill={color}
                opacity={0.6}
              />
            );
          })}
        </g>

        {/* "LIVE" indicator */}
        <g opacity={entryProgress}>
          <rect
            x={40}
            y={1788}
            width={70}
            height={32}
            rx={6}
            fill="rgba(239,68,68,0.9)"
          />
          <text
            x={75}
            y={1810}
            textAnchor="middle"
            fontSize={16}
            fontWeight={700}
            fontFamily="system-ui, sans-serif"
            fill="white"
            letterSpacing={2}
          >
            LIVE
          </text>
          {/* Blinking dot */}
          <circle
            cx={50}
            cy={1804}
            r={4}
            fill="white"
            opacity={Math.sin(frame * 0.15) > 0 ? 1 : 0.3}
          />
        </g>

        {/* Top decorative line */}
        <line
          x1={0}
          y1={1780}
          x2={interpolate(entryProgress, [0, 1], [0, 1080])}
          y2={1780}
          stroke={color}
          strokeWidth={2}
        />
      </svg>
    </AbsoluteFill>
  );
};
