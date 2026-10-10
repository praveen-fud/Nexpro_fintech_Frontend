/**
 * In-memory access-token store, deliberately NOT persisted to localStorage —
 * tokens in localStorage are readable by any injected script (XSS blast
 * radius). The refresh token lives in a server-set httpOnly cookie instead.
 * A page reload clears this on purpose; the app calls /auth/refresh on boot
 * to silently re-establish a session from that cookie.
 */

let accessToken: string | null = null
const listeners = new Set<(token: string | null) => void>()

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
  for (const listener of listeners) listener(token)
}

export function onAccessTokenChange(listener: (token: string | null) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ── Session expiry signalling ──────────────────────────────────────────────
// The api client raises this when the server ends the session (idle timeout,
// absolute cap, revoked) and a silent token refresh can no longer save it.
// The auth context listens and signs the user out.
const expiryListeners = new Set<() => void>()

export function notifySessionExpired(): void {
  for (const listener of expiryListeners) listener()
}

export function onSessionExpired(listener: () => void): () => void {
  expiryListeners.add(listener)
  return () => expiryListeners.delete(listener)
}

/** One-shot flag (not sensitive) so the login page can explain why the user
 * was signed out. sessionStorage: survives the redirect, dies with the tab. */
const EXPIRED_FLAG = "nexpro_session_expired"

export function flagSessionExpired(): void {
  try {
    sessionStorage.setItem(EXPIRED_FLAG, "1")
  } catch {
    /* storage unavailable — the redirect alone still signs the user out */
  }
}

export function consumeSessionExpiredFlag(): boolean {
  try {
    const set = sessionStorage.getItem(EXPIRED_FLAG) === "1"
    sessionStorage.removeItem(EXPIRED_FLAG)
    return set
  } catch {
    return false
  }
}
