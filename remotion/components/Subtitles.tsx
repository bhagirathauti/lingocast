import React from "react";
import {
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from "remotion";

interface SubtitlesProps {
  text: string;
  durationInFrames: number;
}

/**
 * Progressive subtitle display — splits text into short phrases
 * and shows them sequentially, synced to the scene duration.
 * Each phrase fades in/out like broadcast captions.
 */
export const Subtitles: React.FC<SubtitlesProps> = ({
  text,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!text || !text.trim()) return null;

  // Split subtitle into short phrases (~6-8 words each)
  const phrases = splitIntoPhrases(text);
  if (phrases.length === 0) return null;

  // Reserve frames for entry delay and exit
  const entryDelay = 8;
  const exitBuffer = 6;
  const activeFrames = durationInFrames - entryDelay - exitBuffer;

  // Distribute time across phrases proportionally by word count
  const totalWords = phrases.reduce((sum, p) => sum + p.split(" ").length, 0);
  const phraseTimings: Array<{ start: number; end: number; text: string }> = [];
  let currentStart = entryDelay;

  for (const phrase of phrases) {
    const wordCount = phrase.split(" ").length;
    const phraseDuration = Math.max(
      Math.round((wordCount / totalWords) * activeFrames),
      fps * 0.8 // minimum ~0.8 seconds per phrase
    );
    phraseTimings.push({
      start: currentStart,
      end: currentStart + phraseDuration,
      text: phrase,
    });
    currentStart += phraseDuration;
  }

  // Find the active phrase for the current frame
  const activeTiming = phraseTimings.find(
    (p) => frame >= p.start && frame < p.end
  );

  if (!activeTiming) return null;

  const fadeFrames = 5;

  // Fade in at phrase start
  const fadeIn = interpolate(
    frame,
    [activeTiming.start, activeTiming.start + fadeFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade out at phrase end
  const fadeOut = interpolate(
    frame,
    [activeTiming.end - fadeFrames, activeTiming.end],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Slight slide-up on entry
  const slideY = interpolate(
    frame,
    [activeTiming.start, activeTiming.start + fadeFrames],
    [8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Wrap long phrases into max 2 lines
  const lines = wrapText(activeTiming.text, 42);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 30,
        right: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `translateY(${slideY}px)`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          borderRadius: 10,
          padding: "10px 24px",
          maxWidth: "95%",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 500,
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.4,
              textAlign: "center",
              letterSpacing: 0.2,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Split text into natural phrases of ~6-8 words.
 * Breaks at sentence boundaries first, then at commas/semicolons,
 * then at word boundaries if segments are still too long.
 */
function splitIntoPhrases(text: string): string[] {
  // First split by sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const phrases: string[] = [];

  for (const sentence of sentences) {
    const words = sentence.split(" ");

    if (words.length <= 8) {
      // Short sentence — use as single phrase
      phrases.push(sentence);
    } else {
      // Try splitting at commas, semicolons, dashes, "and", "but", "which", "that"
      const subParts = sentence
        .split(/(?<=[,;:–—])\s+|(?:\s+(?:and|but|which|that|while|as|so|because)\s+)/i)
        .map((s) => s.trim())
        .filter(Boolean);

      if (subParts.length > 1 && subParts.every((p) => p.split(" ").length <= 10)) {
        phrases.push(...subParts);
      } else {
        // Fall back to splitting every ~7 words
        for (let i = 0; i < words.length; i += 7) {
          const chunk = words.slice(i, i + 7).join(" ");
          if (chunk.trim()) phrases.push(chunk.trim());
        }
      }
    }
  }

  return phrases;
}

/**
 * Wrap a single phrase into lines of max `maxChars` characters.
 */
function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current.length > 0) {
      lines.push(current.trim());
      current = word;
    } else {
      current += (current ? " " : "") + word;
    }
  }
  if (current.trim()) lines.push(current.trim());

  // Max 2 lines per phrase display
  return lines.slice(0, 2);
}
