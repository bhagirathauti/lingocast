import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Medical cross + heartbeat — for healthcare/pharma topics */
export const HealthMedical: React.FC<{ color?: string }> = ({ color = "rgba(239,68,68,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 80 } });

  // Heartbeat line
  const heartbeatWidth = 400;
  const hbX = 650;
  const hbY = 400;
  const progress = interpolate(frame % 90, [0, 90], [0, 1]);

  const heartbeatPath = `M ${hbX},${hbY} l 40,0 l 10,-30 l 15,60 l 15,-80 l 15,100 l 15,-50 l 10,0 l 40,0`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Medical cross */}
        <g transform="translate(870, 300)" opacity={entryP * 0.4}>
          <rect x={-12} y={-35} width={24} height={70} rx={4} fill="none" stroke={color} strokeWidth={2} />
          <rect x={-35} y={-12} width={70} height={24} rx={4} fill="none" stroke={color} strokeWidth={2} />
        </g>

        {/* Heartbeat line */}
        <path d={heartbeatPath} fill="none" stroke={color} strokeWidth={2.5}
          strokeDasharray={heartbeatWidth} strokeDashoffset={heartbeatWidth * (1 - progress)}
          opacity={0.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Pulse dot */}
        <circle cx={hbX + progress * 200} cy={hbY} r={4} fill={color} opacity={entryP * 0.6} />

        {/* Pill capsule (bottom) */}
        <g transform="translate(150, 1400) rotate(-30)" opacity={entryP * 0.35}>
          <rect x={0} y={0} width={50} height={22} rx={11} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={25} y1={0} x2={25} y2={22} stroke={color} strokeWidth={1} />
          <rect x={25} y={1} width={24} height={20} rx={10} fill={color} opacity={0.15} />
        </g>

        {/* DNA helix hint */}
        <g transform="translate(950, 450)" opacity={entryP * 0.25}>
          {Array.from({ length: 8 }, (_, i) => {
            const y = i * 18;
            const xOff = Math.sin((frame * 0.05 + i * 0.8)) * 15;
            return (
              <g key={i}>
                <circle cx={xOff} cy={y} r={3} fill={color} opacity={0.5} />
                <circle cx={-xOff} cy={y} r={3} fill={color} opacity={0.5} />
                <line x1={xOff} y1={y} x2={-xOff} y2={y} stroke={color} strokeWidth={0.8} opacity={0.3} />
              </g>
            );
          })}
        </g>

        {/* Shield (protection/insurance) */}
        <g transform="translate(780, 500)" opacity={entryP * 0.3}>
          <path d="M 0,-25 L 20,-15 L 20,10 Q 20,25 0,35 Q -20,25 -20,10 L -20,-15 Z" fill="none" stroke={color} strokeWidth={1.5} />
          <path d="M 0,-8 L 0,8 M -8,0 L 8,0" stroke={color} strokeWidth={2} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
