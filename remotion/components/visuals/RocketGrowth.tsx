import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Rocket + growth trail — for startups/growth/funding topics */
export const RocketGrowth: React.FC<{ color?: string }> = ({ color = "rgba(167,139,250,0.3)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const launchP = spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 60 } });
  const rocketY = interpolate(launchP, [0, 1], [600, 250]);
  const rocketX = 850;

  // Trail particles
  const trailCount = 8;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Growth curve */}
        <path
          d={`M 700,550 Q 750,500 800,420 Q 830,360 ${rocketX},${rocketY + 40}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="400"
          strokeDashoffset={400 * (1 - launchP)}
          opacity={0.5}
        />

        {/* Trail particles */}
        {Array.from({ length: trailCount }, (_, i) => {
          const trailP = spring({ frame: frame - 12 - i * 4, fps, config: { damping: 10, stiffness: 80 } });
          const ty = rocketY + 50 + i * 30;
          const spread = (i + 1) * 8;
          const opacity = interpolate(i, [0, trailCount], [0.5, 0.1]);

          return (
            <g key={i} opacity={trailP * opacity}>
              <circle cx={rocketX - spread * 0.5} cy={ty} r={3 + i * 0.5} fill={color} />
              <circle cx={rocketX + spread * 0.5} cy={ty} r={2 + i * 0.3} fill={color} />
              <circle cx={rocketX} cy={ty + 5} r={2} fill={color} opacity={0.5} />
            </g>
          );
        })}

        {/* Rocket body */}
        <g transform={`translate(${rocketX}, ${rocketY})`} opacity={launchP}>
          {/* Body */}
          <path d="M 0,-30 C 12,-30 18,-10 18,15 L -18,15 C -18,-10 -12,-30 0,-30 Z" fill="none" stroke={color} strokeWidth={2} />
          {/* Nose cone */}
          <path d="M -8,-28 L 0,-50 L 8,-28" fill={color} opacity={0.4} />
          {/* Window */}
          <circle cx={0} cy={-8} r={6} fill="none" stroke={color} strokeWidth={1.5} />
          {/* Fins */}
          <path d="M -18,10 L -28,25 L -18,20" fill={color} opacity={0.4} />
          <path d="M 18,10 L 28,25 L 18,20" fill={color} opacity={0.4} />
          {/* Flame */}
          <path
            d={`M -10,15 Q 0,${25 + Math.sin(frame * 0.3) * 8} 10,15`}
            fill="none"
            stroke="rgba(251,191,36,0.4)"
            strokeWidth={2}
          />
        </g>

        {/* Stars */}
        {[
          { x: 780, y: 200, s: 3 }, { x: 920, y: 180, s: 2 }, { x: 860, y: 150, s: 4 },
          { x: 750, y: 300, s: 2 }, { x: 950, y: 350, s: 3 },
        ].map((star, i) => {
          const twinkle = Math.sin(frame * 0.1 + i * 2) * 0.5 + 0.5;
          return <circle key={i} cx={star.x} cy={star.y} r={star.s} fill={color} opacity={launchP * twinkle * 0.5} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
