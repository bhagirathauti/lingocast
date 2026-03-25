import { NextRequest } from "next/server";
import { generateJSON } from "@/lib/groq";
import { buildScriptPrompt } from "@/lib/script-prompt";
import type { Scene } from "@/lib/supabase";

interface ScriptRequest {
  title: string;
  body: string;
  language: string;
  languageName: string;
}

interface GeneratedScript {
  title: string;
  scenes: Scene[];
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, language, languageName }: ScriptRequest =
      await req.json();

    if (!title || !body || !language) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = buildScriptPrompt(title, body, language, languageName);
    const script = await generateJSON<GeneratedScript>(prompt);

    if (!script.title || !Array.isArray(script.scenes) || script.scenes.length === 0) {
      throw new Error("Invalid script structure from AI");
    }

    const validChartTypes = ["bar", "bar3d", "pie", "radar", "number"];
    const validatedScenes: Scene[] = script.scenes.map((scene) => ({
      type: scene.type || "narration",
      text: scene.text || "",
      narration: scene.narration || "",
      data: scene.data
        ? {
            ...scene.data,
            chartType: validChartTypes.includes(scene.data.chartType || "")
              ? scene.data.chartType
              : "number",
          }
        : undefined,
      duration: scene.duration || 12,
    }));

    return Response.json({
      title: script.title,
      scenes: validatedScenes,
      language,
      totalDuration: validatedScenes.reduce((sum, s) => sum + s.duration, 0),
    });
  } catch (error) {
    console.error("Script generation error:", error);
    return Response.json(
      { error: "Failed to generate script. Please try again." },
      { status: 500 }
    );
  }
}
