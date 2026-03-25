import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Candlestick chart + trend lines — for markets/stocks/trading topics */
export const StockMarket: React.FC<{ color?: string }> = ({ color = "rgba(52,211,153,0.3)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 80 } });

  // Candlesticks
  const candles = [
    { x: 680, h: 80, body: 40, up: true },
    { x: 730, h: 60, body: 35, up: false },
    { x: 780, h: 90, body: 50, up: true },
    { x: 830, h: 55, body: 30, up: true },
    { x: 880, h: 70, body: 45, up: false },
    { x: 930, h: 100, body: 55, up: true },
    { x: 980, h: 65, body: 38, up: true },
  ];

  const baseY = 350;

  // Moving average line
  const maPoints = candles.map((c, i) => {
    const offset = c.up ? -c.body * 0.3 : c.body * 0.3;
    return `${c.x},${baseY + offset + Math.sin(i * 0.8) * 20}`;
  }).join(" ");

  const lineDrawProgress = interpolate(frame - 10, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`g${i}`} x1={660} y1={baseY - 80 + i * 40} x2={1000} y2={baseY - 80 + i * 40} stroke={color} strokeWidth={0.5} opacity={0.3} />
        ))}

        {/* Candlesticks */}
        {candles.map((c, i) => {
          const candleP = spring({ frame: frame - 8 - i * 3, fps, config: { damping: 12, stiffness: 120 } });
          const wickTop = baseY - c.h / 2;
          const bodyTop = baseY - c.body / 2;
          const fillColor = c.up ? color : "rgba(239,68,68,0.3)";

          return (
            <g key={i} opacity={candleP}>
              {/* Wick */}
              <line x1={c.x} y1={wickTop} x2={c.x} y2={wickTop + c.h} stroke={fillColor} strokeWidth={1.5} />
              {/* Body */}
              <rect x={c.x - 10} y={bodyTop} width={20} height={c.body * candleP} rx={2} fill={fillColor} />
            </g>
          );
        })}

        {/* Trend line */}
        <polyline points={maPoints} fill="none" stroke={color} strokeWidth={2} strokeDasharray="800" strokeDashoffset={800 * (1 - lineDrawProgress)} opacity={0.6} />

        {/* Bull/bear arrows at bottom */}
        <g transform="translate(160, 1450)" opacity={entryP * 0.4}>
          <polygon points="0,40 20,0 40,40" fill="rgba(52,211,153,0.4)" />
          <text x={20} y={60} textAnchor="middle" fontSize={14} fill={color} fontFamily="system-ui" fontWeight={600}>BULL</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
