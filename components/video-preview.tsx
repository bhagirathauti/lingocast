"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useRef, useState, useCallback } from "react";
import { NewsVideo } from "@/remotion/compositions/NewsVideo";
import { FPS, WIDTH, HEIGHT } from "@/remotion/constants";
import { getTotalFrames } from "@/remotion/hooks/use-scene-timing";
import type { Scene } from "@/lib/supabase";
import { Play, Pause, RotateCcw, Download, Loader2 } from "lucide-react";

interface VideoPreviewProps {
  title: string;
  scenes: Scene[];
  language: string;
  totalDuration: number;
  audioUrls?: string[];
  onRenderVideo: () => void;
  isRendering: boolean;
  renderProgress: number | null;
  videoDownloadUrl: string | null;
}

export function VideoPreview({
  title,
  scenes,
  language,
  totalDuration,
  audioUrls,
  onRenderVideo,
  isRendering,
  renderProgress,
  videoDownloadUrl,
}: VideoPreviewProps) {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const durationInFrames = getTotalFrames(scenes);

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setIsPlaying(true);
  }, []);

  const inputProps = { title, scenes, language, totalDuration, audioUrls };

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Player */}
      <div
        className="relative mx-auto overflow-hidden rounded-lg bg-black ring-1 ring-border"
        style={{ maxWidth: 320 }}
      >
        <div style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}>
          <Player
            ref={playerRef}
            component={NewsVideo}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            fps={FPS}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            style={{ width: "100%", height: "100%" }}
            acknowledgeRemotionLicense
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleRestart}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Restart"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handlePlayPause}
          className="flex h-11 w-11 items-center justify-center rounded-md bg-foreground text-background transition-all hover:opacity-80 active:scale-95"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <div className="w-9" />
      </div>

      {/* Timeline */}
      <div className="flex gap-px rounded overflow-hidden h-1 bg-muted">
        {scenes.map((scene, i) => {
          const widthPercent = (scene.duration / totalDuration) * 100;
          return (
            <div
              key={i}
              className="h-full bg-foreground/30 hover:bg-foreground/50 transition-colors"
              style={{ width: `${widthPercent}%` }}
              title={`${scene.type} (${scene.duration}s)`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>0:00</span>
        <span>{Math.floor(totalDuration / 60)}:{String(Math.round(totalDuration) % 60).padStart(2, "0")}</span>
      </div>

      {/* Render / Download */}
      {!videoDownloadUrl ? (
        <button
          onClick={onRenderVideo}
          disabled={isRendering}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:opacity-80 disabled:opacity-40"
        >
          {isRendering ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Rendering{renderProgress !== null ? ` ${Math.round(renderProgress * 100)}%` : "..."}
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Export MP4
            </>
          )}
        </button>
      ) : (
        <a
          href={videoDownloadUrl}
          download
          className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:opacity-80"
        >
          <Download className="h-3.5 w-3.5" />
          Download MP4
        </a>
      )}
    </div>
  );
}
