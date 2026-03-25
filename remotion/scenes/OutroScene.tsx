import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { SceneVisual } from "../components/visuals";
import { SparkleEffect } from "../components/illustrations/SparkleEffect";
import type { SceneComponentProps } from "../types";
import { SCENE_COLORS } from "../constants";

export const OutroScene: React.FC<SceneComponentProps> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = SCENE_COLORS.outro;

  const brandProgress = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 100 } });
  const lineWidth = interpolate(frame, [15, 35], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background type="outro" />
      <SceneVisual visual={scene.visual} color={`${colors.accent}20`} seed={200} />
      <SparkleEffect color={`${colors.accent}25`} count={12} seed={123} delay={5} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 70px", textAlign: "center" }}>
        <AnimatedText text={scene.text} fontSize={42} fontWeight={700} color={colors.text} delay={5} lineHeight={1.35} textAlign="center" maxWidth="90%" />
        <div style={{ width: lineWidth, height: 2, background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`, margin: "40px 0" }} />
        <AnimatedText text={scene.narration} fontSize={26} fontWeight={400} color="rgba(255,255,255,0.55)" delay={20} lineHeight={1.5} textAlign="center" maxWidth="80%" />

        <div style={{ marginTop: 60, opacity: brandProgress, transform: `translateY(${(1 - brandProgress) * 20}px)` }}>
          <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: 20, padding: "20px 40px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#ffffff", fontFamily: "system-ui, sans-serif", letterSpacing: 3 }}>ET</span>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif", letterSpacing: 4, textTransform: "uppercase" }}>Vernacular Studio</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
