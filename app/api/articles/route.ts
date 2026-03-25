import { NextRequest } from "next/server";
import { fetchLiveArticles, fetchFullArticle } from "@/lib/rss";

// GET /api/articles - Fetch live articles from RSS feeds
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const feeds = searchParams.get("feeds")?.split(",");
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    const articles = await fetchLiveArticles(feeds || undefined, limit);

    return Response.json({ articles, source: "live", count: articles.length });
  } catch (error) {
    console.error("Articles fetch error:", error);
    return Response.json(
      { error: "Failed to fetch articles", articles: [], source: "error" },
      { status: 500 }
    );
  }
}

// POST /api/articles/full - Fetch full article body for a specific article
export async function POST(req: NextRequest) {
  try {
    const article = await req.json();

    if (!article.source_url) {
      return Response.json(
        { error: "Missing source_url" },
        { status: 400 }
      );
    }

    const fullArticle = await fetchFullArticle(article);

    return Response.json(fullArticle);
  } catch (error) {
    console.error("Article fetch error:", error);
    return Response.json(
      { error: "Failed to fetch article body" },
      { status: 500 }
    );
  }
}
