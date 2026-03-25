import { NextRequest } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { getVoiceForLanguage } from "@/lib/tts-voices";

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();

    if (!text || !language) {
      return Response.json(
        { error: "Missing required fields: text, language" },
        { status: 400 }
      );
    }

    const voice = getVoiceForLanguage(language);
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(text);

    // Collect audio chunks from the Readable stream
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", () => resolve());
      audioStream.on("error", (err: Error) => reject(err));
    });

    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString("base64");
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Return audio duration so caller can sync scene length
    const durationSeconds = Math.ceil((audioBuffer.length * 8) / 96000 + 0.5);

    return Response.json({ audioUrl: audioDataUrl, durationSeconds });
  } catch (error) {
    console.error("TTS error:", error);
    return Response.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
