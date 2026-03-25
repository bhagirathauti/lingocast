import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

/** Globe with trade routes — for trade/exports/international topics */
export const GlobeTradeVis: React.FC<{ color?: string }> = ({ color = "rgba(96,165,250,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 70 } });
  const rotAngle = frame * 0.3;

  const cx = 860;
  const cy = 380;
  const r = 120;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Globe */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />

        {/* Latitude lines */}
        {[-0.5, 0, 0.5].map((lat, i) => (
          <ellipse key={`lat${i}`} cx={cx} cy={cy + lat * r * 0.8} rx={r * Math.cos(Math.asin(lat * 0.8))} ry={r * 0.15} fill="none" stroke={color} strokeWidth={0.8} opacity={0.3} />
        ))}

        {/* Longitude lines (rotating) */}
        {[0, 60, 120].map((deg, i) => {
          const a = ((deg + rotAngle) * Math.PI) / 180;
          const rxScale = Math.abs(Math.cos(a));
          return (
            <ellipse key={`lon${i}`} cx={cx} cy={cy} rx={r * rxScale * 0.95} ry={r} fill="none" stroke={color} strokeWidth={0.8} opacity={0.25} transform={`rotate(0, ${cx}, ${cy})`} />
          );
        })}

        {/* Trade route arcs */}
        {[
          { x1: cx - 80, y1: cy - 30, x2: cx + 60, y2: cy + 50, delay: 10 },
          { x1: cx - 50, y1: cy + 40, x2: cx + 90, y2: cy - 20, delay: 18 },
          { x1: cx + 30, y1: cy - 60, x2: cx - 70, y2: cy + 30, delay: 25 },
        ].map((route, i) => {
          const routeP = spring({ frame: frame - route.delay, fps, config: { damping: 20, stiffness: 60 } });
          const midX = (route.x1 + route.x2) / 2;
          const midY = (route.y1 + route.y2) / 2 - 40;
          return (
            <g key={i} opacity={routeP * 0.5}>
              <path d={`M ${route.x1},${route.y1} Q ${midX},${midY} ${route.x2},${route.y2}`} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="200" strokeDashoffset={200 * (1 - routeP)} />
              {/* Dot at destination */}
              <circle cx={route.x2} cy={route.y2} r={4 * routeP} fill={color} opacity={0.6} />
            </g>
          );
        })}

        {/* Shipping/cargo icon (bottom) */}
        <g transform="translate(150, 1420)" opacity={entryP * 0.35}>
          {/* Container ship outline */}
          <path d="M 0,30 L 10,45 L 90,45 L 100,30" fill="none" stroke={color} strokeWidth={1.5} />
          <rect x={20} y={10} width={20} height={20} fill="none" stroke={color} strokeWidth={1} rx={1} />
          <rect x={45} y={10} width={20} height={20} fill="none" stroke={color} strokeWidth={1} rx={1} />
          <rect x={32} y={-5} width={20} height={15} fill="none" stroke={color} strokeWidth={1} rx={1} />
          {/* Waves */}
          <path d={`M -10,48 Q 10,${44 + Math.sin(frame * 0.08) * 3} 30,48 Q 50,${52 + Math.sin(frame * 0.08) * 3} 70,48 Q 90,${44 + Math.sin(frame * 0.08) * 3} 110,48`} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
