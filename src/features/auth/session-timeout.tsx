import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, TimerReset } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { flagSessionExpired } from "@/lib/auth-token"
import { useAuth } from "@/features/auth/auth-context"

/** Sign the user out after exactly this much inactivity. */
export const IDLE_TIMEOUT_MS = 15 * 60_000
/** Warn this long before the timeout fires. */
const WARNING_LEAD_MS = 60_000
/** Tell the server about activity at most this often (it enforces the idle
 * limit too, so abandoned/tampered clients can't keep a session alive). */
const HEARTBEAT_MS = 15_000
/** Tell other tabs about activity at most this often. */
const BROADCAST_MS = 5_000
/** Events that count as the user being present. */
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"] as const

type TabMessage = { type: "activity"; at: number } | { type: "logout" }

/**
 * Money-app idle timeout. Mount once, inside AuthProvider + Router.
 *
 *  - Real user input (not background polling) resets the idle clock and pings
 *    the server's heartbeat so its own idle limit stays in step.
 *  - 60s before the limit a warning dialog appears; only an explicit click
 *    keeps the session (passive mouse movement can't silently dismiss it).
 *  - At exactly 15:00 the session is revoked server-side and the user lands
 *    on the sign-in page. Timing uses timestamps (not stacked setTimeouts)
 *    so sleeping laptops and throttled background tabs still expire on time.
 *  - Tabs share activity via BroadcastChannel: activity or logout in one tab
 *    applies to all.
 */
export function SessionTimeout() {
  const { user, logout, endSession } = useAuth()
  const isAuthenticated = !!user

  const lastActivity = useRef(0)
  const lastBeat = useRef(0)
  const lastBroadcast = useRef(0)
  const warningOpen = useRef(false)
  const channel = useRef<BroadcastChannel | null>(null)
  const expiring = useRef(false)

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [staying, setStaying] = useState(false)

  const sendHeartbeat = useCallback((force = false) => {
    const now = Date.now()
    if (!force && now - lastBeat.current < HEARTBEAT_MS) return
    lastBeat.current = now
    // 401s are handled centrally by the api client (refresh → else sign out).
    return apiClient.post("/auth/heartbeat").catch(() => undefined)
  }, [])

  const markActive = useCallback(
    (force = false) => {
      const now = Date.now()
      lastActivity.current = now
      if (now - lastBroadcast.current >= BROADCAST_MS || force) {
        lastBroadcast.current = now
        channel.current?.postMessage({ type: "activity", at: now } satisfies TabMessage)
      }
      return sendHeartbeat(force)
    },
    [sendHeartbeat]
  )

  const expire = useCallback(async () => {
    if (expiring.current) return
    expiring.current = true
    warningOpen.current = false
    setSecondsLeft(null)
    flagSessionExpired()
    channel.current?.postMessage({ type: "logout" } satisfies TabMessage)
    try {
      await logout() // revokes the session server-side; clears token + user
    } catch {
      endSession()
    }
  }, [logout, endSession])

  const tick = useCallback(() => {
    const idle = Date.now() - lastActivity.current
    if (idle >= IDLE_TIMEOUT_MS) {
      void expire()
    } else if (idle >= IDLE_TIMEOUT_MS - WARNING_LEAD_MS) {
      warningOpen.current = true
      setSecondsLeft(Math.max(1, Math.ceil((IDLE_TIMEOUT_MS - idle) / 1000)))
    } else if (warningOpen.current) {
      // Activity in another tab dismissed the warning.
      warningOpen.current = false
      setSecondsLeft(null)
    }
  }, [expire])

  useEffect(() => {
    if (!isAuthenticated) {
      expiring.current = false
      warningOpen.current = false
      setSecondsLeft(null)
      return
    }

    lastActivity.current = Date.now()
    lastBeat.current = 0
    expiring.current = false
    void sendHeartbeat(true) // opening/reloading the app counts as activity

    if (typeof BroadcastChannel !== "undefined") {
      const ch = new BroadcastChannel("nexpro-session")
      ch.onmessage = (e: MessageEvent<TabMessage>) => {
        if (e.data.type === "activity") {
          lastActivity.current = Math.max(lastActivity.current, e.data.at)
        } else if (e.data.type === "logout") {
          expiring.current = true
          endSession()
        }
      }
      channel.current = ch
    }

    const onActivity = () => {
      // While the warning is up, only the explicit buttons count.
      if (warningOpen.current) return
      void markActive()
    }
    for (const evt of ACTIVITY_EVENTS) window.addEventListener(evt, onActivity, { passive: true })

    const onVisible = () => {
      if (document.visibilityState === "visible") tick()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", tick)

    const timer = window.setInterval(tick, 1000)
    return () => {
      for (const evt of ACTIVITY_EVENTS) window.removeEventListener(evt, onActivity)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", tick)
      window.clearInterval(timer)
      channel.current?.close()
      channel.current = null
    }
  }, [isAuthenticated, markActive, sendHeartbeat, tick, endSession])

  async function staySignedIn() {
    setStaying(true)
    warningOpen.current = false
    setSecondsLeft(null)
    await markActive(true)
    setStaying(false)
  }

  if (!isAuthenticated) return null

  return (
    <Dialog open={secondsLeft !== null}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-warning-surface text-warning">
            <TimerReset className="size-5" aria-hidden />
          </div>
          <DialogTitle>Still there?</DialogTitle>
          <DialogDescription>
            To keep your money safe, we sign you out after 15 minutes of inactivity. You&apos;ll be signed out in{" "}
            <span className="font-tabular font-semibold text-foreground" role="timer" aria-live="polite">
              {secondsLeft}s
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => void expire()}>
            Sign out now
          </Button>
          <Button onClick={() => void staySignedIn()} disabled={staying}>
            {staying && <Loader2 className="size-4 animate-spin" />}
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
