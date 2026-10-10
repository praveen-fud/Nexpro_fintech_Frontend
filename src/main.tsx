import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/auth-context"
import { SessionTimeout } from "@/features/auth/session-timeout"
import { DemoModeBadge } from "@/components/shared/demo-mode-badge"
import { queryClient } from "@/lib/query-client"
import { isDemoMode } from "@/lib/demo-mode"
import App from "./App"
import "./index.css"

async function bootstrap() {
  const rootEl = document.getElementById("root")
  if (!rootEl) throw new Error("Root element not found")

  // Load the in-memory mock server only when demo mode is explicitly enabled
  // (VITE_DEMO_MODE=true).  In production this block never runs.
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
              <SessionTimeout />
              <Toaster position="top-right" richColors closeButton />
              {isDemoMode && <DemoModeBadge />}
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
        {/* DevTools only in local development — never shipped to production */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>
  )
}

bootstrap()
