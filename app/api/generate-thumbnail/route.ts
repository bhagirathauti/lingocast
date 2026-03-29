import { NextRequest } from "next/server";
import path from "path";
import os from "os";
import fs from "fs";

let bundleLocation: string | null = null;

async function getBundleLocation(): Promise<string> {
  if (bundleLocation && fs.existsSync(bundleLocation)) {
    return bundleLocation;
  }
  const { bundle } = await import("@remotion/bundler");
  const entryPoint = path.resolve(process.cwd(), "remotion/index.ts");
  bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });
  return bundleLocation;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        const { script } = await req.json();

        if (!script?.scenes || !Array.isArray(script.scenes)) {
          send({ status: "error", error: "Invalid script data" });
          controller.close();
          return;
        }

        send({ status: "bundling" });
        const serveUrl = await getBundleLocation();

        const inputProps = {
          title: script.title,
          scenes: script.scenes,
          language: script.language || "en",
          totalDuration: script.totalDuration,
          audioUrls: [],
        };

        const { renderMedia, selectComposition } = await import("@remotion/renderer");
        const composition = await selectComposition({
          serveUrl,
          id: "NewsVideo",
          inputProps: inputProps as unknown as Record<string, unknown>,
        });

        // Render first 3 seconds (90 frames at 30fps) as animated GIF
        const gifFrames = 90;

        const outputDir = path.join(os.tmpdir(), "vernacular-thumbnails");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, `thumb-${Date.now()}.gif`);

        send({ status: "rendering", progress: 0 });

        await renderMedia({
          composition: {
            ...composition,
            durationInFrames: gifFrames,
          },
          serveUrl,
          codec: "gif",
          outputLocation: outputPath,
          inputProps: inputProps as unknown as Record<string, unknown>,
          everyNthFrame: 2, // render every 2nd frame for smaller GIF (~15fps)
          onProgress: ({ progress }) => {
            send({ status: "rendering", progress });
          },
        });

        const gifBuffer = fs.readFileSync(outputPath);
        const base64 = gifBuffer.toString("base64");
        const dataUrl = `data:image/gif;base64,${base64}`;

        send({ status: "complete", imageUrl: dataUrl });

        try { fs.unlinkSync(outputPath); } catch { /* ignore */ }

        controller.close();
      } catch (error) {
        console.error("Thumbnail generation error:", error);
        send({
          status: "error",
          error: error instanceof Error ? error.message : "Failed to generate thumbnail",
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
