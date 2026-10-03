import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth/auth-context"
import { routes } from "@/lib/routes"
import type { Role } from "@/types/domain"
import { FullScreenLoader } from "@/components/shared/full-screen-loader"

/**
 * Gate for authenticated routes. Role checks here are a UX convenience only
 * — the backend re-enforces authorization on every request. Never treat a
 * route guard as the security boundary.
 */
export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={routes.login} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={routes.home} replace />
  }

  return <Outlet />
}
