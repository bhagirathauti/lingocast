import { NextRequest } from "next/server";
import path from "path";
import os from "os";
import fs from "fs";
import type { NewsVideoProps } from "@/remotion/types";

// Cache the bundle location across requests
let bundleLocation: string | null = null;

async function getBundleLocation(): Promise<string> {
  if (bundleLocation && fs.existsSync(bundleLocation)) {
    return bundleLocation;
  }

  const { bundle } = await import("@remotion/bundler");
  const entryPoint = path.resolve(process.cwd(), "remotion/index.ts");

  bundleLocation = await bundle({
    entryPoint,
    // Enable webpack caching for faster subsequent bundles
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
        const { script, audioUrls } = await req.json();

        if (!script?.scenes || !Array.isArray(script.scenes)) {
          send({ status: "error", error: "Invalid script data" });
          controller.close();
          return;
        }

        // Step 1: Bundle
        send({ status: "bundling", progress: 0 });
        const serveUrl = await getBundleLocation();
        send({ status: "bundling", progress: 1 });

        // Step 2: Select composition
        send({ status: "preparing", progress: 0 });
        const inputProps: NewsVideoProps = {
          title: script.title,
          scenes: script.scenes,
          language: script.language || "en",
          totalDuration: script.totalDuration,
          audioUrls: audioUrls || [],
        };

        const { renderMedia, selectComposition } = await import("@remotion/renderer");
        const composition = await selectComposition({
          serveUrl,
          id: "NewsVideo",
          inputProps: inputProps as unknown as Record<string, unknown>,
        });

        // Step 3: Render
        const outputDir = path.join(os.tmpdir(), "vernacular-video");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilename = `et-video-${Date.now()}.mp4`;
        const outputLocation = path.join(outputDir, outputFilename);

        send({ status: "rendering", progress: 0 });

        await renderMedia({
          composition,
          serveUrl,
          codec: "h264",
          outputLocation,
          inputProps: inputProps as unknown as Record<string, unknown>,
          onProgress: ({ progress }) => {
            send({ status: "rendering", progress });
          },
        });

        // Step 4: Read the file and send as base64
        send({ status: "encoding", progress: 0 });
        const videoBuffer = fs.readFileSync(outputLocation);
        const base64Video = videoBuffer.toString("base64");

        send({
          status: "complete",
          videoUrl: `data:video/mp4;base64,${base64Video}`,
          filename: outputFilename,
        });

        // Cleanup temp file
        try {
          fs.unlinkSync(outputLocation);
        } catch {
          // ignore cleanup errors
        }

        controller.close();
      } catch (error) {
        console.error("Render error:", error);
        send({
          status: "error",
          error: error instanceof Error ? error.message : "Render failed",
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
