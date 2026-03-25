import React from "react";
import {
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";

interface ChangeIndicatorProps {
  change: string; // e.g., "+5.2%", "-12%", "+₹500 Cr"
  delay?: number;
}

export const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({
  change,
  delay = 25,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isPositive = change.startsWith("+");
  const color = isPositive ? "#4ade80" : "#f87171";

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const arrowY = interpolate(progress, [0, 1], [isPositive ? 15 : -15, 0]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 10}px)`,
        background: `${color}18`,
        borderRadius: 12,
        padding: "8px 20px",
        border: `1px solid ${color}30`,
      }}
    >
      {/* Arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: `translateY(${arrowY}px)` }}
      >
        <path
          d={
            isPositive
              ? "M12 19V5M12 5L5 12M12 5L19 12"
              : "M12 5V19M12 19L5 12M12 19L19 12"
          }
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Value */}
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          color,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {change}
      </span>
    </div>
  );
};
