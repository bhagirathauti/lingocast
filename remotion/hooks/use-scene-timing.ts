import { FPS } from "../constants";

export function secondsToFrames(seconds: number): number {
  return Math.round(seconds * FPS);
}

export function framesToSeconds(frames: number): number {
  return frames / FPS;
}

export function getSceneFrameRanges(
  scenes: { duration: number }[]
): { start: number; end: number; durationInFrames: number }[] {
  let currentFrame = 0;
  return scenes.map((scene) => {
    const durationInFrames = secondsToFrames(scene.duration);
    const range = {
      start: currentFrame,
      end: currentFrame + durationInFrames,
      durationInFrames,
    };
    currentFrame += durationInFrames;
    return range;
  });
}

export function getTotalFrames(scenes: { duration: number }[]): number {
  return scenes.reduce((sum, s) => sum + secondsToFrames(s.duration), 0);
}
