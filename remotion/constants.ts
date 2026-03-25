export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920; // Portrait reels format

// Scene type color schemes
export const SCENE_COLORS = {
  title: {
    bg: ["#1e3a8a", "#312e81"] as const, // blue-900 to indigo-900
    accent: "#60a5fa", // blue-400
    text: "#ffffff",
  },
  data: {
    bg: ["#064e3b", "#1e3a5f"] as const, // emerald-900 to dark blue
    accent: "#34d399", // emerald-400
    text: "#ffffff",
  },
  narration: {
    bg: ["#1e1b4b", "#312e81"] as const, // indigo-950 to indigo-900
    accent: "#a78bfa", // violet-400
    text: "#ffffff",
  },
  quote: {
    bg: ["#1c1917", "#292524"] as const, // stone-900 to stone-800
    accent: "#fbbf24", // amber-400
    text: "#ffffff",
  },
  outro: {
    bg: ["#0c0a09", "#1c1917"] as const, // stone-950 to stone-900
    accent: "#fb7185", // rose-400
    text: "#ffffff",
  },
} as const;

// Timing constants
export const SCENE_TRANSITION_FRAMES = 8; // frames for crossfade between scenes
export const TEXT_ENTRY_DURATION = 20; // frames for text animation entry
export const DATA_ANIM_DURATION = 0.6; // fraction of scene duration for data animation
