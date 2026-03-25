import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

/** Books + graduation cap — for education/policy/knowledge topics */
export const EducationBooks: React.FC<{ color?: string }> = ({ color = "rgba(96,165,250,0.25)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryP = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: entryP }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {/* Stack of books */}
        <g transform="translate(830, 380)" opacity={0.45}>
          {[
            { w: 70, h: 12, color: color, delay: 5, y: 0 },
            { w: 65, h: 12, color: color, delay: 7, y: -14 },
            { w: 75, h: 12, color: color, delay: 9, y: -28 },
            { w: 60, h: 12, color: color, delay: 11, y: -42 },
          ].map((book, i) => {
            const bookP = spring({ frame: frame - book.delay, fps, config: { damping: 12, stiffness: 120 } });
            return (
              <g key={i} transform={`translate(0, ${book.y * bookP})`} opacity={bookP}>
                <rect x={-book.w / 2} y={0} width={book.w} height={book.h} rx={2} fill="none" stroke={book.color} strokeWidth={1.5} />
                <line x1={-book.w / 2 + 6} y1={1} x2={-book.w / 2 + 6} y2={book.h - 1} stroke={book.color} strokeWidth={0.8} opacity={0.4} />
              </g>
            );
          })}
        </g>

        {/* Graduation cap */}
        <g transform="translate(870, 280)" opacity={entryP * 0.4}>
          {/* Cap diamond shape */}
          <polygon points="0,-15 40,0 0,15 -40,0" fill="none" stroke={color} strokeWidth={1.5} />
          {/* Board */}
          <line x1={0} y1={0} x2={0} y2={25} stroke={color} strokeWidth={1} />
          {/* Tassel */}
          <path d={`M 40,0 L 40,20 Q 42,${25 + Math.sin(frame * 0.06) * 3} 38,${30 + Math.sin(frame * 0.06) * 3}`}
            fill="none" stroke={color} strokeWidth={1} />
          <circle cx={38} cy={30 + Math.sin(frame * 0.06) * 3} r={2} fill={color} opacity={0.5} />
        </g>

        {/* Open book (bottom left) */}
        <g transform="translate(150, 1400)" opacity={entryP * 0.35}>
          <path d="M 0,0 Q 30,-8 60,0" fill="none" stroke={color} strokeWidth={1.5} />
          <path d="M 0,0 Q -30,-8 -60,0" fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={0} y1={0} x2={0} y2={40} stroke={color} strokeWidth={0.8} opacity={0.3} />
          {/* Text lines on left page */}
          {[8, 16, 24, 32].map((y, i) => (
            <line key={i} x1={-50 + i * 3} y1={y} x2={-10} y2={y} stroke={color} strokeWidth={0.6} opacity={0.3} />
          ))}
          {/* Text lines on right page */}
          {[8, 16, 24, 32].map((y, i) => (
            <line key={`r${i}`} x1={10} y1={y} x2={50 - i * 3} y2={y} stroke={color} strokeWidth={0.6} opacity={0.3} />
          ))}
        </g>

        {/* Lightbulb (idea) */}
        <g transform="translate(940, 450)" opacity={entryP * 0.3}>
          <path d="M 0,-20 Q 12,-18 15,-5 Q 17,8 5,15 L -5,15 Q -17,8 -15,-5 Q -12,-18 0,-20 Z"
            fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={-4} y1={15} x2={-4} y2={22} stroke={color} strokeWidth={1} />
          <line x1={4} y1={15} x2={4} y2={22} stroke={color} strokeWidth={1} />
          <line x1={-5} y1={22} x2={5} y2={22} stroke={color} strokeWidth={1} />
          {/* Glow rays */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const glow = Math.sin(frame * 0.1 + i) * 0.3 + 0.5;
            return (
              <line key={i}
                x1={Math.cos(rad) * 22} y1={Math.sin(rad) * 22 - 5}
                x2={Math.cos(rad) * 30} y2={Math.sin(rad) * 30 - 5}
                stroke={color} strokeWidth={1} opacity={glow * 0.4} />
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
