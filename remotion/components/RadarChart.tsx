import React from "react";
import {
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";

interface RadarChartItem {
  name: string;
  value: number;
}

interface RadarChartProps {
  items: RadarChartItem[];
  color?: string;
  delay?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  items,
  color = "#34d399",
  delay = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cx = 220;
  const cy = 220;
  const maxRadius = 170;
  const levels = 4;
  const numAxes = items.length;
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  // Animation progress
  const fillProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 50 },
  });

  const overallOpacity = interpolate(
    frame,
    [delay, delay + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Helper to get point on radar
  const getPoint = (index: number, value: number, max: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const r = (value / max) * maxRadius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid rings
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius;
    const points = Array.from({ length: numAxes }, (_, j) => {
      const angle = (Math.PI * 2 * j) / numAxes - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(" ");
    return points;
  });

  // Axis lines
  const axisLines = Array.from({ length: numAxes }, (_, i) => {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    return {
      x2: cx + maxRadius * Math.cos(angle),
      y2: cy + maxRadius * Math.sin(angle),
    };
  });

  // Data polygon
  const dataPoints = items.map((item, i) =>
    getPoint(i, item.value * fillProgress, maxValue)
  );
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ opacity: overallOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <svg width={440} height={440} viewBox="0 0 440 440">
        {/* Glow filter */}
        <defs>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Grid rings */}
        {gridRings.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
        ))}

        {/* Data fill area */}
        <polygon
          points={dataPolygon}
          fill="url(#radarFill)"
          stroke={color}
          strokeWidth={3}
          filter="url(#radarGlow)"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => {
          const dotOpacity = interpolate(
            frame,
            [delay + 10 + i * 3, delay + 18 + i * 3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={8} fill={color} opacity={dotOpacity} />
              <circle cx={p.x} cy={p.y} r={4} fill="white" opacity={dotOpacity} />
            </g>
          );
        })}

        {/* Axis labels */}
        {items.map((item, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const labelR = maxRadius + 35;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);

          const labelOpacity = interpolate(
            frame,
            [delay + 5 + i * 3, delay + 13 + i * 3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <g key={i}>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.8)"
                fontSize={18}
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
                opacity={labelOpacity}
              >
                {item.name}
              </text>
              <text
                x={lx}
                y={ly + 22}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={18}
                fontWeight={700}
                fontFamily="system-ui, sans-serif"
                opacity={labelOpacity}
              >
                {Math.round(item.value * fillProgress)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
