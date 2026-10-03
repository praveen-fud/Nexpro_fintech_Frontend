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
