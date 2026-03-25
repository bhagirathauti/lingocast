import type { Article } from "@/lib/supabase";

// RSS Feed sources
export const RSS_FEEDS = {
  et_top: {
    url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
    source: "Economic Times",
    category: "top",
  },
  et_economy: {
    url: "https://economictimes.indiatimes.com/news/economy/rssfeedstopstories.cms",
    source: "Economic Times",
    category: "economy",
  },
  et_markets: {
    url: "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
    source: "Economic Times",
    category: "markets",
  },
  et_industry: {
    url: "https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms",
    source: "Economic Times",
    category: "industry",
  },
  et_startups: {
    url: "https://economictimes.indiatimes.com/tech/startups/rssfeeds/78570550.cms",
    source: "Economic Times",
    category: "startups",
  },
  et_policy: {
    url: "https://economictimes.indiatimes.com/news/economy/policy/rssfeeds/1373380680.cms",
    source: "Economic Times",
    category: "policy",
  },
  livemint_companies: {
    url: "https://www.livemint.com/rss/companies",
    source: "Livemint",
    category: "companies",
  },
  livemint_markets: {
    url: "https://www.livemint.com/rss/markets",
    source: "Livemint",
    category: "markets",
  },
} as const;

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  guid?: string;
}

// Simple XML tag extractor (no external dependency needed)
function extractTag(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle regular content
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const description = extractTag(itemXml, "description");
    const guid = extractTag(itemXml, "guid");

    if (title && link) {
      items.push({ title, link, pubDate, description, guid });
    }
  }

  return items;
}

// Scrape article body from the article page using JSON-LD
async function scrapeArticleBody(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return "";

    const html = await res.text();

    // Try JSON-LD first (most reliable)
    const jsonLdBlocks = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    );
    if (jsonLdBlocks) {
      for (const block of jsonLdBlocks) {
        try {
          const jsonStr = block
            .replace(/<script[^>]*>/, "")
            .replace("</script>", "");
          const parsed = JSON.parse(jsonStr);
          if (parsed.articleBody) {
            return parsed.articleBody;
          }
        } catch {
          // Try next block
        }
      }
    }

    // Fallback: try meta description
    const metaMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]*?)"/i
    );
    if (metaMatch && metaMatch[1].length > 100) {
      return metaMatch[1];
    }

    return "";
  } catch {
    return "";
  }
}

// Map RSS categories to our topic system
function mapCategory(
  feedCategory: string,
  title: string
): string {
  const titleLower = title.toLowerCase();

  // Try to detect from title keywords
  if (titleLower.match(/rbi|repo rate|monetary policy|inflation|interest rate/))
    return "rbi";
  if (titleLower.match(/budget|fiscal|tax|gst|customs duty/))
    return "budget";
  if (titleLower.match(/ev|electric vehicle|tesla|battery|green energy|solar/))
    return "ev";
  if (titleLower.match(/startup|funding|unicorn|vc|venture|valuation|ipo/))
    return "startup";
  if (titleLower.match(/ai|artificial intelligence|chatgpt|machine learning|deepfake/))
    return "ai";

  // Fall back to feed category mapping
  const categoryMap: Record<string, string> = {
    economy: "rbi",
    policy: "budget",
    markets: "startup",
    industry: "ev",
    startups: "startup",
    companies: "startup",
    top: "ai",
  };
  return categoryMap[feedCategory] || "ai";
}

// Generate a stable ID from the article link
function generateArticleId(link: string): string {
  // Use the article show ID from URL if available
  const match = link.match(/articleshow\/(\d+)/);
  if (match) return `et-${match[1]}`;

  // Use last path segment
  const urlParts = link.split("/").filter(Boolean);
  const slug = urlParts[urlParts.length - 1]
    .replace(/\.html?|\.cms/g, "")
    .substring(0, 40);
  return `art-${slug}`;
}

// Fetch articles from a single RSS feed
async function fetchFeedArticles(
  feedKey: string,
  limit: number = 8
): Promise<Article[]> {
  const feed = RSS_FEEDS[feedKey as keyof typeof RSS_FEEDS];
  if (!feed) return [];

  try {
    const res = await fetch(feed.url, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = parseRSSItems(xml).slice(0, limit);

    const articles: Article[] = items.map((item) => ({
      id: generateArticleId(item.link),
      title: item.title.replace(/\s+/g, " ").trim(),
      body: item.description || "",
      date: item.pubDate
        ? new Date(item.pubDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      category: mapCategory(feed.category, item.title),
      source_url: item.link,
      tags: [feed.source, feed.category],
    }));

    return articles;
  } catch {
    return [];
  }
}

// Fetch a full article with body content
export async function fetchFullArticle(
  article: Article
): Promise<Article> {
  if (article.body && article.body.length > 200) return article;

  const body = await scrapeArticleBody(article.source_url);
  return {
    ...article,
    body: body || article.body || article.title,
  };
}

// Fetch articles from multiple feeds
export async function fetchLiveArticles(
  feedKeys?: string[],
  limit: number = 8
): Promise<Article[]> {
  const keys =
    feedKeys || Object.keys(RSS_FEEDS);

  const results = await Promise.all(
    keys.map((key) => fetchFeedArticles(key, limit))
  );

  // Flatten, dedupe by ID, sort by date
  const allArticles = results.flat();
  const seen = new Set<string>();
  const unique = allArticles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  // Sort by date descending
  unique.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return unique;
}
