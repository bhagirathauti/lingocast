import { NextRequest } from "next/server";
import { generateJSON } from "@/lib/groq";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { getVoiceForLanguage } from "@/lib/tts-voices";
import { getLanguageByCode } from "@/lib/languages";
import { buildScriptPrompt } from "@/lib/script-prompt";
import type { Scene } from "@/lib/supabase";

interface GeneratedScript {
  title: string;
  scenes: Scene[];
}

/**
 * Get MP3 duration in seconds from a buffer.
 * Uses CBR bitrate calculation: duration = (fileSize * 8) / bitrate.
 * We generate at 96kbps mono, so this is reliable.
 */
function getMp3DurationSeconds(buffer: Buffer): number {
  // 96kbps = 96000 bits per second
  const bitrate = 96000;
  const durationSec = (buffer.length * 8) / bitrate;
  // Add 0.5s padding so audio doesn't get clipped at the very end
  return Math.ceil(durationSec + 0.5);
}

async function generateTTSAudio(
  text: string,
  language: string
): Promise<{ audioUrl: string; durationSeconds: number }> {
  const voice = getVoiceForLanguage(language);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(text);
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    audioStream.on("end", () => resolve());
    audioStream.on("error", (err: Error) => reject(err));
  });

  const audioBuffer = Buffer.concat(chunks);
  const audioUrl = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;
  const durationSeconds = getMp3DurationSeconds(audioBuffer);

  return { audioUrl, durationSeconds };
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        const { title, body, languages, editedScript } = await req.json();

        if (!languages || !Array.isArray(languages) || languages.length === 0) {
          send({ status: "error", error: "Missing required fields" });
          controller.close();
          return;
        }

        // If editedScript is provided, skip script generation and only regenerate audio
        const isEditedMode = editedScript && body === "__EDITED_SCRIPT__";

        if (!isEditedMode && (!title || !body)) {
          send({ status: "error", error: "Missing required fields" });
          controller.close();
          return;
        }

        const totalLanguages = languages.length;
        const validChartTypes = ["bar", "bar3d", "pie", "radar", "number"];

        for (let langIdx = 0; langIdx < totalLanguages; langIdx++) {
          const language = languages[langIdx];
          const langInfo = getLanguageByCode(language);
          const languageName = langInfo?.name || "English";
          const langLabel = langInfo?.nativeName || language;

          try {
            let scriptTitle: string;
            let validatedScenes: Scene[];

            if (isEditedMode) {
              // Use the edited script directly — skip LLM generation
              scriptTitle = editedScript.title;
              validatedScenes = editedScript.scenes.map((scene: Scene) => ({
                type: scene.type || "narration",
                text: scene.text || "",
                narration: scene.narration || "",
                subtitle: scene.subtitle || undefined,
                visual: scene.visual || undefined,
                data: scene.data
                  ? {
                      ...scene.data,
                      chartType: validChartTypes.includes(scene.data.chartType || "")
                        ? scene.data.chartType
                        : "number",
                    }
                  : undefined,
                duration: scene.duration || 10,
              }));
            } else {
              // --- STEP 1: Generate script ---
              send({
                status: "generating_script",
                language,
                languageName: langLabel,
                langIndex: langIdx,
                totalLanguages,
                message: `Generating ${langLabel} script...`,
              });

              const prompt = buildScriptPrompt(title, body, language, languageName);
              const script = await generateJSON<GeneratedScript>(prompt);

              if (!script.title || !Array.isArray(script.scenes) || script.scenes.length === 0) {
                throw new Error(`Invalid script for ${languageName}`);
              }

              scriptTitle = script.title;
              validatedScenes = script.scenes.map((scene) => ({
                type: scene.type || "narration",
                text: scene.text || "",
                narration: scene.narration || "",
                subtitle: language !== "en" ? (scene.subtitle || scene.text || "") : undefined,
                visual: scene.visual || undefined,
                data: scene.data
                  ? {
                      ...scene.data,
                      chartType: validChartTypes.includes(scene.data.chartType || "")
                        ? scene.data.chartType
                        : "number",
                    }
                  : undefined,
                duration: scene.duration || 10,
              }));

              const totalDuration = validatedScenes.reduce((sum, s) => sum + s.duration, 0);

              send({
                status: "script_ready",
                language,
                languageName: langLabel,
                langIndex: langIdx,
                totalLanguages,
                script: { title: scriptTitle, scenes: validatedScenes, language, totalDuration },
                message: `${langLabel} script ready (${validatedScenes.length} scenes)`,
              });
            }

            // --- STEP 2: Generate TTS audio for all scenes ---
            send({
              status: "generating_audio",
              language,
              languageName: langLabel,
              langIndex: langIdx,
              totalLanguages,
              progress: 0,
              message: `Generating ${langLabel} narration audio...`,
            });

            const audioUrls: string[] = [];
            for (let i = 0; i < validatedScenes.length; i++) {
              const scene = validatedScenes[i];
              if (scene.narration) {
                const { audioUrl, durationSeconds } = await generateTTSAudio(scene.narration, language);
                audioUrls.push(audioUrl);
                // Override scene duration with actual audio length so narration never gets cut off
                validatedScenes[i] = { ...validatedScenes[i], duration: Math.max(durationSeconds, validatedScenes[i].duration) };
              } else {
                audioUrls.push("");
              }

              send({
                status: "generating_audio",
                language,
                languageName: langLabel,
                langIndex: langIdx,
                totalLanguages,
                progress: (i + 1) / validatedScenes.length,
                message: `${langLabel} audio: ${i + 1}/${validatedScenes.length} scenes`,
              });
            }

            // Recalculate total duration after audio-based adjustments
            const finalDuration = validatedScenes.reduce((sum, s) => sum + s.duration, 0);

            // --- DONE: Script + audio ready for instant preview ---
            send({
              status: "language_complete",
              language,
              languageName: langLabel,
              langIndex: langIdx,
              totalLanguages,
              script: { title: scriptTitle, scenes: validatedScenes, language, totalDuration: finalDuration },
              audioUrls,
              message: `${langLabel} ready — preview available!`,
            });
          } catch (langError) {
            console.error(`Error processing ${languageName}:`, langError);
            send({
              status: "language_error",
              language,
              languageName: langLabel,
              langIndex: langIdx,
              totalLanguages,
              error: langError instanceof Error ? langError.message : "Failed",
              message: `${langLabel} failed: ${langError instanceof Error ? langError.message : "Unknown error"}`,
            });
          }
        }

        send({
          status: "all_complete",
          message: "All languages processed!",
        });

        controller.close();
      } catch (error) {
        console.error("Generate-all error:", error);
        send({
          status: "error",
          error: error instanceof Error ? error.message : "Pipeline failed",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
