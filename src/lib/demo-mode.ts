/**
 * Demo mode uses an in-memory mock instead of the real backend.
 * It is permanently off for production.  You can turn it on locally
 * by setting VITE_DEMO_MODE=true in .env — useful for UI-only previews
 * when no backend is running.
 */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"
