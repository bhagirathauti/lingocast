import React from "react";
import { Composition } from "remotion";
import { NewsVideo } from "./compositions/NewsVideo";
import { FPS, WIDTH, HEIGHT } from "./constants";
import { getTotalFrames } from "./hooks/use-scene-timing";
import type { NewsVideoProps } from "./types";

export const RemotionRoot: React.FC = () => {
  const defaultProps: NewsVideoProps = {
    title: "Sample News Video",
    language: "hi",
    totalDuration: 60,
    scenes: [
      {
        type: "title",
        text: "Breaking Business News",
        narration: "Welcome to ET Vernacular Studio",
        duration: 8,
      },
      {
        type: "data",
        text: "Key Economic Indicator",
        narration: "Here are the latest numbers",
        data: {
          label: "GDP Growth",
          value: "6.5%",
          change: "+0.3%",
          chartType: "number",
        },
        duration: 12,
      },
      {
        type: "narration",
        text: "Important market development",
        narration: "Markets responded positively to the announcement",
        duration: 10,
      },
      {
        type: "quote",
        text: "This is a transformative moment for the Indian economy",
        narration: "Said the Finance Minister in a press conference",
        duration: 10,
      },
      {
        type: "outro",
        text: "Stay tuned for more updates",
        narration: "Follow ET for the latest business news",
        duration: 8,
      },
    ],
  };

  return (
    <Composition
      id="NewsVideo"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={NewsVideo as any}
      durationInFrames={getTotalFrames(defaultProps.scenes)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: getTotalFrames((props as unknown as NewsVideoProps).scenes),
      })}
    />
  );
};
