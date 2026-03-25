import React from "react";
import { AbsoluteFill } from "remotion";
import { Lottie, LottieAnimationData } from "@remotion/lottie";

interface LottieOverlayProps {
  animationData: LottieAnimationData | null;
  style?: React.CSSProperties;
  playbackRate?: number;
  loop?: boolean;
  opacity?: number;
}

/**
 * Reusable Lottie animation overlay for Remotion scenes.
 *
 * Usage:
 * 1. Import your Lottie JSON file
 * 2. Pass it as animationData
 *
 * Example:
 * ```tsx
 * import animationData from "./my-animation.json";
 * <LottieOverlay animationData={animationData} opacity={0.3} />
 * ```
 */
export const LottieOverlay: React.FC<LottieOverlayProps> = ({
  animationData,
  style,
  playbackRate = 1,
  loop = true,
  opacity = 0.3,
}) => {
  if (!animationData) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, ...style }}>
      <Lottie
        animationData={animationData}
        playbackRate={playbackRate}
        loop={loop}
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};
