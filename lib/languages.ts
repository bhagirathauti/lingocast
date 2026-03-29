export interface Language {
  code: string;
  name: string;
  nativeName: string;
  ttsLang: string; // BCP-47 tag for SpeechSynthesis
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", ttsLang: "en-IN" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", ttsLang: "hi-IN" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", ttsLang: "bn-IN" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", ttsLang: "gu-IN" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", ttsLang: "kn-IN" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", ttsLang: "ml-IN" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", ttsLang: "mr-IN" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", ttsLang: "ta-IN" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", ttsLang: "te-IN" },
  { code: "ur", name: "Urdu", nativeName: "اردو", ttsLang: "ur-IN" },
];

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
