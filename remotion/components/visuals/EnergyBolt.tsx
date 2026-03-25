import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Lightning bolts + battery + solar — for EV/energy/green topics */
export const EnergyBolt: React.FC<{ color?: string }> = ({ color = "rgba(52,211,153,0.3)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 80 } });

  // Battery charging animation
  const chargeLevel = interpolate(frame, [20, 120], [0.1, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Lightning bolt - main */}
        <g transform="translate(850, 300)" opacity={entryP * 0.5}>
          <path d="M 0,0 L -20,45 L 5,40 L -15,90 L 25,35 L 0,40 L 20,0 Z"
            fill={color} stroke={color} strokeWidth={1} />
        </g>

        {/* Lightning bolt - smaller */}
        <g transform="translate(920, 450) scale(0.6)" opacity={entryP * 0.35}>
          <path d="M 0,0 L -20,45 L 5,40 L -15,90 L 25,35 L 0,40 L 20,0 Z"
            fill={color} />
        </g>

        {/* Battery outline */}
        <g transform="translate(130, 1380)" opacity={entryP * 0.5}>
          <rect x={0} y={0} width={60} height={100} rx={6} fill="none" stroke={color} strokeWidth={2} />
          <rect x={18} y={-8} width={24} height={10} rx={3} fill="none" stroke={color} strokeWidth={1.5} />
          {/* Charge fill */}
          <rect x={5} y={95 - chargeLevel * 90} width={50} height={chargeLevel * 90} rx={3} fill={color} opacity={0.4} />
          {/* Charge bolt */}
          <path d="M 30,25 L 22,50 L 32,48 L 24,75 L 40,42 L 30,44 Z" fill={color} opacity={chargeLevel > 0.3 ? 0.6 : 0} />
        </g>

        {/* Solar panel */}
        <g transform="translate(800, 550)" opacity={entryP * 0.35}>
          <rect x={0} y={0} width={80} height={50} rx={3} fill="none" stroke={color} strokeWidth={1.5} />
          {/* Grid lines */}
          <line x1={27} y1={0} x2={27} y2={50} stroke={color} strokeWidth={0.8} />
          <line x1={53} y1={0} x2={53} y2={50} stroke={color} strokeWidth={0.8} />
          <line x1={0} y1={17} x2={80} y2={17} stroke={color} strokeWidth={0.8} />
          <line x1={0} y1={33} x2={80} y2={33} stroke={color} strokeWidth={0.8} />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rayP = Math.sin(frame * 0.08 + i) * 0.3 + 0.7;
            const rad = (angle * Math.PI) / 180;
            return (
              <line key={i}
                x1={40 + Math.cos(rad) * 18} y1={-20 + Math.sin(rad) * 18}
                x2={40 + Math.cos(rad) * 28} y2={-20 + Math.sin(rad) * 28}
                stroke="rgba(251,191,36,0.3)" strokeWidth={1.5} opacity={entryP * rayP} />
            );
          })}
          <circle cx={40} cy={-20} r={10} fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth={1.5} />
        </g>

        {/* Floating leaf particles */}
        {[
          { x: 750, y: 400, delay: 12 }, { x: 950, y: 280, delay: 18 },
          { x: 200, y: 1500, delay: 15 }, { x: 280, y: 1350, delay: 22 },
        ].map((leaf, i) => {
          const p = spring({ frame: frame - leaf.delay, fps, config: { damping: 14, stiffness: 100 } });
          const floatY = Math.sin(frame * 0.03 + i * 2) * 10;
          return (
            <path key={i}
              d={`M ${leaf.x},${leaf.y + floatY} Q ${leaf.x + 8},${leaf.y + floatY - 12} ${leaf.x + 16},${leaf.y + floatY} Q ${leaf.x + 8},${leaf.y + floatY + 5} ${leaf.x},${leaf.y + floatY}`}
              fill={color} opacity={p * 0.4} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
