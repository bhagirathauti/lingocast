// Edge TTS voice mapping for Indian languages
export const TTS_VOICES: Record<string, string> = {
  en: "en-IN-NeerjaNeural",
  hi: "hi-IN-SwaraNeural",
  bn: "bn-IN-TanishaaNeural",
  gu: "gu-IN-DhwaniNeural",
  kn: "kn-IN-SapnaNeural",
  ml: "ml-IN-SobhanaNeural",
  mr: "mr-IN-AarohiNeural",
  ta: "ta-IN-PallaviNeural",
  te: "te-IN-ShrutiNeural",
  ur: "ur-IN-GulNeural",
};

export function getVoiceForLanguage(languageCode: string): string {
  return TTS_VOICES[languageCode] || TTS_VOICES.en;
}
