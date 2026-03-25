-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  source_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT REFERENCES articles(id),
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  scenes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_date ON articles(date DESC);
CREATE INDEX idx_video_scripts_article ON video_scripts(article_id, language);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read" ON video_scripts FOR SELECT USING (true);
CREATE POLICY "Public insert" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON video_scripts FOR INSERT WITH CHECK (true);
