import React from "react";
import {
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

interface AnimatedTextProps {
  text: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  delay?: number;
  style?: React.CSSProperties;
  lineHeight?: number;
  maxWidth?: string | number;
  textAlign?: "left" | "center" | "right";
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  fontSize = 48,
  fontWeight = 700,
  color = "#ffffff",
  delay = 0,
  style,
  lineHeight = 1.3,
  maxWidth = "100%",
  textAlign = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split text into words for word-by-word animation
  const words = text.split(" ");

  return (
    <div
      style={{
        maxWidth,
        textAlign,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: textAlign === "center" ? "center" : "flex-start",
        gap: `0 ${fontSize * 0.25}px`,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = delay + i * 2; // 2 frames stagger per word
        const progress = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 15, stiffness: 150, mass: 0.8 },
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight,
              color,
              fontFamily: "system-ui, sans-serif",
              lineHeight,
              opacity: progress,
              transform: `translateY(${(1 - progress) * 20}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
