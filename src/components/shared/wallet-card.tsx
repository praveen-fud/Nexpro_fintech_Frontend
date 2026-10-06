import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, WifiIcon } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

// ── Persistence ────────────────────────────────────────────────────────────────
const PREF_KEY = "nexpro_balance_hidden"
function readPref(): boolean {
  try { return localStorage.getItem(PREF_KEY) !== "false" } catch { return true }
}
function writePref(v: boolean) {
  try { localStorage.setItem(PREF_KEY, String(v)) } catch {}
}

// ── Flip timing ────────────────────────────────────────────────────────────────
// Two-half technique: front folds to 90°, then back unfolds from −90°.
// No preserve-3d needed — each face independently animates, no conflicts
// with overflow:hidden or ancestor stacking contexts.
const HALF   = 0.30                          // seconds per half
const EI     = [0.55, 0, 1,    1] as const  // ease-in  (fold away)
const EO     = [0,    0, 0.45, 1] as const  // ease-out (unfold in)
const OVERLAP = 0.92                         // start second half at 92% of first

// ── Types ──────────────────────────────────────────────────────────────────────
interface WalletCardProps {
  availableBalance: number
  walletId?: string
  pendingBalance?: number
  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
export function WalletCard({
  availableBalance,
  walletId,
  pendingBalance,
  className,
}: WalletCardProps) {
  const [hidden, setHidden] = useState<boolean>(readPref)
  const containerRef = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 50, y: 50, on: false })

  function toggle() {
    setHidden((prev) => {
      const next = !prev
      writePref(next)
      return next
    })
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    setGlow({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    })
  }

  // Shared classes for each face — no overflow:hidden here so the
  // perspective transform is not clipped mid-flip
  const face =
    "bg-brand-gradient absolute inset-0 flex flex-col justify-between rounded-[20px] p-6 text-white sm:p-7"

  // Front folds away when hidden→false, unfolds when hidden→true
  const frontAnim  = { rotateY: hidden ? 0 : 90 }
  const frontTrans = {
    duration: HALF,
    ease:     hidden ? EO : EI,
    delay:    hidden ? HALF * OVERLAP : 0,
  }

  // Back unfolds when hidden→false (starts after front), folds when hidden→true
  const backAnim  = { rotateY: hidden ? -90 : 0 }
  const backTrans = {
    duration: HALF,
    ease:     hidden ? EI : EO,
    delay:    hidden ? 0 : HALF * OVERLAP,
  }

  return (
    /*
     * overflow:hidden is here (on the container, not on a preserve-3d parent)
     * so it clips the orb decorations without affecting the 3D faces.
     */
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-[200px] w-full overflow-hidden rounded-[20px] shadow-xl",
        className
      )}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, on: false }))}
    >
      {/* ── Pointer glow ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 rounded-[20px]"
        style={{
          opacity: glow.on ? 1 : 0,
          transition: "opacity 400ms ease",
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.18) 0%, transparent 58%)`,
        }}
      />

      {/* ── FRONT FACE — balance hidden ───────────────────────────────── */}
      <motion.div
        className={face}
        style={{ transformPerspective: 1100 }}
        animate={frontAnim}
        transition={frontTrans}
      >
        {/* Orbs */}
        <div className="pointer-events-none absolute -right-14 -top-14 size-52 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-white/5"  aria-hidden />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-white/55">
            Available Balance
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggle}
              aria-label="Show balance"
              className="flex size-7 items-center justify-center rounded-full bg-white/12 text-white/65 transition-colors duration-150 hover:bg-white/22 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Eye className="size-3.5" />
            </button>
            <WifiIcon className="size-5 rotate-90 text-white/45" aria-hidden />
          </div>
        </div>

        {/* Masked balance — redacted dots sized to mimic digit rhythm */}
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-end gap-[5px]">
            <span className="mr-1 text-2xl font-medium text-white/60 sm:text-3xl">₹</span>
            {[15, 10, 13, 9, 15, 10, 13].map((w, i) => (
              <span
                key={i}
                aria-hidden
                className="inline-block rounded-full bg-white/38"
                style={{ width: w, height: 10, marginBottom: i % 2 ? 4 : 0 }}
              />
            ))}
          </div>
          {typeof pendingBalance === "number" && pendingBalance > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/30">+</span>
              {[26, 18, 22, 15].map((w, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="inline-block h-[6px] rounded-full bg-white/22"
                  style={{ width: w }}
                />
              ))}
              <span className="text-xs text-white/30">pending</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/45">Wallet ID</p>
            <p className="font-tabular text-sm text-white/75">{walletId ?? "NXP-••••-••••"}</p>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/75">NEXPRO</span>
        </div>
      </motion.div>

      {/* ── BACK FACE — balance revealed ──────────────────────────────── */}
      <motion.div
        className={face}
        style={{ transformPerspective: 1100 }}
        animate={backAnim}
        transition={backTrans}
      >
        {/* Orbs — mirrored positions for visual variety */}
        <div className="pointer-events-none absolute -left-12 -top-12 size-52 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -right-8 size-48 rounded-full bg-white/5"  aria-hidden />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-white/55">
            Available Balance
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggle}
              aria-label="Hide balance"
              className="flex size-7 items-center justify-center rounded-full bg-white/12 text-white/65 transition-colors duration-150 hover:bg-white/22 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <EyeOff className="size-3.5" />
            </button>
            <WifiIcon className="size-5 rotate-90 text-white/45" aria-hidden />
          </div>
        </div>

        {/* Real balance */}
        <div className="relative z-10 flex flex-col gap-2">
          <p className="font-tabular text-4xl font-semibold tracking-tight sm:text-5xl">
            {formatCurrency(availableBalance)}
          </p>
          {typeof pendingBalance === "number" && pendingBalance > 0 && (
            <p className="text-sm text-white/65">
              + {formatCurrency(pendingBalance)} pending funding
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/45">Wallet ID</p>
            <p className="font-tabular text-sm text-white/75">{walletId ?? "NXP-••••-••••"}</p>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/75">NEXPRO</span>
        </div>
      </motion.div>
    </div>
  )
}
