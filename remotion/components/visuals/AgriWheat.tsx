import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

/** Wheat stalks + tractor — for agriculture/rural/food topics */
export const AgriWheat: React.FC<{ color?: string }> = ({ color = "rgba(251,191,36,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 80 } });

  // Wheat stalks
  const stalks = [
    { x: 780, baseY: 550, height: 130, delay: 3 },
    { x: 820, baseY: 550, height: 150, delay: 5 },
    { x: 860, baseY: 550, height: 120, delay: 7 },
    { x: 900, baseY: 550, height: 140, delay: 4 },
    { x: 940, baseY: 550, height: 110, delay: 8 },
    { x: 980, baseY: 550, height: 135, delay: 6 },
    // Bottom left group
    { x: 80, baseY: 1520, height: 100, delay: 12 },
    { x: 120, baseY: 1520, height: 120, delay: 14 },
    { x: 160, baseY: 1520, height: 90, delay: 16 },
    { x: 200, baseY: 1520, height: 110, delay: 13 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {stalks.map((stalk, i) => {
          const growP = spring({ frame: frame - stalk.delay, fps, config: { damping: 14, stiffness: 80 } });
          const sway = Math.sin(frame * 0.025 + i * 1.5) * 8;
          const h = stalk.height * growP;
          const topY = stalk.baseY - h;

          return (
            <g key={i} opacity={0.5}>
              {/* Stem */}
              <path
                d={`M ${stalk.x},${stalk.baseY} Q ${stalk.x + sway * 0.5},${stalk.baseY - h * 0.5} ${stalk.x + sway},${topY}`}
                fill="none" stroke={color} strokeWidth={1.5}
              />
              {/* Wheat head (grain clusters) */}
              {growP > 0.5 && (
                <g transform={`translate(${stalk.x + sway}, ${topY})`}>
                  {[-8, -4, 0, 4, 8].map((dy, gi) => (
                    <ellipse key={gi} cx={0} cy={dy - 5} rx={4} ry={6} fill={color} opacity={0.4}
                      transform={`rotate(${sway * 0.5}, 0, ${dy - 5})`} />
                  ))}
                </g>
              )}
              {/* Leaves */}
              {h > 60 && (
                <>
                  <path d={`M ${stalk.x + sway * 0.3},${stalk.baseY - h * 0.4} Q ${stalk.x + sway * 0.3 + 20},${stalk.baseY - h * 0.45} ${stalk.x + sway * 0.3 + 30},${stalk.baseY - h * 0.35}`}
                    fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
                  <path d={`M ${stalk.x + sway * 0.6},${stalk.baseY - h * 0.65} Q ${stalk.x + sway * 0.6 - 18},${stalk.baseY - h * 0.7} ${stalk.x + sway * 0.6 - 25},${stalk.baseY - h * 0.6}`}
                    fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
                </>
              )}
            </g>
          );
        })}

        {/* Sun */}
        <g transform="translate(900, 250)" opacity={entryP * 0.2}>
          <circle cx={0} cy={0} r={30} fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth={2} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const rayLen = Math.sin(frame * 0.08 + i) * 5 + 15;
            return (
              <line key={i}
                x1={Math.cos(rad) * 35} y1={Math.sin(rad) * 35}
                x2={Math.cos(rad) * (35 + rayLen)} y2={Math.sin(rad) * (35 + rayLen)}
                stroke="rgba(251,191,36,0.25)" strokeWidth={1.5} />
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
