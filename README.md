# LingoCast

AI-powered platform that transforms news articles into broadcast-quality short videos in **10 Indian languages** — from a single web interface, in under 35 minutes, at zero cost.

> Built for the **ET GenAI Hackathon 2026**

---

## What It Does

1. **Pick** a news article from live RSS feeds (Economic Times, Livemint) or paste your own
2. **Choose** target languages — Hindi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Marathi, Urdu, English
3. **Generate** — AI creates a structured video script for each language with scene-by-scene narration
4. **Edit** (optional) — review and modify the script in a built-in editor before rendering
5. **Render** — Remotion produces a portrait-format video (1080x1920) with animated charts, illustrations, voiceover, and English subtitles
6. **Download** the final MP4 video

The entire pipeline — script generation, TTS narration, and video rendering — runs on **free-tier APIs** with zero operational cost.

---

## Demo

https://github.com/user-attachments/assets/demo-placeholder

---

## Features

- **10 Indian Languages** — English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Tamil, Telugu, Urdu
- **AI Script Generation** — Converts articles into 60-90 second video scripts using Groq (LLaMA 3.3 70B) with Google Gemini as fallback
- **Text-to-Speech** — Natural narration via Microsoft Edge TTS neural voices (free, no API key)
- **Programmatic Video Rendering** — Remotion-powered videos with animated bar charts, pie charts, radar charts, 3D bar charts, and 13 custom animated illustrations
- **Live RSS Feeds** — Pulls articles from Economic Times (6 categories) and Livemint (2 categories)
- **English Subtitles** — Auto-generated for all non-English videos
- **Script Editor** — Edit AI-generated scripts scene by scene before rendering
- **Real-Time Progress** — NDJSON streaming shows live status for script generation, audio synthesis, and video rendering
- **Social-Ready** — Portrait format (1080x1920) optimized for Instagram Reels, YouTube Shorts, WhatsApp Status

---

## Architecture

LingoCast runs a **4-agent sequential pipeline**, each agent being an independent API endpoint:

```
Article Agent ──> Script Agent ──> TTS Agent ──> Render Agent
/api/articles     /api/generate    /api/tts      /api/render-video
                  -script
```

| Agent | Role | External Service |
|-------|------|-----------------|
| **Article Agent** | Fetches news from RSS feeds, scrapes full article body | Economic Times & Livemint RSS |
| **Script Agent** | Converts article to structured JSON video script | Groq (LLaMA 3.3 70B) / Google Gemini |
| **TTS Agent** | Generates narration audio for each scene | Microsoft Edge TTS (free) |
| **Render Agent** | Composes final video with animations, charts, subtitles | Remotion 4 + FFmpeg |

Agents communicate via **NDJSON streaming** over HTTP, providing real-time progress to the frontend.

> Full architecture document: [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| AI / LLM | Groq SDK (LLaMA 3.3 70B) / Google Generative AI (Gemini 2.0 Flash) |
| TTS | Microsoft Edge TTS (`msedge-tts`) — free, no API key |
| Video | Remotion 4 (programmatic rendering) |
| Charts | Recharts |
| Animations | Framer Motion + Lottie |
| Database | Supabase (optional, for article storage) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Groq API key](https://console.groq.com/) (free tier)
- *(Optional)* [Google Gemini API key](https://aistudio.google.com/apikey)
- *(Optional)* [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/bhagirathauti/lingocast.git
cd lingocast
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` in the project root:

```env
# Required
GROQ_API_KEY=your_groq_api_key

# Optional — Google Gemini (fallback LLM)
GEMINI_API_KEY=your_gemini_api_key

# Optional — Supabase (article storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Remotion Studio

Preview and debug video compositions:

```bash
npm run remotion:studio
```

---

## Project Structure

```
├── app/
│   ├── page.tsx                    # Entry point — loads articles, mounts Studio
│   ├── layout.tsx                  # Root layout, fonts, metadata
│   └── api/
│       ├── articles/               # RSS feed fetching + article body scraping
│       ├── generate-script/        # AI script generation (single language)
│       ├── generate-all/           # Batch pipeline: script + TTS for all languages
│       ├── tts/                    # Text-to-speech (Edge TTS)
│       ├── render-video/           # Remotion video rendering
│       ├── generate-captions/      # Social media caption generation
│       └── generate-thumbnail/     # Thumbnail generation
│
├── components/
│   ├── studio-page.tsx             # Main UI — workflow controller
│   ├── script-editor.tsx           # Scene-by-scene script editor
│   ├── video-preview.tsx           # Remotion Player wrapper
│   ├── script-preview.tsx          # Live video with audio + subtitles
│   ├── article-card.tsx            # Article list display
│   ├── language-selector.tsx       # Multi-language picker
│   ├── social-captions.tsx         # Social media captions
│   ├── thumbnail-preview.tsx       # Video thumbnail preview
│   └── ui/                         # shadcn/ui components
│
├── lib/
│   ├── groq.ts                     # Groq SDK client + generateJSON helper
│   ├── script-prompt.ts            # LLM prompt template for video scripts
│   ├── languages.ts                # 10 supported languages
│   ├── tts-voices.ts               # Language → Edge TTS voice mapping
│   ├── rss.ts                      # RSS parsing + article scraping
│   ├── articles.ts                 # Local article loader
│   └── supabase.ts                 # Supabase client + TypeScript types
│
├── remotion/
│   ├── index.ts                    # Remotion entry point
│   ├── types.ts                    # Video prop interfaces
│   ├── constants.ts                # FPS, resolution, colors
│   ├── compositions/
│   │   └── NewsVideo.tsx           # Main composition — sequences scenes + audio
│   ├── scenes/
│   │   ├── TitleScene.tsx          # Opening hook with animated text
│   │   ├── NarrationScene.tsx      # Narration with visual illustration
│   │   ├── DataScene.tsx           # Data visualization + chart
│   │   ├── QuoteScene.tsx          # Quote card with decoration
│   │   └── OutroScene.tsx          # Closing takeaway
│   ├── components/
│   │   ├── BarChart.tsx            # Animated bar chart
│   │   ├── PieChart.tsx            # Animated pie chart
│   │   ├── RadarChart.tsx          # Radar/spider chart
│   │   ├── BarChart3D.tsx          # 3D bar chart
│   │   ├── Subtitles.tsx           # English subtitle renderer
│   │   ├── AnimatedText.tsx        # Staggered character animation
│   │   ├── AnimatedNumber.tsx      # Number counter animation
│   │   ├── visuals/               # 13 animated illustrations (rupee, market, bank, etc.)
│   │   └── illustrations/         # Decorative animations (particles, globe, pulse, etc.)
│   └── hooks/
│       └── use-scene-timing.ts     # Frame/second conversion
│
├── data/
│   └── articles.json               # Seed articles for offline/demo use
│
├── ARCHITECTURE.md                 # Architecture document
├── IMPACT_MODEL.md                 # Impact model
└── PITCH_SCRIPT.md                 # 3-minute pitch video script
```

---

## Supported Languages

| Language | Native | TTS Voice |
|----------|--------|-----------|
| English | English | en-IN-NeerjaNeural |
| Hindi | हिंदी | hi-IN-SwaraNeural |
| Bengali | বাংলা | bn-IN-TanishaaNeural |
| Gujarati | ગુજરાતી | gu-IN-DhwaniNeural |
| Kannada | ಕನ್ನಡ | kn-IN-SapnaNeural |
| Malayalam | മലയാളം | ml-IN-SobhanaNeural |
| Marathi | मराठी | mr-IN-AarohiNeural |
| Tamil | தமிழ் | ta-IN-PallaviNeural |
| Telugu | తెలుగు | te-IN-ShrutiNeural |
| Urdu | اردو | ur-IN-GulNeural |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run remotion:studio` | Open Remotion Studio for video preview |
| `npm run remotion:render` | Render a video from CLI |

---

## Impact

| Metric | Value |
|--------|-------|
| Time saved per article (10 languages) | 25 hours → 35 minutes (**97% reduction**) |
| Cost saved per article | $304 → $3.65 (**97% reduction**) |
| Throughput increase | **8x** per editor |
| Languages supported | **10** |
| API cost to operate | **$0** (free-tier stack) |

> Full impact model: [`IMPACT_MODEL.md`](IMPACT_MODEL.md)

---

## License

MIT
