import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { Branding } from "../components/Branding";
import { AnimatedText } from "../components/AnimatedText";
import { SceneVisual } from "../components/visuals";
import { WaveForm } from "../components/illustrations/WaveForm";
import type { SceneComponentProps } from "../types";
import { SCENE_COLORS } from "../constants";

export const NarrationScene: React.FC<SceneComponentProps> = ({
  scene,
  durationInFrames,
  sceneIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = SCENE_COLORS.narration;

  const barHeight = interpolate(frame, [5, 25], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background type="narration" />
      <SceneVisual visual={scene.visual} color={`${colors.accent}30`} seed={sceneIndex * 17 + 100} />
      <WaveForm color={`${colors.accent}20`} bars={40} position="bottom" delay={8} />

      <div style={{ position: "absolute", left: 50, top: "50%", transform: "translateY(-50%)", width: 4, height: `${barHeight}px`, background: colors.accent, borderRadius: 2 }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px" }}>
        <AnimatedText text={scene.text} fontSize={48} fontWeight={700} color={colors.text} delay={8} lineHeight={1.3} maxWidth="90%" />
        <div style={{ marginTop: 50 }}>
          <AnimatedText text={scene.narration} fontSize={28} fontWeight={400} color="rgba(255,255,255,0.55)" delay={18} lineHeight={1.55} maxWidth="85%" />
        </div>
      </div>
      <Branding />
    </AbsoluteFill>
  );
};
