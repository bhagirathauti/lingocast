# LingoCast

Transform news articles into broadcast-quality short videos in multiple Indian languages. LingoCast uses AI to generate scripts, text-to-speech for narration, and Remotion for programmatic video rendering — all from a single web interface.

## Features

- **Multilingual Video Generation** — Supports English, Hindi, Tamil, Telugu, and Bengali
- **AI Script Generation** — Converts news articles into 60–90 second video scripts using Groq (LLaMA 3.3 70B) or Google Gemini
- **Text-to-Speech** — Natural-sounding narration via Microsoft Edge TTS voices
- **Programmatic Video Rendering** — Remotion-powered videos with animated charts (bar, pie, radar, 3D bar), data visualizations, quote cards, and custom illustrations
- **RSS Feed Integration** — Pulls articles from Economic Times (top stories, economy, markets, industry, tech)
- **English Subtitles** — Auto-generated English subtitles for all non-English videos
- **Script Editor** — Edit AI-generated scripts before rendering
- **Batch Processing** — Generate videos in multiple languages simultaneously

## Tech Stack

- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **AI:** Groq SDK (LLaMA 3.3 70B) / Google Generative AI (Gemini 2.0 Flash)
- **TTS:** Microsoft Edge TTS (`msedge-tts`)
- **Video:** Remotion 4
- **Database:** Supabase
- **Animations:** Framer Motion + Lottie

## Prerequisites

- Node.js 18+
- npm or pnpm
- A [Groq](https://console.groq.com/) API key (free tier available)
- *(Optional)* A [Google Gemini](https://aistudio.google.com/apikey) API key
- *(Optional)* A [Supabase](https://supabase.com/) project for article storage

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/bhagirathauti/lingocast.git
cd lingocast
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Required
GROQ_API_KEY=your_groq_api_key

# Optional — Supabase (for article storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — Gemini (alternative AI provider)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. *(Optional)* Remotion Studio

To preview and debug video compositions:

```bash
npm run remotion:studio
```

## Usage

1. **Select an article** from the feed or paste custom text
2. **Choose target languages** (one or more)
3. **Generate** — AI creates a video script for each language
4. **Edit** the script if needed using the built-in editor
5. **Render** — Remotion produces the final video with narration, animations, and subtitles
6. **Download** the rendered video

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate-script/   # AI script generation endpoint
│   │   ├── generate-all/      # Batch generation (script + TTS + render)
│   │   ├── tts/               # Text-to-speech endpoint
│   │   ├── render-video/      # Remotion video rendering endpoint
│   │   └── articles/          # Article fetching via RSS
│   ├── layout.tsx
│   └── page.tsx
├── components/                # UI components (studio, editor, preview, etc.)
├── lib/                       # Utilities (AI clients, RSS, TTS voices, prompts)
├── remotion/
│   ├── compositions/          # Video composition (NewsVideo)
│   ├── scenes/                # Scene types (Title, Narration, Data, Quote, Outro)
│   ├── components/            # Charts, illustrations, visuals, subtitles
│   └── index.ts               # Remotion entry point
└── data/                      # Local article data (JSON)
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run remotion:studio` | Open Remotion Studio |
| `npm run remotion:render` | Render a video from CLI |

## License

MIT
