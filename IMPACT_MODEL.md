# LingoCast — Impact Model

## Problem Statement

Indian newsrooms need to produce short-form video content in multiple regional languages to reach the 900M+ internet users across India. Today, producing a single 60-second news video requires:

| Step | Manual Effort | Personnel |
|---|---|---|
| Script writing & translation | 30-45 min | Journalist + Translator |
| Voice-over recording | 20-30 min | Voice artist |
| Video editing & graphics | 60-90 min | Video editor |
| Review & export | 15-20 min | Producer |
| **Total per video** | **~2-3 hours** | **3-4 people** |

To cover one article in 5 languages = **10-15 hours of combined effort**.

---

## LingoCast Solution

LingoCast automates the entire pipeline: article in, video out.

| Step | LingoCast Time | Personnel |
|---|---|---|
| Article selection | 1 min | 1 editor |
| AI script generation (5 languages) | ~30 sec | Automated |
| Script review & optional edits | 2-5 min | 1 editor |
| TTS narration (5 languages) | ~45 sec | Automated |
| Video rendering (per language) | ~2-3 min | Automated |
| **Total for 5 languages** | **~15-20 min** | **1 person** |

---

## Quantified Impact

### 1. Time Saved

| Metric | Manual | LingoCast | Savings |
|---|---|---|---|
| Time per article (1 language) | 2.5 hours | 5 min | **97% reduction** |
| Time per article (5 languages) | 12.5 hours | 20 min | **97% reduction** |
| Daily output (8-hour workday, 1 team) | 3 videos | 24 videos per language | **8x throughput** |

**Assumption:** Manual estimates based on industry benchmarks for short-form news video production at regional Indian newsrooms. LingoCast times measured from end-to-end pipeline testing.

### 2. Cost Reduced

**Manual production cost (per video):**
| Role | Hourly Rate (INR) | Hours | Cost |
|---|---|---|---|
| Journalist/Writer | 500 | 0.75 | 375 |
| Translator (per language) | 400 | 0.5 | 200 |
| Voice Artist | 600 | 0.5 | 300 |
| Video Editor | 500 | 1.5 | 750 |
| **Total (1 language)** | | | **1,625 INR (~$19)** |
| **Total (5 languages)** | | | **~6,500 INR (~$78)** |

**LingoCast production cost (per video in 5 languages):**
| Resource | Cost |
|---|---|
| Groq API (LLaMA 3.3 70B, free tier) | $0 |
| Microsoft Edge TTS | $0 (free) |
| Remotion rendering (self-hosted) | $0 |
| Compute (cloud server, ~5 min) | ~$0.02 |
| Editor review time (20 min @ 500/hr) | ~167 INR (~$2) |
| **Total (5 languages)** | **~$2** |

**Cost savings per article: ~$76 (97% reduction)**

**Assumption:** Groq free tier provides 14,400 requests/day. Edge TTS is free and unlimited. Compute cost assumes a mid-tier cloud instance at ~$0.25/hr.

### 3. Revenue Opportunity

**For a mid-size digital newsroom producing 20 articles/day:**

| Metric | Without LingoCast | With LingoCast |
|---|---|---|
| Videos produced/day | 5-10 (1-2 languages) | 100 (20 articles x 5 languages) |
| Languages covered | 1-2 | 5 |
| New audience reach | Base | +300-400% (regional language users) |
| Estimated ad revenue per 1K views | $1.50 | $1.50 |
| Additional monthly views (est.) | — | 500K-1M (regional content) |
| **Additional monthly revenue** | — | **$750 - $1,500** |

**Assumption:** Regional language content on YouTube/Instagram in India averages 1.5x higher engagement than English-only. Vernacular short-form content is severely undersupplied relative to demand — India has 500M+ Hindi internet users but a fraction of the English video content volume.

### 4. Scale Projections

| Scale | Monthly Videos | Monthly Cost Saved | Time Saved |
|---|---|---|---|
| 1 newsroom (20 articles/day) | 3,000 | $228,000 INR (~$2,700) | 625 hours |
| 10 newsrooms | 30,000 | $27,000 | 6,250 hours |
| 100 newsrooms (platform model) | 300,000 | $270,000 | 62,500 hours |

---

## Non-Monetary Impact

| Impact Area | Description |
|---|---|
| **Language inclusivity** | Makes news accessible to 500M+ Indians who prefer regional languages over English |
| **Speed to publish** | Breaking news can be converted to video in minutes instead of hours, enabling near real-time vernacular video coverage |
| **Democratized production** | Small and regional newsrooms with no video team can now produce professional video content |
| **Consistency** | AI-generated scripts maintain consistent quality, tone, and structure across languages |
| **Creator empowerment** | Editors remain in the loop — they review, edit, and approve scripts before rendering |

---

## Assumptions & Limitations

1. **Free-tier sustainability** — Groq free tier has daily limits (14,400 req/day); production scale would require paid API access (~$0.001 per 1K tokens for LLaMA 3.3)
2. **Rendering bottleneck** — Server-side Remotion rendering takes 2-3 min per video; horizontal scaling or cloud rendering (e.g., Remotion Lambda) would be needed at scale
3. **TTS quality** — Microsoft Edge TTS is high quality but limited to available voices; premium TTS services could improve naturalness
4. **Human review required** — AI scripts need editorial review for factual accuracy; this is a feature (human-in-the-loop), not a bug
5. **Internet dependency** — Requires stable internet for API calls; offline mode not supported

---

## Summary

| Metric | Value |
|---|---|
| Time saved per video (5 languages) | **12+ hours -> 20 minutes** |
| Cost saved per video | **97% ($76 per article)** |
| Throughput increase | **8x per editor** |
| Languages supported | **5 (expandable)** |
| API cost to run | **~$0 (free-tier stack)** |
