import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertTriangle, ArrowRight, Clock, ShieldAlert, TrendingUp, Wallet } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"

interface OperationsOverview {
  pendingFunding: number
  approvedToday: number
  totalFundingVolume: number
  kycPending: number
  exceptions: number
  fundingVolumeByDay: { day: string; amount: number }[]
  fundingByMethod: { method: string; value: number }[]
  needsAttention: { label: string; count: number; to: string }[]
}

const CHART_COLORS = ["#4F46E5", "#06B6D4", "#312E81"]

const KPI_TONE = {
  warning: { surface: "surface-tint-warning", icon: "bg-warning text-white shadow-warning/30" },
  success: { surface: "surface-tint-success", icon: "bg-success text-white shadow-success/30" },
  primary: { surface: "surface-tint-primary", icon: "bg-primary text-white shadow-primary/30" },
  info: { surface: "surface-tint-info", icon: "bg-info text-white shadow-info/30" },
  error: { surface: "surface-tint-error", icon: "bg-error text-white shadow-error/30" },
} as const

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: typeof Wallet
  tone: keyof typeof KPI_TONE
}) {
  return (
    <div
      className={cn(
        "group rounded-[20px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        KPI_TONE[tone].surface
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110",
            KPI_TONE[tone].icon
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-tabular mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function OperationsOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["operations", "overview"],
    queryFn: async () => (await apiClient.get<OperationsOverview>("/operations/overview")).data,
  })

  return (
    <Stagger>
      <StaggerItem>
        <PageHeader title="Overview" description="Operational health across funding, KYC, and exceptions." />
      </StaggerItem>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {data && (
        <>
          <StaggerItem className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Pending Funding" value={formatCurrency(data.pendingFunding)} icon={Clock} tone="warning" />
            <KpiCard label="Approved Today" value={String(data.approvedToday)} icon={TrendingUp} tone="success" />
            <KpiCard label="Total Funding Volume" value={formatCurrency(data.totalFundingVolume)} icon={Wallet} tone="primary" />
            <KpiCard label="KYC Pending" value={String(data.kycPending)} icon={ShieldAlert} tone="info" />
            <KpiCard label="Exceptions" value={String(data.exceptions)} icon={AlertTriangle} tone="error" />
          </StaggerItem>

          <StaggerItem className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm lg:col-span-2">
              <p className="mb-4 text-sm font-semibold text-foreground">Funding Volume (7 days)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.fundingVolumeByDay}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={48} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: 8, borderColor: "var(--border)", fontSize: 13 }}
                      cursor={{ fill: "var(--muted)" }}
                    />
                    <Bar dataKey="amount" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-foreground">Funding Methods</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.fundingByMethod} dataKey="value" nameKey="method" innerRadius={55} outerRadius={80}>
                      {data.fundingByMethod.map((entry, index) => (
                        <Cell key={entry.method} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Needs Attention</p>
            <ul className="divide-y divide-border">
              {data.needsAttention.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group flex items-center justify-between rounded-md py-3 transition-colors hover:text-primary"
                  >
                    <span className="text-sm text-foreground group-hover:text-primary">
                      {item.count} {item.label}
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </>
      )}
    </Stagger>
  )
}

export default OperationsOverviewPage
