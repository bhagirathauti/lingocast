import articlesData from "../data/articles.json";
import type { Article } from "./supabase";

const localArticles: Article[] = articlesData as Article[];

export function getAllArticles(): Article[] {
  return localArticles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getArticlesByCategory(category: string): Article[] {
  return localArticles
    .filter((a) => a.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleById(id: string): Article | undefined {
  return localArticles.find((a) => a.id === id);
}

export function getCategories(): string[] {
  return [...new Set(localArticles.map((a) => a.category))];
}

export function getArticleCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const article of localArticles) {
    counts[article.category] = (counts[article.category] || 0) + 1;
  }
  return counts;
}
