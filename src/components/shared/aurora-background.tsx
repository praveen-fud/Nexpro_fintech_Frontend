import { useRef } from "react"
import { motion, useMotionValue, useSpring, type MotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface AuroraBackgroundProps {
  className?: string
  /** Subtle parallax on pointer move — disable for smaller/less important surfaces. */
  interactive?: boolean
  /** "dark" (default) is for dark panels — white grid + dark edge fade.
   * "light" is for light sections (e.g. the marketing hero) — softer
   * blobs, a dark grid, and no edge-fade wash. */
  tone?: "dark" | "light"
}

function useParallax(interactive: boolean): {
  ref: React.RefObject<HTMLDivElement | null>
  x: MotionValue<number>
  y: MotionValue<number>
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave: () => void
} {
  const ref = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 40, damping: 20, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 40, damping: 20, mass: 0.5 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5
    rawX.set(relX * 28)
    rawY.set(relY * 28)
  }

  const onMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return { ref, x, y, onMouseMove, onMouseLeave }
}

/**
 * Layered animated gradient blobs + a faint drifting grid — the ambient
 * "aurora" background used behind the auth brand panel and the marketing
 * hero. Pure CSS keyframes drive the idle drift (cheap, GPU-only); a
 * Framer Motion spring adds a gentle pointer-parallax on top of the layer.
 */
export function AuroraBackground({ className, interactive = true, tone = "dark" }: AuroraBackgroundProps) {
  const { ref, x, y, onMouseMove, onMouseLeave } = useParallax(interactive)
  const isLight = tone === "light"

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("pointer-events-auto absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <motion.div style={{ x, y }} className="absolute inset-0">
        <div
          className={cn(
            "animate-aurora-1 absolute top-[-10%] left-[-10%] size-[60%] rounded-full bg-brand-mint-strong/50 blur-3xl",
            isLight && "opacity-60"
          )}
        />
        <div
          className={cn(
            "animate-aurora-2 absolute top-[20%] right-[-15%] size-[65%] rounded-full bg-brand-primary/50 blur-3xl",
            isLight && "opacity-30"
          )}
        />
        <div
          className={cn(
            "animate-aurora-3 absolute bottom-[-20%] left-[10%] size-[55%] rounded-full bg-brand-cyan/40 blur-3xl",
            isLight && "opacity-30"
          )}
        />
      </motion.div>

      <div
        className={cn("animate-grid-pan absolute inset-0", isLight ? "opacity-[0.05]" : "opacity-[0.07]")}
        style={{
          backgroundImage: isLight
            ? "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)"
            : "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {!isLight && <div className="absolute inset-0 bg-gradient-to-t from-app-dark-bg via-transparent to-app-dark-bg/40" />}
      {isLight && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />}
    </div>
  )
}
