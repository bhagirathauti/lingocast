import React from "react";
import {
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";

interface BarChart3DItem {
  name: string;
  value: number;
}

interface BarChart3DProps {
  items: BarChart3DItem[];
  color?: string;
  delay?: number;
}

const BAR_COLORS = [
  ["#34d399", "#059669"], // emerald
  ["#60a5fa", "#2563eb"], // blue
  ["#fbbf24", "#d97706"], // amber
  ["#f87171", "#dc2626"], // red
  ["#a78bfa", "#7c3aed"], // violet
  ["#fb923c", "#ea580c"], // orange
  ["#2dd4bf", "#0d9488"], // teal
  ["#e879f9", "#c026d3"], // fuchsia
];

export const BarChart3D: React.FC<BarChart3DProps> = ({
  items,
  delay = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  const overallOpacity = interpolate(
    frame,
    [delay, delay + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Chart layout — add top padding so value labels aren't clipped
  const topPadding = 50;
  const bottomPadding = 50;
  const chartWidth = 800;
  const chartHeight = 340;
  const depth = 25;
  const baseY = topPadding + chartHeight;
  const svgHeight = topPadding + chartHeight + bottomPadding;
  const svgWidth = chartWidth + 60;

  const barWidth = Math.min(90, (chartWidth / items.length) - 20);
  const minBarHeight = 12; // Minimum visible bar height for 0-value items

  return (
    <div style={{ opacity: overallOpacity, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <defs>
          {BAR_COLORS.map(([light, dark], i) => (
            <linearGradient key={i} id={`bar3d-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={light} />
              <stop offset="100%" stopColor={dark} />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((level, i) => {
          const y = baseY - chartHeight * level;
          return (
            <g key={i}>
              <line
                x1={50}
                y1={y}
                x2={chartWidth + 30}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                strokeDasharray="6,4"
              />
              <text
                x={42}
                y={y + 5}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize={16}
                fontFamily="system-ui, sans-serif"
              >
                {Math.round(maxValue * level)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line
          x1={50}
          y1={baseY}
          x2={chartWidth + 30}
          y2={baseY}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={2}
        />

        {/* Zero label */}
        <text
          x={42}
          y={baseY + 5}
          textAnchor="end"
          fill="rgba(255,255,255,0.3)"
          fontSize={16}
          fontFamily="system-ui, sans-serif"
        >
          0
        </text>

        {/* Bars */}
        {items.map((item, i) => {
          const staggerDelay = delay + i * 5;

          const barProgress = spring({
            frame: frame - staggerDelay,
            fps,
            config: { damping: 14, stiffness: 70 },
          });

          // Use minimum bar height for very small / zero values so they're visible
          const rawHeight = (item.value / maxValue) * chartHeight;
          const barHeight = Math.max(rawHeight, minBarHeight) * barProgress;
          const totalBarSlots = items.length;
          const spacing = (chartWidth - 50 - barWidth * totalBarSlots) / (totalBarSlots + 1);
          const x = 50 + spacing * (i + 1) + barWidth * i;
          const y = baseY - barHeight;

          const colorIdx = i % BAR_COLORS.length;
          const [lightColor, darkColor] = BAR_COLORS[colorIdx];

          const labelOpacity = interpolate(
            frame,
            [staggerDelay + 5, staggerDelay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <g key={i}>
              {/* 3D side face */}
              {barHeight > 2 && (
                <polygon
                  points={`
                    ${x + barWidth},${y}
                    ${x + barWidth + depth},${y - depth * 0.6}
                    ${x + barWidth + depth},${baseY - depth * 0.6}
                    ${x + barWidth},${baseY}
                  `}
                  fill={darkColor}
                  opacity={0.7}
                />
              )}

              {/* 3D top face */}
              {barHeight > 2 && (
                <polygon
                  points={`
                    ${x},${y}
                    ${x + depth},${y - depth * 0.6}
                    ${x + barWidth + depth},${y - depth * 0.6}
                    ${x + barWidth},${y}
                  `}
                  fill={lightColor}
                  opacity={0.9}
                />
              )}

              {/* Front face */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 0)}
                fill={`url(#bar3d-${colorIdx})`}
                rx={4}
              />

              {/* Shine effect */}
              {barHeight > 16 && (
                <rect
                  x={x + 6}
                  y={y + 4}
                  width={barWidth * 0.3}
                  height={Math.max(barHeight - 8, 0)}
                  fill="rgba(255,255,255,0.12)"
                  rx={3}
                />
              )}

              {/* Value label — positioned above the bar with enough clearance */}
              <text
                x={x + barWidth / 2}
                y={Math.max(y - 20, 16)}
                textAnchor="middle"
                fill={lightColor}
                fontSize={22}
                fontWeight={700}
                fontFamily="system-ui, sans-serif"
                opacity={labelOpacity}
              >
                {Math.round(item.value * barProgress)}
              </text>

              {/* Name label */}
              <text
                x={x + barWidth / 2}
                y={baseY + 28}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize={17}
                fontWeight={500}
                fontFamily="system-ui, sans-serif"
                opacity={labelOpacity}
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
