import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface AnimatedNumberProps {
  value: string; // e.g., "₹2.5 Lakh Crore", "6.5%", "1,200", "₹500 रद्दीकरण शुल्क"
  label: string;
  color?: string;
  delay?: number;
}

// Map Devanagari/other Indic digits to ASCII
function normalizeDigits(str: string): string {
  return str
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966)) // Devanagari
    .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6)) // Bengali
    .replace(/[௦-௯]/g, (d) => String(d.charCodeAt(0) - 0x0be6)) // Tamil
    .replace(/[౦-౯]/g, (d) => String(d.charCodeAt(0) - 0x0c66)); // Telugu
}

function extractNumber(value: string): {
  prefix: string;
  number: number;
  suffix: string;
  decimals: number;
  isTextOnly: boolean;
} {
  // Normalize Indic digits to ASCII first
  const normalized = normalizeDigits(value);

  // Try to find ANY number in the string (not just at the start)
  // This handles "₹2.5 Lakh Crore", "GDP 6.5%", "रद्दीकरण शुल्क ₹500", etc.
  const match = normalized.match(
    /([₹$€£]?\s*)([0-9][0-9,]*\.?[0-9]*)\s*(.*)/
  );

  if (!match || !match[2]) {
    // No number found at all — display as plain text
    return { prefix: "", number: 0, suffix: value, decimals: 0, isTextOnly: true };
  }

  // Get the part before the number as prefix
  const numberStartIdx = normalized.indexOf(match[2]);
  const beforeNumber = value.slice(0, numberStartIdx).trim();
  const afterNumber = value.slice(numberStartIdx + match[2].length).trim();

  const numStr = match[2].replace(/,/g, "");
  const number = parseFloat(numStr);

  if (isNaN(number)) {
    return { prefix: "", number: 0, suffix: value, decimals: 0, isTextOnly: true };
  }

  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;

  return {
    prefix: beforeNumber ? beforeNumber + " " : "",
    number,
    suffix: afterNumber,
    decimals,
    isTextOnly: false,
  };
}

function formatNumber(num: number, decimals: number): string {
  const formatted = num.toFixed(decimals);
  // Add commas (Indian numbering)
  const parts = formatted.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  label,
  color = "#34d399",
  delay = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { prefix, number, suffix, decimals, isTextOnly } = extractNumber(value);

  const entryProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const countProgress = interpolate(
    frame,
    [delay + 5, delay + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // For text-only values, just display the raw string
  let displayValue: string;
  if (isTextOnly) {
    displayValue = value;
  } else {
    const currentNumber = number * countProgress;
    displayValue = `${prefix}${formatNumber(currentNumber, decimals)}${suffix ? ` ${suffix}` : ""}`;
  }

  return (
    <div
      style={{
        opacity: entryProgress,
        transform: `scale(${interpolate(entryProgress, [0, 1], [0.8, 1])})`,
      }}
    >
      <div
        style={{
          fontSize: isTextOnly ? 52 : 72,
          fontWeight: 800,
          color,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.1,
          letterSpacing: -1,
        }}
      >
        {displayValue}
      </div>
      <div
        style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.6)",
          fontFamily: "system-ui, sans-serif",
          marginTop: 12,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
};
