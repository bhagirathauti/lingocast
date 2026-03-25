import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { Background } from "../components/Background";
import { Branding } from "../components/Branding";
import { AnimatedText } from "../components/AnimatedText";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { BarChart } from "../components/BarChart";
import { BarChart3D } from "../components/BarChart3D";
import { PieChart } from "../components/PieChart";
import { RadarChart } from "../components/RadarChart";
import { ChangeIndicator } from "../components/ChangeIndicator";
import { SceneVisual } from "../components/visuals";
import type { SceneComponentProps } from "../types";
import { SCENE_COLORS } from "../constants";

export const DataScene: React.FC<SceneComponentProps> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const colors = SCENE_COLORS.data;
  const data = scene.data;

  const hasItems = data?.items && data.items.length > 1;
  const chartType = data?.chartType || "number";
  const exitOpacity = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background type="data" />
      <SceneVisual visual={scene.visual} color={`${colors.accent}20`} seed={55} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 50px",
          textAlign: "center",
        }}
      >
        {/* Title text */}
        <AnimatedText
          text={scene.text}
          fontSize={36}
          fontWeight={600}
          color="rgba(255,255,255,0.9)"
          delay={5}
          lineHeight={1.35}
          maxWidth="90%"
          textAlign="center"
        />

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 3,
            background: colors.accent,
            borderRadius: 2,
            margin: "28px auto",
            opacity: interpolate(frame, [8, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Data visualization area — centered */}
        {data && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            {/* Main number */}
            {data.value && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <AnimatedNumber value={data.value} label={data.label} color={colors.accent} delay={12} />
              </div>
            )}

            {/* Change indicator */}
            {data.change && (
              <div style={{ marginTop: 20 }}>
                <ChangeIndicator change={data.change} delay={30} />
              </div>
            )}

            {/* Charts — centered */}
            {hasItems && (
              <div style={{ marginTop: 30, display: "flex", justifyContent: "center", width: "100%" }}>
                {chartType === "pie" && <PieChart items={data.items!} color={colors.accent} delay={20} />}
                {chartType === "radar" && <RadarChart items={data.items!} color={colors.accent} delay={20} />}
                {chartType === "bar3d" && <BarChart3D items={data.items!} color={colors.accent} delay={20} />}
                {(chartType === "bar" || chartType === "number") && <BarChart items={data.items!} color={colors.accent} delay={20} />}
              </div>
            )}
          </div>
        )}
      </div>

      <Branding />
    </AbsoluteFill>
  );
};
