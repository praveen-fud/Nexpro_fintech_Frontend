import { Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  Users,
  WalletCards,
  Receipt,
  GitCompareArrows,
  Headset,
  Inbox,
  BarChart3,
} from "lucide-react"
import { PortalLayout, type PortalNavItem } from "@/components/shared/portal-layout"
import { routes } from "@/lib/routes"

const navItems: PortalNavItem[] = [
  { label: "Overview", to: routes.operations.overview, icon: LayoutDashboard, exact: true },
  { label: "All Requests", to: routes.operations.requests, icon: Inbox },
  { label: "Funding Requests", to: routes.operations.fundingQueue, icon: Wallet },
  { label: "KYC Review", to: routes.operations.kycQueue, icon: ShieldCheck },
  { label: "Customers", to: routes.operations.customers, icon: Users },
  { label: "Wallets", to: routes.operations.wallets, icon: WalletCards },
  { label: "Transactions", to: routes.operations.transactions, icon: Receipt },
  { label: "Reconciliation", to: routes.operations.reconciliation, icon: GitCompareArrows },
  { label: "Support", to: routes.operations.support, icon: Headset },
  { label: "Reports", to: routes.operations.reports, icon: BarChart3 },
]

export function OperationsLayout() {
  return (
    <PortalLayout navItems={navItems} portalLabel="Operations">
      <Outlet />
    </PortalLayout>
  )
}
