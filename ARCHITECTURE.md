# LingoCast — Architecture Document

## Overview

LingoCast is a multi-agent AI system that transforms text news articles into broadcast-quality short videos in 5 Indian languages (English, Hindi, Tamil, Telugu, Bengali). The system orchestrates four specialized agents in a sequential pipeline — each responsible for one stage of the transformation — coordinated by a central Studio Controller on the frontend.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                      (Studio Controller)                            │
│                                                                     │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────┐  │
│   │ Article Feed │  │ Language     │  │ Script    │  │ Video    │  │
│   │ Selector    │  │ Picker       │  │ Editor    │  │ Player   │  │
│   └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  └────┬─────┘  │
│          └────────────┬───┘                 │              │        │
│                       ▼                     ▼              ▼        │
│              ┌─────────────────────────────────────────────────┐    │
│              │        Pipeline Orchestrator (Frontend)         │    │
│              │   Manages step flow, streams NDJSON events,     │    │
│              │   handles retries and user edits                │    │
│              └──────────────────┬──────────────────────────────┘    │
└─────────────────────────────────┼──────────────────────────────────┘
                                  │ HTTP (NDJSON Streams)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND API LAYER (Next.js)                     │
│                                                                     │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐ │
│  │ 1. Article    │  │ 2. Script    │  │ 3. TTS   │  │ 4. Render │ │
│  │    Agent      │──▶│    Agent     │──▶│   Agent  │──▶│   Agent  │ │
│  │ /api/articles │  │ /api/generate│  │ /api/tts │  │/api/render│ │
│  │               │  │   -script    │  │          │  │  -video   │ │
│  └───────┬───────┘  └──────┬───────┘  └────┬─────┘  └─────┬─────┘ │
│          │                 │               │               │       │
└──────────┼─────────────────┼───────────────┼───────────────┼───────┘
           │                 │               │               │
           ▼                 ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐
│ RSS Feeds    │  │ Groq API     │  │ MS Edge TTS  │  │ Remotion  │
│ (ET, Mint)   │  │ (LLaMA 3.3) │  │ (Free, no    │  │ Renderer  │
│ + Web Scraper│  │ / Gemini 2.0 │  │  API key)    │  │ (Webpack) │
└──────────────┘  └──────────────┘  └──────────────┘  └───────────┘
```

---

## Agent Roles & Responsibilities

### Agent 1: Article Agent (`/api/articles`)
| | |
|---|---|
| **Role** | Fetches and prepares raw news content |
| **Input** | RSS feed URL or user-pasted text |
| **Output** | Structured article (title, body, source, category) |
| **Tools** | RSS parser, JSON-LD web scraper, local article database |
| **Error Handling** | Falls back to local article cache (`data/articles.json`) if RSS feeds are unreachable |

### Agent 2: Script Agent (`/api/generate-script`)
| | |
|---|---|
| **Role** | Converts article text into a structured, multilingual video script |
| **Input** | Article title + body + target language |
| **Output** | JSON script with 6-8 scenes (title, narration, data, quote, outro) |
| **Tools** | Groq SDK (LLaMA 3.3 70B) with engineered prompt; Google Gemini as fallback |
| **Error Handling** | Validates JSON structure, sanitizes chart types against allowed list, normalizes durations (2s-30s per scene), retries on malformed output |

**Script Structure Generated:**
```json
{
  "title": "...",
  "scenes": [
    {
      "type": "title | narration | data | quote | outro",
      "text": "Display text in target language",
      "narration": "Spoken text for TTS",
      "subtitle": "English translation (for non-English)",
      "duration": 8,
      "visual": "rupee | market | bank | growth | tech | ...",
      "chartType": "bar | pie | radar | bar3d",
      "chartData": [{ "label": "...", "value": 0 }]
    }
  ]
}
```

### Agent 3: TTS Agent (`/api/tts`)
| | |
|---|---|
| **Role** | Converts script narration text into natural-sounding audio |
| **Input** | Scene narration text + language code |
| **Output** | Base64 MP3 audio data URL + duration (seconds) |
| **Tools** | Microsoft Edge TTS with language-specific neural voices |
| **Error Handling** | Returns error with scene index for partial failure recovery; frontend can retry individual scenes |

**Voice Mapping:**
| Language | Voice |
|---|---|
| English | en-IN-NeerjaNeural |
| Hindi | hi-IN-SwaraNeural |
| Tamil | ta-IN-PallaviNeural |
| Telugu | te-IN-ShrutiNeural |
| Bengali | bn-IN-TanishaaNeural |

### Agent 4: Render Agent (`/api/render-video`)
| | |
|---|---|
| **Role** | Composes final video from script + audio assets |
| **Input** | Complete script JSON + audio data URLs per scene |
| **Output** | MP4 video (1080x1920, H.264) as base64 data URL |
| **Tools** | Remotion bundler + renderer, Webpack (cached), FFmpeg |
| **Error Handling** | Streams progress events (bundling -> preparing -> rendering -> encoding -> complete); cleans up temp files on success or failure; cached bundles reduce re-bundling errors |

**Video Specifications:**
| Property | Value |
|---|---|
| Resolution | 1080 x 1920 (portrait/reels) |
| FPS | 30 |
| Codec | H.264 |
| Duration | 60-90 seconds |
| Visual elements | Animated charts, custom illustrations, floating particles, subtitles |

---

## Agent Communication Protocol

All agents communicate via **NDJSON (Newline-Delimited JSON) streaming** over HTTP POST requests. This enables real-time progress updates to the user during long-running operations.

```
Frontend                    /api/generate-all                External Services
   │                              │                               │
   │──POST (article, langs)──────▶│                               │
   │                              │──── Script Agent ────────────▶│ Groq API
   │◀── {"status":"script_ready"} │◀── JSON script ──────────────│
   │                              │                               │
   │                              │──── TTS Agent (per scene) ──▶│ Edge TTS
   │◀── {"status":"audio",        │◀── base64 MP3 ──────────────│
   │      "scene": 0}             │                               │
   │◀── {"status":"audio",        │                               │
   │      "scene": 1}             │     ... repeat per scene ...  │
   │                              │                               │
   │◀── {"status":"lang_complete"}│                               │
   │                              │    ... repeat per language ... │
   │◀── {"status":"complete"}     │                               │
   │                              │                               │
   │──POST (script, audioUrls)──▶│ /api/render-video             │
   │◀── {"status":"bundling"}     │──── Remotion Render ─────────▶│ Webpack+FFmpeg
   │◀── {"status":"rendering",    │                               │
   │      "progress": 45}         │                               │
   │◀── {"status":"complete",     │◀── MP4 file ────────────────│
   │      "video": "data:..."}    │                               │
```

---

## Error Handling & Resilience

| Failure Point | Strategy |
|---|---|
| RSS feed unavailable | Falls back to local article cache (`data/articles.json`) |
| Groq API rate limit / error | Switches to Google Gemini as alternative LLM provider |
| LLM returns malformed JSON | Validates and sanitizes output; normalizes durations, filters invalid chart types |
| TTS fails for a scene | Returns partial result with error index; user can retry individual scenes |
| Remotion render crash | Temp files cleaned up automatically; cached webpack bundle avoids re-bundling on retry |
| Network timeout | NDJSON streaming detects broken connections; frontend shows last known state |
| User wants to fix script | Script Editor allows manual edits; re-generation skips LLM and only re-runs TTS + render |

---

## Tool Integrations

```
┌──────────────────────────────────────────────────────┐
│                   EXTERNAL TOOLS                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  AI / LLM                                            │
│  ├── Groq Cloud (LLaMA 3.3 70B) — primary           │
│  └── Google Gemini 2.0 Flash — fallback              │
│                                                      │
│  Text-to-Speech                                      │
│  └── Microsoft Edge TTS — free, no API key needed    │
│       5 Indian-language neural voices                │
│                                                      │
│  Video Rendering                                     │
│  └── Remotion 4 — programmatic React-based video     │
│       ├── Recharts (bar, pie, radar charts)          │
│       ├── Framer Motion (animations)                 │
│       └── FFmpeg (H.264 encoding)                    │
│                                                      │
│  Data Sources                                        │
│  ├── Economic Times RSS (6 categories)               │
│  ├── Livemint RSS (2 categories)                     │
│  └── Web scraper (JSON-LD article extraction)        │
│                                                      │
│  Infrastructure                                      │
│  ├── Next.js 16 (API routes + SSR)                   │
│  ├── Supabase (optional article storage)             │
│  └── Webpack (Remotion bundle caching)               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **Streaming over polling** — NDJSON streams give instant feedback during multi-minute operations (script gen + TTS + render), keeping the user engaged rather than staring at a spinner.

2. **Editable intermediate state** — Users can inspect and modify the AI-generated script before committing to the expensive render step, reducing wasted compute.

3. **Free-tier stack** — Groq free tier, Edge TTS (no key), Remotion (open-source) — the entire pipeline runs at zero cost for development and demo purposes.

4. **Portrait-first (1080x1920)** — Optimized for social media reels (Instagram, YouTube Shorts, WhatsApp Status) where news consumption is growing fastest in India.

5. **Modular agents** — Each pipeline stage is an independent API endpoint, allowing individual retry, caching, and future horizontal scaling.
