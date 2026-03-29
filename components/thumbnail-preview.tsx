"use client";

import { useState } from "react";
import { Download, Image, Loader2, RefreshCw } from "lucide-react";

interface ThumbnailPreviewProps {
  title: string;
  scenes: { text: string; type: string; narration: string; duration: number; visual?: string; subtitle?: string; data?: unknown }[];
  language: string;
  totalDuration: number;
}

export function ThumbnailPreview({ title, scenes, language, totalDuration }: ThumbnailPreviewProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState("");

  async function generateThumbnail() {
    setIsLoading(true);
    setError("");
    setImageLoaded(false);
    setRenderProgress(null);
    setThumbnailUrl(null);

    try {
      const res = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: { title, scenes, language, totalDuration },
        }),
      });

      if (!res.ok) throw new Error("Request failed");

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
            if (data.status === "rendering" && data.progress !== undefined) {
              setRenderProgress(data.progress);
            } else if (data.status === "complete" && data.imageUrl) {
              setThumbnailUrl(data.imageUrl);
            } else if (data.status === "error") {
              throw new Error(data.error || "Failed");
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate thumbnail");
    } finally {
      setIsLoading(false);
      setRenderProgress(null);
    }
  }

  function handleDownload() {
    if (!thumbnailUrl) return;
    const a = document.createElement("a");
    a.href = thumbnailUrl;
    a.download = `thumbnail-${Date.now()}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (!thumbnailUrl && !isLoading && !error) {
    return (
      <button
        onClick={generateThumbnail}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
      >
        <Image className="h-3.5 w-3.5" />
        Generate Animated Thumbnail
      </button>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>
        <button onClick={generateThumbnail} className="text-xs text-muted-foreground hover:text-foreground underline">Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border px-4 py-6 text-xs text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>
          {renderProgress !== null
            ? `Rendering thumbnail ${Math.round(renderProgress * 100)}%`
            : "Preparing..."}
        </span>
        {renderProgress !== null && (
          <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground/50 transition-all duration-300"
              style={{ width: `${Math.round(renderProgress * 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Animated Thumbnail</span>
        <button
          onClick={generateThumbnail}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Regenerate"
        >
          <RefreshCw className="h-3 w-3" />
          Regenerate
        </button>
      </div>

      {/* Animated thumbnail */}
      <div className="relative overflow-hidden rounded-md bg-black mx-auto" style={{ maxWidth: 200 }}>
        <div style={{ aspectRatio: "9/16" }}>
          {thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt="Animated thumbnail"
              className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setError("Thumbnail failed to load. Try regenerating.");
                setThumbnailUrl(null);
              }}
            />
          )}
        </div>
      </div>

      {/* Download button */}
      {imageLoaded && (
        <button
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-accent"
        >
          <Download className="h-3 w-3" />
          Download GIF
        </button>
      )}
    </div>
  );
}
