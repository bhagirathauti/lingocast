import React from "react";
import {
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";

interface BarChartItem {
  name: string;
  value: number;
}

interface BarChartProps {
  items: BarChartItem[];
  color?: string;
  delay?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  items,
  color = "#34d399",
  delay = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {items.map((item, i) => {
        const staggerDelay = delay + i * 6;

        const barProgress = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 14, stiffness: 80 },
        });

        const labelOpacity = interpolate(
          frame,
          [staggerDelay, staggerDelay + 8],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const barWidth = (item.value / maxValue) * 100 * barProgress;

        return (
          <div key={i}>
            {/* Label */}
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.8)",
                fontFamily: "system-ui, sans-serif",
                marginBottom: 8,
                opacity: labelOpacity,
                fontWeight: 500,
              }}
            >
              {item.name}
            </div>
            {/* Bar container */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 36,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                    borderRadius: 8,
                  }}
                />
              </div>
              {/* Value */}
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color,
                  fontFamily: "system-ui, sans-serif",
                  minWidth: 60,
                  opacity: labelOpacity,
                }}
              >
                {Math.round(item.value * barProgress)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
