export interface Topic {
  id: string;
  name: string;
  color: string;
}

export const TOPICS: Topic[] = [
  { id: "rbi", name: "RBI & Monetary Policy", color: "#2563eb" },
  { id: "budget", name: "Budget & Policy", color: "#059669" },
  { id: "ev", name: "EV & Green Energy", color: "#d97706" },
  { id: "startup", name: "Startup & Funding", color: "#7c3aed" },
  { id: "ai", name: "AI & Tech", color: "#e11d48" },
  { id: "markets", name: "Markets", color: "#0891b2" },
  { id: "economy", name: "Economy", color: "#4f46e5" },
  { id: "industry", name: "Industry", color: "#b45309" },
  { id: "companies", name: "Companies", color: "#0d9488" },
  { id: "policy", name: "Policy", color: "#7e22ce" },
];

export function getTopicColor(categoryId: string): string {
  return TOPICS.find((t) => t.id === categoryId)?.color || "#6b7280";
}

export function getTopicName(categoryId: string): string {
  return TOPICS.find((t) => t.id === categoryId)?.name || categoryId;
}
