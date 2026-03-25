"use client";

import { useState, useCallback } from "react";
import type { Scene } from "@/lib/supabase";
import {
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Clock,
  Type,
  BarChart3,
  Mic,
  MessageSquareQuote,
  Flag,
  RotateCcw,
} from "lucide-react";

interface ScriptEditorProps {
  scenes: Scene[];
  onSave: (scenes: Scene[]) => void;
  onCancel: () => void;
  language: string;
}

const SCENE_TYPES: Scene["type"][] = ["title", "narration", "data", "quote", "outro"];

const sceneTypeIcons: Record<string, React.ReactNode> = {
  title: <Type className="h-3 w-3" />,
  data: <BarChart3 className="h-3 w-3" />,
  narration: <Mic className="h-3 w-3" />,
  quote: <MessageSquareQuote className="h-3 w-3" />,
  outro: <Flag className="h-3 w-3" />,
};

const sceneTypeColors: Record<string, string> = {
  title: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  data: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  narration: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  quote: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  outro: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export function ScriptEditor({ scenes: initialScenes, onSave, onCancel, language }: ScriptEditorProps) {
  const [scenes, setScenes] = useState<Scene[]>(() =>
    initialScenes.map((s) => ({ ...s, data: s.data ? { ...s.data, items: s.data.items ? [...s.data.items] : undefined } : undefined }))
  );
  const [expandedScene, setExpandedScene] = useState<number | null>(0);
  const [hasChanges, setHasChanges] = useState(false);

  const updateScene = useCallback((index: number, updates: Partial<Scene>) => {
    setScenes((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
    setHasChanges(true);
  }, []);

  const updateSceneText = useCallback((index: number, field: "text" | "narration" | "subtitle", value: string) => {
    updateScene(index, { [field]: value });
  }, [updateScene]);

  const updateSceneDuration = useCallback((index: number, duration: number) => {
    updateScene(index, { duration: Math.max(2, Math.min(30, duration)) });
  }, [updateScene]);

  const updateSceneType = useCallback((index: number, type: Scene["type"]) => {
    updateScene(index, { type });
  }, [updateScene]);

  const addScene = useCallback((afterIndex: number) => {
    const newScene: Scene = {
      type: "narration",
      text: "New scene text",
      narration: "New narration text",
      duration: 6,
    };
    setScenes((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, newScene);
      return next;
    });
    setExpandedScene(afterIndex + 1);
    setHasChanges(true);
  }, []);

  const removeScene = useCallback((index: number) => {
    if (scenes.length <= 1) return;
    setScenes((prev) => prev.filter((_, i) => i !== index));
    setExpandedScene(null);
    setHasChanges(true);
  }, [scenes.length]);

  const moveScene = useCallback((index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;
    setScenes((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
    setExpandedScene(newIndex);
    setHasChanges(true);
  }, [scenes.length]);

  const resetScenes = useCallback(() => {
    setScenes(initialScenes.map((s) => ({ ...s, data: s.data ? { ...s.data } : undefined })));
    setHasChanges(false);
  }, [initialScenes]);

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Edit Script</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <Clock className="h-3 w-3" />
          {totalDuration}s &middot; {scenes.length} scenes
        </div>
      </div>

      {/* Scene list */}
      <div className="space-y-1.5">
        {scenes.map((scene, index) => {
          const isExpanded = expandedScene === index;
          const typeColor = sceneTypeColors[scene.type] || sceneTypeColors.narration;

          return (
            <div
              key={index}
              className={`rounded-lg border transition-all ${isExpanded ? "border-border bg-accent/30" : "border-border/50 hover:border-border"}`}
            >
              {/* Scene header - always visible */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                onClick={() => setExpandedScene(isExpanded ? null : index)}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />

                <span className="text-[10px] font-mono text-muted-foreground/50 w-4 shrink-0">{index + 1}</span>

                <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold border ${typeColor} shrink-0`}>
                  {sceneTypeIcons[scene.type]}
                  <span className="capitalize">{scene.type}</span>
                </span>

                <span className="text-xs text-foreground/80 truncate flex-1">{scene.text}</span>

                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{scene.duration}s</span>

                {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />}
              </div>

              {/* Expanded editor */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-border/50">
                  {/* Type + Duration row */}
                  <div className="flex items-center gap-3 pt-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Type</label>
                      <div className="flex flex-wrap gap-1">
                        {SCENE_TYPES.map((type) => (
                          <button
                            key={type}
                            onClick={() => updateSceneType(index, type)}
                            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all ${
                              scene.type === type
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:text-foreground border border-border/50"
                            }`}
                          >
                            {sceneTypeIcons[type]}
                            <span className="capitalize">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Duration</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={2}
                          max={30}
                          value={scene.duration}
                          onChange={(e) => updateSceneDuration(index, Number(e.target.value))}
                          className="w-12 border border-border rounded px-1.5 py-1 text-xs font-mono bg-background text-foreground focus:outline-none focus:border-foreground/50"
                        />
                        <span className="text-[10px] text-muted-foreground">sec</span>
                      </div>
                    </div>
                  </div>

                  {/* Display text */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">
                      Display Text
                    </label>
                    <textarea
                      value={scene.text}
                      onChange={(e) => updateSceneText(index, "text", e.target.value)}
                      rows={2}
                      className="w-full border border-border rounded-md px-3 py-2 text-xs bg-background text-foreground resize-none focus:outline-none focus:border-foreground/50 leading-relaxed"
                    />
                  </div>

                  {/* Narration text */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">
                      Narration (TTS)
                    </label>
                    <textarea
                      value={scene.narration}
                      onChange={(e) => updateSceneText(index, "narration", e.target.value)}
                      rows={3}
                      className="w-full border border-border rounded-md px-3 py-2 text-xs bg-background text-foreground resize-none focus:outline-none focus:border-foreground/50 leading-relaxed"
                    />
                  </div>

                  {/* Subtitle text (only for non-English) */}
                  {language !== "en" && (
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">
                        English Subtitle
                      </label>
                      <textarea
                        value={scene.subtitle || ""}
                        onChange={(e) => updateSceneText(index, "subtitle", e.target.value)}
                        rows={2}
                        placeholder="English subtitle for this scene..."
                        className="w-full border border-border rounded-md px-3 py-2 text-xs bg-background text-foreground resize-none focus:outline-none focus:border-foreground/50 leading-relaxed placeholder:text-muted-foreground/40"
                      />
                    </div>
                  )}

                  {/* Scene actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveScene(index, "up")}
                        disabled={index === 0}
                        className="flex h-7 w-7 items-center justify-center rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 transition-all"
                        title="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveScene(index, "down")}
                        disabled={index === scenes.length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 transition-all"
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => addScene(index)}
                        className="flex h-7 items-center gap-1 rounded border border-border/50 px-2 text-[10px] text-muted-foreground hover:text-foreground hover:border-border transition-all"
                        title="Add scene after"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                    <button
                      onClick={() => removeScene(index)}
                      disabled={scenes.length <= 1}
                      className="flex h-7 items-center gap-1 rounded border border-destructive/20 px-2 text-[10px] text-destructive/70 hover:text-destructive hover:border-destructive/40 disabled:opacity-30 transition-all"
                      title="Delete scene"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => onSave(scenes)}
          disabled={!hasChanges}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background transition-all hover:opacity-80 disabled:opacity-30"
        >
          <Save className="h-3.5 w-3.5" />
          Save &amp; Regenerate Audio
        </button>
        <button
          onClick={resetScenes}
          disabled={!hasChanges}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          title="Reset changes"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-all"
          title="Cancel editing"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
