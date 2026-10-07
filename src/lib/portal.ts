import { useLocation } from "react-router-dom"

/**
 * Operations and Super Admin share the same review pages. Links must stay
 * inside whichever portal the staff member is in, or the sidebar/layout would
 * jump between portals mid-review.
 */
export function usePortal() {
  const { pathname } = useLocation()
  const base = pathname.startsWith("/admin") ? "/admin" : "/operations"
  return {
    base,
    requests: `${base}/requests`,
    fundingQueue: `${base}/funding`,
    fundingDetail: (id: string) => `${base}/funding/${id}`,
    kycQueue: `${base}/kyc`,
    kycDetail: (id: string) => `${base}/kyc/${id}`,
  }
}
