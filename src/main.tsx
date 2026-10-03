import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/auth-context"
import { queryClient } from "@/lib/query-client"
import App from "./App"
import "./index.css"

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Root element not found")

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <App />
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
