import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SCENE_COLORS } from "../constants";

interface BackgroundProps {
  type: keyof typeof SCENE_COLORS;
}

export const Background: React.FC<BackgroundProps> = ({ type }) => {
  const frame = useCurrentFrame();
  const colors = SCENE_COLORS[type] || SCENE_COLORS.narration;

  // Subtle gradient shift animation
  const angle = interpolate(frame, [0, 300], [135, 160], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${angle}deg, ${colors.bg[0]}, ${colors.bg[1]})`,
        }}
      />
      {/* Subtle grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Accent glow */}
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}15, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
    </AbsoluteFill>
  );
};
