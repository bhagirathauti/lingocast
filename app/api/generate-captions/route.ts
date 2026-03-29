import { NextRequest } from "next/server";
import { generateJSON } from "@/lib/groq";

interface CaptionRequest {
  title: string;
  scenes: { text: string; narration: string; type: string }[];
  language: string;
  languageName: string;
}

interface GeneratedCaptions {
  instagram: { caption: string; hashtags: string[] };
  youtube: { title: string; description: string; hashtags: string[] };
  x: { tweet: string; hashtags: string[] };
}

export async function POST(req: NextRequest) {
  try {
    const { title, scenes, language, languageName }: CaptionRequest =
      await req.json();

    if (!title || !scenes?.length) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const narrationSummary = scenes
      .map((s) => s.narration)
      .filter(Boolean)
      .join(" ")
      .slice(0, 1500);

    const prompt = `Generate social media captions for a news video in ${languageName || "English"} (language code: ${language || "en"}).

Video title: "${title}"
Video content summary: "${narrationSummary}"

Generate optimized captions for 3 platforms. The captions and hashtags should be in ${languageName || "English"} language where appropriate, but hashtags can mix English for reach.

Return JSON with this exact structure:
{
  "instagram": {
    "caption": "Engaging Instagram caption with line breaks, emojis, and a call-to-action. Max 2200 chars. Include a hook in the first line.",
    "hashtags": ["hashtag1", "hashtag2", "...up to 15 relevant hashtags without # symbol"]
  },
  "youtube": {
    "title": "SEO-optimized YouTube Shorts title under 70 chars",
    "description": "YouTube description with key points, 2-3 sentences",
    "hashtags": ["hashtag1", "hashtag2", "...up to 8 hashtags without # symbol"]
  },
  "x": {
    "tweet": "Concise tweet under 250 chars (leave room for hashtags). Punchy and engaging.",
    "hashtags": ["hashtag1", "hashtag2", "...up to 5 hashtags without # symbol"]
  }
}`;

    const captions = await generateJSON<GeneratedCaptions>(prompt);

    return Response.json(captions);
  } catch (error) {
    console.error("Caption generation error:", error);
    return Response.json(
      { error: "Failed to generate captions" },
      { status: 500 }
    );
  }
}
