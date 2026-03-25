"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/article-card";
import { VideoPreview } from "@/components/video-preview";
import { TOPICS } from "@/lib/topics";
import { LANGUAGES, getLanguageByCode } from "@/lib/languages";
import type { Article, Scene } from "@/lib/supabase";
import { ScriptEditor } from "@/components/script-editor";
import {
  FileText,
  Sparkles,
  Video,
  Clipboard,
  Download,
  Loader2,
  Rss,
  RefreshCw,
  Check,
  Play,
  ChevronDown,
  ChevronUp,
  Circle,
  Pencil,
} from "lucide-react";

interface StudioPageProps {
  articles: Article[];
}

interface GeneratedScript {
  title: string;
  scenes: Scene[];
  language: string;
  totalDuration: number;
}

interface LanguageResult {
  language: string;
  languageName: string;
  status: "pending" | "script" | "audio" | "done" | "error";
  progress: number;
  message: string;
  script?: GeneratedScript;
  audioUrls?: string[];
  isRendering?: boolean;
  renderProgress?: number;
  videoUrl?: string;
  error?: string;
}

export function StudioPage({ articles }: StudioPageProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [customText, setCustomText] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["hi"]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [inputMode, setInputMode] = useState<"live" | "feed" | "paste">("live");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [languageResults, setLanguageResults] = useState<Record<string, LanguageResult>>({});
  const [expandedLang, setExpandedLang] = useState<string | null>(null);
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [liveArticles, setLiveArticles] = useState<Article[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isFetchingBody, setIsFetchingBody] = useState(false);

  useEffect(() => { fetchLiveArticles(); }, []);

  async function fetchLiveArticles() {
    setIsLoadingLive(true);
    try {
      const res = await fetch("/api/articles?limit=10");
      if (res.ok) { const data = await res.json(); setLiveArticles(data.articles || []); }
    } catch { /* silent */ } finally { setIsLoadingLive(false); }
  }

  async function handleSelectArticle(article: Article) {
    setSelectedArticle(article);
    if (!article.body || article.body.length < 200) {
      setIsFetchingBody(true);
      try {
        const res = await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(article) });
        if (res.ok) { const full = await res.json(); setSelectedArticle(full); setLiveArticles((p) => p.map((a) => a.id === full.id ? full : a)); }
      } catch { /* use what we have */ } finally { setIsFetchingBody(false); }
    }
  }

  const currentArticles = inputMode === "live" ? liveArticles : articles;
  const filteredArticles = useMemo(() => categoryFilter === "all" ? currentArticles : currentArticles.filter((a) => a.category === categoryFilter), [currentArticles, categoryFilter]);
  const canGenerate = selectedLanguages.length > 0 && (inputMode === "paste" ? customText.trim().length > 50 : selectedArticle !== null && !isFetchingBody);

  function toggleLanguage(code: string) {
    setSelectedLanguages((prev) => prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]);
  }

  const handleGenerateAll = useCallback(async () => {
    setIsProcessing(true); setError(""); setLanguageResults({}); setExpandedLang(null);
    const title = inputMode === "paste" ? customTitle || "Custom Article" : selectedArticle!.title;
    const body = inputMode === "paste" ? customText : selectedArticle!.body;
    const initial: Record<string, LanguageResult> = {};
    for (const lang of selectedLanguages) { const info = getLanguageByCode(lang); initial[lang] = { language: lang, languageName: info?.nativeName || lang, status: "pending", progress: 0, message: "Queued" }; }
    setLanguageResults(initial);
    try {
      const res = await fetch("/api/generate-all", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, body, languages: selectedLanguages }) });
      if (!res.ok) throw new Error("Failed");
      const reader = res.body?.getReader(); if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder(); let buffer = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) { if (!line.trim()) continue; try { const data = JSON.parse(line);
          if (data.language) { setLanguageResults((prev) => { const cur = prev[data.language] || initial[data.language]; const u = { ...cur };
            if (data.status === "generating_script") { u.status = "script"; u.message = "Writing script..."; u.progress = 0.15; }
            else if (data.status === "script_ready") { u.script = data.script; u.progress = 0.3; u.message = "Script ready"; }
            else if (data.status === "generating_audio") { u.status = "audio"; u.progress = 0.3 + (data.progress || 0) * 0.7; u.message = `Audio ${Math.round((data.progress || 0) * 100)}%`; }
            else if (data.status === "language_complete") { u.status = "done"; u.progress = 1; u.script = data.script; u.audioUrls = data.audioUrls; u.message = "Ready"; setExpandedLang((p) => p || data.language); }
            else if (data.status === "language_error") { u.status = "error"; u.error = data.error; u.message = "Failed"; }
            return { ...prev, [data.language]: u }; }); }
          if (data.status === "error" && !data.language) setError(data.error || "Failed");
        } catch (e) { if (e instanceof SyntaxError) continue; throw e; } }
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); } finally { setIsProcessing(false); }
  }, [selectedLanguages, inputMode, customTitle, customText, selectedArticle]);

  const handleRenderMP4 = useCallback(async (lang: string) => {
    const result = languageResults[lang]; if (!result?.script || !result.audioUrls) return;
    setLanguageResults((p) => ({ ...p, [lang]: { ...p[lang], isRendering: true, renderProgress: 0 } }));
    try {
      const res = await fetch("/api/render-video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: result.script, audioUrls: result.audioUrls }) });
      if (!res.ok) throw new Error("Render failed"); const reader = res.body?.getReader(); if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder(); let buffer = "";
      while (true) { const { done, value } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) { if (!line.trim()) continue; try { const data = JSON.parse(line);
          if (data.status === "rendering") setLanguageResults((p) => ({ ...p, [lang]: { ...p[lang], renderProgress: data.progress } }));
          else if (data.status === "complete") setLanguageResults((p) => ({ ...p, [lang]: { ...p[lang], isRendering: false, renderProgress: undefined, videoUrl: data.videoUrl } }));
          else if (data.status === "error") throw new Error(data.error);
        } catch (e) { if (e instanceof SyntaxError) continue; throw e; } }
      }
    } catch (err) { setLanguageResults((p) => ({ ...p, [lang]: { ...p[lang], isRendering: false, renderProgress: undefined, error: err instanceof Error ? err.message : "Failed" } })); }
  }, [languageResults]);

  const handleSaveEditedScript = useCallback(async (lang: string, editedScenes: import("@/lib/supabase").Scene[]) => {
    const result = languageResults[lang];
    if (!result?.script) return;

    const updatedScript = {
      ...result.script,
      scenes: editedScenes,
      totalDuration: editedScenes.reduce((sum, s) => sum + s.duration, 0),
    };

    // Update script immediately in state
    setLanguageResults((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], script: updatedScript, status: "audio" as const, progress: 0.3, message: "Regenerating audio...", audioUrls: undefined, videoUrl: undefined },
    }));
    setEditingLang(null);

    // Regenerate audio for edited scenes
    try {
      const res = await fetch("/api/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updatedScript.title, body: "__EDITED_SCRIPT__", languages: [lang], editedScript: updatedScript }),
      });
      if (!res.ok) throw new Error("Failed to regenerate audio");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.language === lang) {
              setLanguageResults((prev) => {
                const cur = prev[lang];
                const u = { ...cur };
                if (data.status === "generating_audio") {
                  u.status = "audio";
                  u.progress = 0.3 + (data.progress || 0) * 0.7;
                  u.message = `Audio ${Math.round((data.progress || 0) * 100)}%`;
                }
                if (data.status === "language_complete") {
                  u.status = "done";
                  u.progress = 1;
                  u.script = updatedScript;
                  u.audioUrls = data.audioUrls;
                  u.message = "Ready (edited)";
                }
                if (data.status === "language_error") {
                  u.status = "error";
                  u.error = data.error;
                  u.message = "Failed";
                }
                return { ...prev, [lang]: u };
              });
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      setLanguageResults((prev) => ({
        ...prev,
        [lang]: { ...prev[lang], status: "done" as const, progress: 1, script: updatedScript, message: "Script saved (audio failed)", error: err instanceof Error ? err.message : "Audio regeneration failed" },
      }));
    }
  }, [languageResults]);

  const hasResults = Object.keys(languageResults).length > 0;
  const completedCount = Object.values(languageResults).filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">Select an article, pick languages, generate videos with AI narration.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* MAIN AREA: articles + generation */}
        <div className="space-y-6">
          {/* Source tabs */}
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "live" | "feed" | "paste")}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-transparent p-0 gap-0 border-b border-border rounded-none h-auto">
                <TabsTrigger value="live" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground">
                  <Rss className="h-3.5 w-3.5 mr-1.5" />Live
                </TabsTrigger>
                <TabsTrigger value="feed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />Feed
                </TabsTrigger>
                <TabsTrigger value="paste" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground">
                  <Clipboard className="h-3.5 w-3.5 mr-1.5" />Paste
                </TabsTrigger>
              </TabsList>
              {inputMode === "live" && (
                <button onClick={fetchLiveArticles} disabled={isLoadingLive} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                  <RefreshCw className={`h-3 w-3 ${isLoadingLive ? "animate-spin" : ""}`} /> Refresh
                </button>
              )}
            </div>

            <TabsContent value="live" className="mt-0">
              {isFetchingBody && (
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading article...
                </div>
              )}
              {isLoadingLive ? (
                <div className="space-y-0">{[1,2,3,4].map((i) => <div key={i} className="h-20 animate-pulse border-b border-border bg-muted/30" />)}</div>
              ) : (
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div>{liveArticles.map((a) => <ArticleCard key={a.id} article={a} onSelect={handleSelectArticle} selected={selectedArticle?.id === a.id} />)}
                  {liveArticles.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No articles. Click Refresh.</p>}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="feed" className="mt-0">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button onClick={() => setCategoryFilter("all")} className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${categoryFilter === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>All</button>
                {TOPICS.map((t) => <button key={t.id} onClick={() => setCategoryFilter(t.id)} className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${categoryFilter === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>{t.name}</button>)}
              </div>
              <ScrollArea className="h-[calc(100vh-420px)]">
                <div>{filteredArticles.map((a) => <ArticleCard key={a.id} article={a} onSelect={handleSelectArticle} selected={selectedArticle?.id === a.id} />)}</div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="paste" className="mt-0 space-y-3">
              <input type="text" placeholder="Title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="w-full border-b border-border bg-transparent px-0 py-2 text-sm font-medium placeholder:text-muted-foreground focus:outline-none" />
              <Textarea placeholder="Paste article text (min 50 chars)..." value={customText} onChange={(e) => setCustomText(e.target.value)} className="h-[calc(100vh-480px)] resize-none border-0 bg-transparent px-0 text-sm focus-visible:ring-0" />
              <p className="text-[11px] font-mono text-muted-foreground">{customText.length} chars{customText.length > 0 && customText.length < 50 && <span className="text-destructive"> (min 50)</span>}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT SIDEBAR: languages + generate + results */}
        <div className="space-y-6">
          {/* Languages */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Languages</h2>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((l) => {
                const sel = selectedLanguages.includes(l.code);
                return (
                  <button key={l.code} onClick={() => toggleLanguage(l.code)} disabled={isProcessing}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${sel ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"} disabled:opacity-50`}>
                    {l.nativeName}
                    {sel && <Check className="inline ml-1.5 h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerateAll} disabled={!canGenerate || isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background transition-all hover:opacity-80 disabled:opacity-30 active:scale-[0.98]">
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Play className="h-4 w-4" />Generate {selectedLanguages.length} Video{selectedLanguages.length > 1 ? "s" : ""}</>}
          </button>

          {/* Error */}
          {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">{error}</div>}

          {/* Results */}
          {hasResults && (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Output</h2>
                {completedCount > 0 && <span className="text-[10px] font-mono text-muted-foreground">{completedCount}/{Object.keys(languageResults).length}</span>}
              </div>

              {Object.values(languageResults).map((r) => {
                const isExp = expandedLang === r.language;
                return (
                  <div key={r.language} className={`border-b border-border transition-colors ${isExp ? "bg-accent/50" : ""}`}>
                    <div className="flex items-center gap-3 py-3 px-1 cursor-pointer" onClick={() => setExpandedLang(isExp ? null : r.language)}>
                      {/* Status dot */}
                      <div className="shrink-0">
                        {r.status === "done" ? <Check className="h-4 w-4 text-foreground" /> :
                         r.status === "error" ? <span className="text-destructive text-xs font-bold">!</span> :
                         r.status === "pending" ? <Circle className="h-3 w-3 text-muted-foreground/30" /> :
                         <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{r.languageName}</span>
                        <span className="text-[10px] font-mono text-muted-foreground ml-2">{r.message}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.status !== "done" && r.status !== "error" && r.status !== "pending" && (
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-foreground/50 transition-all duration-500" style={{ width: `${Math.round(r.progress * 100)}%` }} />
                          </div>
                        )}
                        {r.status === "done" && (isExp ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />)}
                      </div>
                    </div>

                    {isExp && r.status === "done" && r.script && (
                      <div className="pb-4 px-1">
                        {editingLang === r.language ? (
                          <ScriptEditor
                            scenes={r.script.scenes}
                            language={r.script.language}
                            onSave={(editedScenes) => handleSaveEditedScript(r.language, editedScenes)}
                            onCancel={() => setEditingLang(null)}
                          />
                        ) : (
                          <>
                            <div className="flex justify-end mb-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingLang(r.language); }}
                                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit Script
                              </button>
                            </div>
                            <VideoPreview
                              title={r.script.title} scenes={r.script.scenes} language={r.script.language}
                              totalDuration={r.script.totalDuration} audioUrls={r.audioUrls}
                              onRenderVideo={() => handleRenderMP4(r.language)} isRendering={r.isRendering || false}
                              renderProgress={r.renderProgress ?? null} videoDownloadUrl={r.videoUrl || null} />
                          </>
                        )}
                      </div>
                    )}

                    {r.status === "error" && r.error && <div className="pb-3 px-1 text-xs text-destructive">{r.error}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!hasResults && !isProcessing && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Video className="h-8 w-8 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">Select an article and generate</p>
              <div className="mt-4 flex gap-4 text-[10px] font-mono text-muted-foreground/40">
                <span>5 langs</span>
                <span>AI voice</span>
                <span>MP4</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
