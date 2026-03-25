import React from "react";
import {
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";

interface PieChartItem {
  name: string;
  value: number;
}

interface PieChartProps {
  items: PieChartItem[];
  color?: string;
  delay?: number;
}

const SLICE_COLORS = [
  "#34d399", // emerald
  "#60a5fa", // blue
  "#fbbf24", // amber
  "#f87171", // red
  "#a78bfa", // violet
  "#fb923c", // orange
  "#2dd4bf", // teal
  "#e879f9", // fuchsia
];

export const PieChart: React.FC<PieChartProps> = ({
  items,
  delay = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const cx = 200;
  const cy = 200;
  const radius = 160;
  const innerRadius = 80; // donut style

  // Overall animation progress
  const sweepProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  const overallOpacity = interpolate(
    frame,
    [delay, delay + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Build slices
  let cumulativeAngle = -90; // start from top
  const slices = items.map((item, i) => {
    const sliceAngle = (item.value / total) * 360;
    const animatedAngle = sliceAngle * sweepProgress;
    const startAngle = cumulativeAngle;
    cumulativeAngle += sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + animatedAngle) * Math.PI) / 180;

    const largeArc = animatedAngle > 180 ? 1 : 0;

    const x1Outer = cx + radius * Math.cos(startRad);
    const y1Outer = cy + radius * Math.sin(startRad);
    const x2Outer = cx + radius * Math.cos(endRad);
    const y2Outer = cy + radius * Math.sin(endRad);
    const x1Inner = cx + innerRadius * Math.cos(endRad);
    const y1Inner = cy + innerRadius * Math.sin(endRad);
    const x2Inner = cx + innerRadius * Math.cos(startRad);
    const y2Inner = cy + innerRadius * Math.sin(startRad);

    const d = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      "Z",
    ].join(" ");

    // Label position (midpoint of arc)
    const midAngle = ((startAngle + sliceAngle / 2) * Math.PI) / 180;
    const labelRadius = radius + 40;
    const lx = cx + labelRadius * Math.cos(midAngle);
    const ly = cy + labelRadius * Math.sin(midAngle);

    const labelOpacity = interpolate(
      frame,
      [delay + 15 + i * 4, delay + 25 + i * 4],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    return { d, color: SLICE_COLORS[i % SLICE_COLORS.length], item, lx, ly, labelOpacity, percentage: ((item.value / total) * 100).toFixed(1) };
  });

  // Center value
  const centerOpacity = interpolate(
    frame,
    [delay + 20, delay + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{ opacity: overallOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <svg width={400} height={400} viewBox="0 0 400 400">
        {/* 3D shadow effect */}
        <ellipse
          cx={cx}
          cy={cy + 12}
          rx={radius}
          ry={radius * 0.15}
          fill="rgba(0,0,0,0.2)"
          style={{ filter: "blur(8px)" }}
        />

        {/* Slices */}
        {slices.map((slice, i) => (
          <path
            key={i}
            d={slice.d}
            fill={slice.color}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={2}
          />
        ))}

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={innerRadius - 5} fill="rgba(0,0,0,0.3)" />

        {/* Center text */}
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="white"
          fontSize={36}
          fontWeight={800}
          fontFamily="system-ui, sans-serif"
          opacity={centerOpacity}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize={18}
          fontWeight={500}
          fontFamily="system-ui, sans-serif"
          opacity={centerOpacity}
        >
          TOTAL
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 500 }}>
        {slices.map((slice, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: slice.labelOpacity,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 4, background: slice.color }} />
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.8)", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
              {slice.item.name}
            </span>
            <span style={{ fontSize: 20, color: slice.color, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
              {slice.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
