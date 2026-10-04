import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/features/auth/auth-context"
import { routes } from "@/lib/routes"

/**
 * Locks money-moving routes (Add Money and its sub-pages) behind an
 * APPROVED kyc_status, redirecting anywhere short of that to the status
 * page so the customer sees why and what to do next. UX convenience only
 * — the backend independently rejects fund creation unless kyc_status is
 * APPROVED (see Backend/app/routers/funding.py `create_request`).
 */
export function RequireApprovedKyc() {
  const { user } = useAuth()

  if (user && user.kycStatus !== "APPROVED") {
    return <Navigate to={routes.app.kycStatus} replace />
  }

  return <Outlet />
}
