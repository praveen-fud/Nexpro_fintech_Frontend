import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/auth-context"
import { DemoModeBadge } from "@/components/shared/demo-mode-badge"
import { queryClient } from "@/lib/query-client"
import { isDemoMode } from "@/lib/demo-mode"
import App from "./App"
import "./index.css"

async function bootstrap() {
  const rootEl = document.getElementById("root")
  if (!rootEl) throw new Error("Root element not found")

  // No backend deployed yet: intercept API calls with an in-memory mock
  // "server" (src/lib/mock) so the full app is explorable on its own.
  // Flip VITE_DEMO_MODE=false (and point VITE_API_URL at a real backend)
  // to go live — no other code changes needed, every page already talks
  // to apiClient the same way either way.
  if (isDemoMode) {
    const { startMockServer } = await import("@/lib/mock")
    startMockServer()
  }

  createRoot(rootEl).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              <App />
              <Toaster position="top-right" richColors closeButton />
              {isDemoMode && <DemoModeBadge />}
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

bootstrap()
