import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Article {
  id: string;
  title: string;
  body: string;
  date: string;
  category: string;
  source_url: string;
  tags: string[];
}

export interface VideoScript {
  id: string;
  article_id: string;
  language: string;
  title: string;
  scenes: Scene[];
  created_at?: string;
}

export interface Scene {
  type: "title" | "narration" | "data" | "quote" | "outro";
  text: string;
  narration: string;
  subtitle?: string;
  visual?: string;
  data?: DataPoint;
  duration: number;
}

export interface DataPoint {
  label: string;
  value: string;
  change?: string;
  chartType?: "bar" | "bar3d" | "pie" | "radar" | "number";
  items?: { name: string; value: number }[];
}
