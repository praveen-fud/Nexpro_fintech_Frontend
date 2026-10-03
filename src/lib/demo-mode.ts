/**
 * On by default: this app ships without a deployed backend yet, so it
 * falls back to the in-memory mock API (src/lib/mock) unless explicitly
 * turned off. Set VITE_DEMO_MODE=false once a real backend is wired up.
 */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE !== "false"
