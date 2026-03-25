import React from "react";
import { AbsoluteFill, Series, Audio } from "remotion";
import { TitleScene } from "../scenes/TitleScene";
import { DataScene } from "../scenes/DataScene";
import { NarrationScene } from "../scenes/NarrationScene";
import { QuoteScene } from "../scenes/QuoteScene";
import { OutroScene } from "../scenes/OutroScene";
import { Subtitles } from "../components/Subtitles";
import { secondsToFrames } from "../hooks/use-scene-timing";
import type { NewsVideoProps, SceneComponentProps } from "../types";
import type { Scene } from "../types";

const SCENE_COMPONENTS: Record<
  Scene["type"],
  React.FC<SceneComponentProps>
> = {
  title: TitleScene,
  data: DataScene,
  narration: NarrationScene,
  quote: QuoteScene,
  outro: OutroScene,
};

export const NewsVideo: React.FC<NewsVideoProps> = ({
  scenes,
  language,
  audioUrls,
}) => {
  const showSubtitles = language !== "en";

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Series>
        {scenes.map((scene, index) => {
          const durationInFrames = secondsToFrames(scene.duration);
          const SceneComponent =
            SCENE_COMPONENTS[scene.type] || NarrationScene;
          const audioUrl = audioUrls?.[index];

          return (
            <Series.Sequence
              key={index}
              durationInFrames={durationInFrames}
            >
              <SceneComponent
                scene={scene}
                durationInFrames={durationInFrames}
                sceneIndex={index}
                totalScenes={scenes.length}
                language={language}
              />
              {showSubtitles && scene.subtitle && (
                <Subtitles
                  text={scene.subtitle}
                  durationInFrames={durationInFrames}
                />
              )}
              {audioUrl && <Audio src={audioUrl} />}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
