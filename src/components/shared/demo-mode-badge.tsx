import { Sparkles } from "lucide-react"

/**
 * Small, honest marker that the app is running against mock data rather
 * than a real backend — shown only while VITE_DEMO_MODE is on. Never let a
 * viewer mistake this preview for a live financial system.
 */
export function DemoModeBadge() {
  return (
    <div
      className="fixed right-3 bottom-20 z-50 flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm lg:bottom-3"
      role="status"
    >
      <Sparkles className="size-3.5 text-brand-cyan" aria-hidden="true" />
      Demo mode — sample data, no real backend
    </div>
  )
}
