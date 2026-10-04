import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth/auth-context"
import { routes } from "@/lib/routes"

/**
 * Hard-blocks a customer who has never started KYC from reaching any other
 * /app/* page — they're redirected straight into the KYC flow until they
 * submit it (status leaves NOT_STARTED). Once submitted, every page under
 * this gate is reachable again; RequireApprovedKyc handles the narrower
 * "APPROVED only" gating for money-moving features. This is UX routing
 * only — the backend independently rejects fund creation server-side.
 */
export function KycGate() {
  const { user } = useAuth()
  const location = useLocation()

  if (user?.kycStatus === "NOT_STARTED" && location.pathname !== routes.app.kyc) {
    return <Navigate to={routes.app.kyc} replace />
  }

  return <Outlet />
}
