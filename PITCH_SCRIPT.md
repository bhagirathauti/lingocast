# LingoCast — 3-Minute Pitch Video Script

> **Total duration:** 3 minutes
> **Format:** Screen recording with voiceover (you talking + demo on screen)
> **Tool suggestion:** Use OBS Studio (free) or built-in Windows screen recorder (Win+G). Record your screen with your mic.

---

## SECTION 1: The Problem (0:00 – 0:40)

**[Screen: Show any Indian news website — e.g., Economic Times homepage]**

> "India has over 900 million internet users — but here's the problem: most news video content is only produced in English or Hindi.
>
> There are 500 million Hindi speakers, 80 million Tamil speakers, 80 million Telugu speakers, 100 million Bengali speakers — all consuming news on their phones, mostly through short-form video on Instagram, YouTube Shorts, and WhatsApp.
>
> But creating a single 60-second news video manually takes 2 to 3 hours — a writer, a translator, a voice artist, and a video editor. Multiply that by 10 languages, and you're looking at over 25 hours of work for one article.
>
> Regional newsrooms simply can't keep up."

---

## SECTION 2: The Solution — LingoCast (0:40 – 1:10)

**[Screen: Switch to LingoCast app in browser — show the landing/studio page]**

> "That's why I built LingoCast — an AI-powered platform that transforms any news article into a broadcast-quality video in 10 Indian languages — Hindi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Marathi, Urdu, and English — in under 20 minutes, with just one person.
>
> It works in four steps — you pick an article, choose your languages, the AI generates a script and narration, and Remotion renders the final video with animations, charts, and subtitles.
>
> The entire pipeline runs on free-tier tools — Groq's LLaMA for script generation, Microsoft Edge TTS for voiceover, and Remotion for video rendering. Zero cost to operate."

---

## SECTION 3: Live Demo (1:10 – 2:20)

> **This is the most important section. Walk through the app step by step.**

### Step 1 — Select an article (~15 sec)
**[Screen: Click on "Live Feed" tab, show articles loading from ET RSS]**

> "Here I'm pulling live articles from Economic Times via RSS. Let me pick this one."

**[Click on an article card]**

> "The app fetches the full article body automatically."

### Step 2 — Choose languages (~10 sec)
**[Screen: Click "Next", show language selector]**

> "I'll select Hindi, Tamil, and Marathi — three of the ten supported languages, one click."

**[Select the languages, click Generate]**

### Step 3 — AI script generation + TTS (~20 sec)
**[Screen: Show the progress stream — "Generating script...", "Generating audio scene 1...", etc.]**

> "Now the AI agent is generating a structured video script in each language — breaking the article into scenes like title, narration, data visualization, and quotes. Then it generates natural-sounding voiceover for each scene using Edge TTS.
>
> You can see the real-time progress streaming in."

### Step 4 — Review the script (~10 sec)
**[Screen: Expand one language result, show the script scenes]**

> "Here's the generated script — I can see each scene, the narration text, the visual type. And I can edit any of this before rendering if I want to."

**[Optionally click "Edit" to briefly show the script editor, then close it]**

### Step 5 — Render the video (~15 sec)
**[Screen: Click "Render Video" on one of the languages]**

> "Now I hit render — Remotion takes the script and audio, and produces a portrait-format video with animated charts, custom illustrations, and English subtitles."

**[Show the rendering progress: bundling → rendering → complete]**

> "And there it is — a ready-to-download video reel."

### Step 6 — Play the result (~10 sec)
**[Screen: Play the rendered video in the built-in player]**

> "Professional quality — animated graphics, voiceover, subtitles — all generated automatically from a text article."

---

## SECTION 4: Architecture & Impact (2:20 – 2:50)

**[Screen: Show the architecture diagram from ARCHITECTURE.md — you can open it in a markdown previewer or take a screenshot]**

> "Under the hood, LingoCast runs four specialized agents — an Article Agent that fetches content, a Script Agent powered by LLaMA 3.3, a TTS Agent using Edge neural voices, and a Render Agent using Remotion.
>
> They communicate through NDJSON streaming, so you see real-time progress at every step."

**[Screen: Briefly flash the Impact Model numbers — or show a slide with key stats]**

> "The impact: what used to take 12 hours and 4 people now takes 20 minutes and 1 person. That's a 97% reduction in time and cost. And because the entire stack runs on free-tier APIs, the operational cost is essentially zero."

---

## SECTION 5: Closing (2:50 – 3:00)

**[Screen: Back to the app, or show the GitHub repo page]**

> "LingoCast makes vernacular news video production accessible to any newsroom — big or small. The code is open source, the stack is free, and it's ready to scale.
>
> Thank you."

---

## Recording Tips

1. **Screen resolution:** Set your browser to ~1280x720 or 1920x1080 so the app UI is clearly readable
2. **Close unnecessary tabs and notifications** before recording
3. **Pre-load the app** and have an article already visible so you don't waste time on loading screens
4. **Practice the demo section once** before recording — the Generate + Render steps take real time, so know where the natural pauses are
5. **If rendering takes too long on camera:** You can cut/speed-up the waiting parts in editing, or pre-render one video and show the result while narrating
6. **Audio:** Use earbuds with a mic or any external mic — avoid laptop mic if possible
7. **Speed:** Speak at a natural pace. 3 minutes is enough if you don't rush.

## Free Recording Tools

- **OBS Studio** — Best free screen recorder (obs-project.com)
- **Windows Game Bar** — Press `Win + G`, click Record (built-in, zero setup)
- **ScreenPal** — Browser-based, free tier available
- For editing/trimming: **CapCut** (free) or **Clipchamp** (built into Windows 11)
