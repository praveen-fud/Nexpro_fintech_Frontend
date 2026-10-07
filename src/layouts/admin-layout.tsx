import { Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Inbox,
  ShieldCheck,
  Wallet,
  WalletCards,
  Receipt,
  CreditCard,
  Percent,
  Gauge,
  KeyRound,
  BarChart3,
  GitCompareArrows,
  ScrollText,
  Settings,
  UserCog,
} from "lucide-react"
import { PortalLayout, type PortalNavItem } from "@/components/shared/portal-layout"
import { routes } from "@/lib/routes"

const navItems: PortalNavItem[] = [
  { label: "Dashboard", to: routes.admin.dashboard, icon: LayoutDashboard, exact: true },
  { label: "All Requests", to: routes.admin.requests, icon: Inbox },
  { label: "Customers", to: routes.admin.customers, icon: Users },
  { label: "Operations Team", to: routes.admin.operationsUsers, icon: UserCog },
  { label: "Funding", to: routes.admin.funding, icon: Wallet },
  { label: "Wallets", to: routes.admin.wallets, icon: WalletCards },
  { label: "Transactions", to: routes.admin.transactions, icon: Receipt },
  { label: "KYC & Compliance", to: routes.admin.kyc, icon: ShieldCheck },
  { label: "Payment Methods", to: routes.admin.paymentMethods, icon: CreditCard },
  { label: "Fees", to: routes.admin.fees, icon: Percent },
  { label: "Limits", to: routes.admin.limits, icon: Gauge },
  { label: "Roles & Permissions", to: routes.admin.roles, icon: KeyRound },
  { label: "Reports", to: routes.admin.reports, icon: BarChart3 },
  { label: "Reconciliation", to: routes.admin.reconciliation, icon: GitCompareArrows },
  { label: "Audit Logs", to: routes.admin.auditLogs, icon: ScrollText },
  { label: "System Settings", to: routes.admin.settings, icon: Settings },
]

export function AdminLayout() {
  return (
    <PortalLayout navItems={navItems} portalLabel="Super Admin">
      <Outlet />
    </PortalLayout>
  )
}
