import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { Branding } from "../components/Branding";
import { AnimatedText } from "../components/AnimatedText";
import { SceneVisual } from "../components/visuals";
import { QuoteDecoration } from "../components/illustrations/QuoteDecoration";
import type { SceneComponentProps } from "../types";
import { SCENE_COLORS } from "../constants";

export const QuoteScene: React.FC<SceneComponentProps> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = SCENE_COLORS.quote;

  const quoteMarkProgress = spring({ frame: frame - 3, fps, config: { damping: 10, stiffness: 120 } });
  const exitOpacity = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background type="quote" />
      <SceneVisual visual={scene.visual} color={`${colors.accent}20`} seed={88} />
      <QuoteDecoration color={`${colors.accent}20`} delay={3} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
        <div style={{ fontSize: 180, fontFamily: "Georgia, serif", color: colors.accent, opacity: quoteMarkProgress * 0.3, lineHeight: 0.8, transform: `scale(${interpolate(quoteMarkProgress, [0, 1], [0.5, 1])})`, marginBottom: -30 }}>
          &ldquo;
        </div>
        <AnimatedText text={scene.text} fontSize={44} fontWeight={600} color={colors.text} delay={10} lineHeight={1.4} maxWidth="88%" style={{ fontStyle: "italic" }} />
        <div style={{ fontSize: 180, fontFamily: "Georgia, serif", color: colors.accent, opacity: quoteMarkProgress * 0.3, lineHeight: 0.5, textAlign: "right", marginTop: -10, transform: `scale(${interpolate(quoteMarkProgress, [0, 1], [0.5, 1])})` }}>
          &rdquo;
        </div>
        <div style={{ marginTop: 40 }}>
          <AnimatedText text={scene.narration} fontSize={26} fontWeight={400} color="rgba(255,255,255,0.55)" delay={22} lineHeight={1.5} maxWidth="85%" />
        </div>
      </div>
      <Branding />
    </AbsoluteFill>
  );
};
