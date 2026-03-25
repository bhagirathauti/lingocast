// Edge TTS voice mapping for Indian languages
export const TTS_VOICES: Record<string, string> = {
  en: "en-IN-NeerjaNeural",
  hi: "hi-IN-SwaraNeural",
  ta: "ta-IN-PallaviNeural",
  te: "te-IN-ShrutiNeural",
  bn: "bn-IN-TanishaaNeural",
};

export function getVoiceForLanguage(languageCode: string): string {
  return TTS_VOICES[languageCode] || TTS_VOICES.en;
}
