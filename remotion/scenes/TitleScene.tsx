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
import { NewsTicker } from "../components/illustrations/NewsTicker";
import type { SceneComponentProps } from "../types";
import { SCENE_COLORS } from "../constants";

export const TitleScene: React.FC<SceneComponentProps> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = SCENE_COLORS.title;

  const lineProgress = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 100 } });
  const badgeProgress = spring({ frame: frame - 3, fps, config: { damping: 12, stiffness: 200 } });
  const exitOpacity = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background type="title" />
      <SceneVisual visual={scene.visual} color={`${colors.accent}40`} seed={42} />
      <NewsTicker color={`${colors.accent}40`} delay={20} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
        <div style={{ opacity: badgeProgress, transform: `translateX(${(1 - badgeProgress) * -30}px)`, marginBottom: 30 }}>
          <span style={{ background: `${colors.accent}25`, border: `1px solid ${colors.accent}50`, color: colors.accent, fontSize: 22, fontWeight: 600, padding: "8px 20px", borderRadius: 30, fontFamily: "system-ui, sans-serif", letterSpacing: 2, textTransform: "uppercase" }}>
            Business News
          </span>
        </div>
        <div style={{ width: `${lineProgress * 80}px`, height: 4, background: colors.accent, borderRadius: 2, marginBottom: 28 }} />
        <AnimatedText text={scene.text} fontSize={62} fontWeight={800} color={colors.text} delay={8} lineHeight={1.2} maxWidth="90%" />
        <div style={{ marginTop: 40 }}>
          <AnimatedText text={scene.narration} fontSize={30} fontWeight={400} color="rgba(255,255,255,0.65)" delay={20} lineHeight={1.5} maxWidth="85%" />
        </div>
      </div>
      <Branding />
    </AbsoluteFill>
  );
};
