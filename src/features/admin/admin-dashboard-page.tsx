import { useQuery } from "@tanstack/react-query"
import { Users, Wallet, TrendingUp, Clock, ShieldCheck, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PendingRequestsCard } from "@/features/operations/pending-requests-card"
import { apiClient } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminOverview {
  totalCustomers: number
  activeCustomers: number
  totalFundingVolume: string
  pendingFunding: string
  kycPending: number
  totalWallets: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatINR(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

interface KpiCardProps {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  iconClass?: string
}

function KpiCard({ title, value, sub, icon: Icon, iconClass }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-full p-2 ${iconClass ?? "bg-primary/10 text-primary"}`}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery<AdminOverview>({
    queryKey: ["admin-overview"],
    queryFn: async () => (await apiClient.get<AdminOverview>("/admin/overview")).data,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-32 text-center">
        <p className="text-sm text-destructive">Failed to load dashboard data.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const inactiveCustomers = data.totalCustomers - data.activeCustomers

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Platform Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Platform-wide KPIs and system health at a glance.
        </p>
      </div>

      <PendingRequestsCard base="/admin" />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Total Customers"
          value={data.totalCustomers.toLocaleString()}
          sub={`${data.activeCustomers} active · ${inactiveCustomers} inactive`}
          icon={Users}
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <KpiCard
          title="Total Wallets"
          value={data.totalWallets.toLocaleString()}
          sub="Ledger-based — no mutable balance column"
          icon={Wallet}
          iconClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <KpiCard
          title="Total Funding Volume"
          value={formatINR(data.totalFundingVolume)}
          sub="All-time approved funding"
          icon={TrendingUp}
          iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <KpiCard
          title="Pending Funding"
          value={formatINR(data.pendingFunding)}
          sub="Awaiting Operations approval"
          icon={Clock}
          iconClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <KpiCard
          title="KYC Pending"
          value={data.kycPending}
          sub="Submitted or under review"
          icon={ShieldCheck}
          iconClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
        />
      </div>

      {/* Quick Links */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/operations">Manage Staff Users</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/fees">Configure Fees</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/limits">Configure Limits</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/audit-logs">View Audit Logs</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/customers">Browse Customers</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
