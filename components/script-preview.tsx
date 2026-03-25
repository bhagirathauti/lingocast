"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Type,
  BarChart3,
  MessageSquareQuote,
  Mic,
  Flag,
  Clock,
  Layers,
} from "lucide-react";
import type { Scene } from "@/lib/supabase";

const sceneIcons: Record<string, React.ReactNode> = {
  title: <Type className="h-3.5 w-3.5" />,
  data: <BarChart3 className="h-3.5 w-3.5" />,
  narration: <Mic className="h-3.5 w-3.5" />,
  quote: <MessageSquareQuote className="h-3.5 w-3.5" />,
  outro: <Flag className="h-3.5 w-3.5" />,
};

const sceneStyles: Record<string, { badge: string; border: string; bg: string }> = {
  title: {
    badge: "bg-blue-100 text-blue-700",
    border: "border-l-blue-400",
    bg: "from-blue-50/50",
  },
  data: {
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-l-emerald-400",
    bg: "from-emerald-50/50",
  },
  narration: {
    badge: "bg-violet-100 text-violet-700",
    border: "border-l-violet-400",
    bg: "from-violet-50/50",
  },
  quote: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-l-amber-400",
    bg: "from-amber-50/50",
  },
  outro: {
    badge: "bg-rose-100 text-rose-700",
    border: "border-l-rose-400",
    bg: "from-rose-50/50",
  },
};

const defaultStyle = {
  badge: "bg-gray-100 text-gray-700",
  border: "border-l-gray-300",
  bg: "from-gray-50/50",
};

interface ScriptPreviewProps {
  title: string;
  scenes: Scene[];
  language: string;
  totalDuration: number;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
}

export function ScriptPreview({
  title,
  scenes,
  language,
  totalDuration,
  onGenerateVideo,
  isGeneratingVideo,
}: ScriptPreviewProps) {
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header card */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-white to-muted/20 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold leading-tight text-foreground">{title}</h2>
            <div className="mt-2.5 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {totalDuration}s
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                {scenes.length} scenes
              </span>
              <Badge variant="secondary" className="text-xs font-semibold rounded-md">
                {language.toUpperCase()}
              </Badge>
            </div>
          </div>
          <button
            onClick={onGenerateVideo}
            disabled={isGeneratingVideo}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all glow-blue hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {isGeneratingVideo ? "Generating..." : "Preview Video"}
          </button>
        </div>

        {/* Mini timeline bar */}
        <div className="mt-4 flex gap-0.5 rounded-full overflow-hidden h-1.5 bg-muted/50">
          {scenes.map((scene, i) => {
            const widthPercent = (scene.duration / totalDuration) * 100;
            const typeColors: Record<string, string> = {
              title: "bg-blue-400",
              data: "bg-emerald-400",
              narration: "bg-violet-400",
              quote: "bg-amber-400",
              outro: "bg-rose-400",
            };
            return (
              <div
                key={i}
                className={`h-full ${typeColors[scene.type] || "bg-gray-300"} first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${widthPercent}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Scene list */}
      <div className="relative space-y-3">
        {/* Vertical timeline connector */}
        <div className="absolute left-[22px] top-6 bottom-6 w-px bg-gradient-to-b from-blue-200 via-violet-200 to-rose-200 hidden sm:block" />

        {scenes.map((scene, index) => {
          const style = sceneStyles[scene.type] || defaultStyle;
          return (
            <div
              key={index}
              className="animate-slide-up flex gap-3"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Scene number circle */}
              <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-white text-xs font-bold text-muted-foreground shadow-sm hidden sm:flex">
                {index + 1}
              </div>

              {/* Scene card */}
              <div
                className={`flex-1 rounded-xl border border-border/40 bg-gradient-to-r ${style.bg} to-white overflow-hidden border-l-4 ${style.border} shadow-sm transition-all hover:shadow-md`}
              >
                <div className="p-4">
                  {/* Scene header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                    >
                      {sceneIcons[scene.type]}
                      <span className="capitalize">{scene.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/60 font-medium">
                      {scene.duration}s
                    </span>
                  </div>

                  {/* On-screen text */}
                  <p className="text-sm font-semibold leading-snug text-foreground/90">{scene.text}</p>

                  {/* Narration */}
                  <div className="mt-3 rounded-lg bg-muted/30 border border-border/30 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">
                      Narration
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/80">{scene.narration}</p>
                  </div>

                  {/* English subtitle */}
                  {scene.subtitle && (
                    <div className="mt-3 rounded-lg bg-blue-50/50 border border-blue-200/30 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-blue-600/60 font-semibold mb-1">
                        English Subtitle
                      </p>
                      <p className="text-sm leading-relaxed text-blue-900/70">{scene.subtitle}</p>
                    </div>
                  )}

                  {/* Data visualization hint */}
                  {scene.data && (
                    <div className="mt-3 rounded-lg bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/40 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-semibold mb-1.5">
                        Data Visual
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-emerald-700">
                          {scene.data.value}
                        </span>
                        {scene.data.change && (
                          <span
                            className={`text-sm font-semibold px-1.5 py-0.5 rounded ${
                              scene.data.change.startsWith("+")
                                ? "text-green-700 bg-green-100/60"
                                : "text-red-700 bg-red-100/60"
                            }`}
                          >
                            {scene.data.change}
                          </span>
                        )}
                        <span className="text-sm text-emerald-600/80 font-medium">
                          {scene.data.label}
                        </span>
                      </div>
                      {scene.data.items && scene.data.items.length > 0 && (
                        <div className="mt-2 flex gap-4">
                          {scene.data.items.map((item, i) => (
                            <div key={i} className="text-xs">
                              <span className="text-emerald-600/70">{item.name}:</span>{" "}
                              <span className="font-semibold text-emerald-800">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
