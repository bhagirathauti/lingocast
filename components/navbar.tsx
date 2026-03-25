"use client";

import Link from "next/link";
import { Video } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Video className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            LingoCast
          </span>
        </Link>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium">
            Beta
          </span>
        </div>
      </div>
    </header>
  );
}
