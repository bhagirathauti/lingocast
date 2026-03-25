"use client";

export function ScriptSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-b border-border py-3">
          <div className="h-3 w-20 rounded bg-muted animate-shimmer mb-2" />
          <div className="h-4 w-full rounded bg-muted animate-shimmer" />
          <div className="h-4 w-2/3 rounded bg-muted animate-shimmer mt-1.5" />
        </div>
      ))}
    </div>
  );
}
