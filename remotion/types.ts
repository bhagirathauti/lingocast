import type { Scene } from "@/lib/supabase";

export type { Scene, DataPoint } from "@/lib/supabase";

export interface NewsVideoProps {
  title: string;
  scenes: Scene[];
  language: string;
  totalDuration: number;
  audioUrls?: string[];
}

export interface SceneComponentProps {
  scene: Scene;
  durationInFrames: number;
  sceneIndex: number;
  totalScenes: number;
  language: string;
}
