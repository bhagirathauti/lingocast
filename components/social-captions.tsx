"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles, Hash, Camera, Play, AtSign } from "lucide-react";

interface CaptionData {
  instagram: { caption: string; hashtags: string[] };
  youtube: { title: string; description: string; hashtags: string[] };
  x: { tweet: string; hashtags: string[] };
}

interface SocialCaptionsProps {
  title: string;
  scenes: { text: string; narration: string; type: string }[];
  language: string;
  languageName: string;
}

type Platform = "instagram" | "youtube" | "x";

export function SocialCaptions({ title, scenes, language, languageName }: SocialCaptionsProps) {
  const [captions, setCaptions] = useState<CaptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePlatform, setActivePlatform] = useState<Platform>("instagram");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function generateCaptions() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, scenes, language, languageName }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCaptions(data);
    } catch {
      setError("Failed to generate captions");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function formatHashtags(tags: string[]) {
    return tags.map((t) => `#${t.replace(/^#/, "")}`).join(" ");
  }

  function getFullCaption(platform: Platform): string {
    if (!captions) return "";
    if (platform === "instagram") {
      return `${captions.instagram.caption}\n\n${formatHashtags(captions.instagram.hashtags)}`;
    }
    if (platform === "youtube") {
      return `${captions.youtube.description}\n\n${formatHashtags(captions.youtube.hashtags)}`;
    }
    return `${captions.x.tweet}\n\n${formatHashtags(captions.x.hashtags)}`;
  }

  const platforms: { key: Platform; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "instagram", label: "Instagram", icon: <Camera className="h-3.5 w-3.5" />, color: "from-purple-500 to-pink-500" },
    { key: "youtube", label: "YouTube", icon: <Play className="h-3.5 w-3.5" />, color: "from-red-600 to-red-500" },
    { key: "x", label: "X", icon: <AtSign className="h-3.5 w-3.5" />, color: "from-zinc-700 to-zinc-600" },
  ];

  if (!captions && !isLoading) {
    return (
      <button
        onClick={generateCaptions}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate Social Captions
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Generating captions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>
        <button onClick={generateCaptions} className="text-xs text-muted-foreground hover:text-foreground underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Social Captions</span>
        <button
          onClick={() => copyToClipboard(getFullCaption(activePlatform), "full")}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {copiedField === "full" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copiedField === "full" ? "Copied!" : "Copy All"}
        </button>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-1 rounded-md bg-muted/50 p-0.5">
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePlatform(p.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-medium transition-all ${
              activePlatform === p.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>

      {/* Caption content */}
      {captions && (
        <div className="space-y-2">
          {activePlatform === "instagram" && (
            <>
              <CaptionBlock
                label="Caption"
                text={captions.instagram.caption}
                field="ig-caption"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <HashtagBlock
                tags={captions.instagram.hashtags}
                field="ig-tags"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                formatHashtags={formatHashtags}
              />
            </>
          )}
          {activePlatform === "youtube" && (
            <>
              <CaptionBlock
                label="Title"
                text={captions.youtube.title}
                field="yt-title"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <CaptionBlock
                label="Description"
                text={captions.youtube.description}
                field="yt-desc"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
              <HashtagBlock
                tags={captions.youtube.hashtags}
                field="yt-tags"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                formatHashtags={formatHashtags}
              />
            </>
          )}
          {activePlatform === "x" && (
            <>
              <CaptionBlock
                label="Tweet"
                text={captions.x.tweet}
                field="x-tweet"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                charLimit={280}
              />
              <HashtagBlock
                tags={captions.x.hashtags}
                field="x-tags"
                copiedField={copiedField}
                onCopy={copyToClipboard}
                formatHashtags={formatHashtags}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CaptionBlock({
  label,
  text,
  field,
  copiedField,
  onCopy,
  charLimit,
}: {
  label: string;
  text: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  charLimit?: number;
}) {
  return (
    <div className="group relative rounded-md bg-muted/30 p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          {charLimit && (
            <span className={`text-[10px] font-mono ${text.length > charLimit ? "text-destructive" : "text-muted-foreground/50"}`}>
              {text.length}/{charLimit}
            </span>
          )}
          <button
            onClick={() => onCopy(text, field)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedField === field ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line">{text}</p>
    </div>
  );
}

function HashtagBlock({
  tags,
  field,
  copiedField,
  onCopy,
  formatHashtags,
}: {
  tags: string[];
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  formatHashtags: (tags: string[]) => string;
}) {
  return (
    <div className="group relative rounded-md bg-muted/30 p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Hash className="h-2.5 w-2.5" />
          Hashtags ({tags.length})
        </span>
        <button
          onClick={() => onCopy(formatHashtags(tags), field)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copiedField === field ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground/60"
          >
            #{tag.replace(/^#/, "")}
          </span>
        ))}
      </div>
    </div>
  );
}
