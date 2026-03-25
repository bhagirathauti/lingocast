"use client";

import { LANGUAGES } from "@/lib/languages";
import { Check } from "lucide-react";

interface LanguageSelectorProps {
  selected: string;
  onChange: (code: string) => void;
}

const langFlags: Record<string, string> = {
  en: "EN",
  hi: "HI",
  ta: "TA",
  te: "TE",
  bn: "BN",
};

export function LanguageSelector({ selected, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {LANGUAGES.map((l) => {
        const isSelected = selected === l.code;
        return (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
              isSelected
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md glow-blue"
                : "bg-white border border-border/80 text-muted-foreground hover:border-blue-200 hover:text-foreground hover:bg-blue-50/50 shadow-sm"
            }`}
          >
            <span className={`text-[10px] font-bold rounded px-1 py-0.5 ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}>
              {langFlags[l.code]}
            </span>
            <span>{l.nativeName}</span>
            {isSelected && (
              <Check className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
