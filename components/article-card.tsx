"use client";

import { getTopicName } from "@/lib/topics";
import type { Article } from "@/lib/supabase";
import { ExternalLink } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  selected?: boolean;
}

export function ArticleCard({ article, onSelect, selected }: ArticleCardProps) {
  const source = article.tags?.[0] || "";
  const isLive = source === "Economic Times" || source === "Livemint";

  return (
    <div
      onClick={() => onSelect(article)}
      className={`group cursor-pointer border-b border-border py-3 px-1 transition-colors ${
        selected
          ? "bg-accent"
          : "hover:bg-accent/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">
              {getTopicName(article.category)}
            </span>
            {isLive && (
              <span className="text-[10px] text-muted-foreground">
                {source}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/50">{article.date}</span>
          </div>
          <h3 className={`text-[13px] font-medium leading-snug line-clamp-2 ${
            selected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
          }`}>
            {article.title}
          </h3>
          {article.body && article.body.length > 10 && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {article.body.slice(0, 100)}...
            </p>
          )}
        </div>
        {isLive && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
