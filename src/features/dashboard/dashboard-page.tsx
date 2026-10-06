import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle, Receipt, Grid2x2, User, ArrowRight, ArrowDownLeft, ArrowUpRight, Inbox, Clock, Sparkles, Lock } from "lucide-react"
import { WalletCard } from "@/components/shared/wallet-card"
import { TiltCard } from "@/components/shared/tilt-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { KycStatusBanner } from "@/components/shared/kyc-status-banner"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"
import type { KycProfile, Transaction, Wallet } from "@/types/domain"

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getQuickActions(addMoneyTo: string) {
  return [
  {
    label: "Add Money",
    to: addMoneyTo,
    icon: PlusCircle,
    tone: "bg-gradient-to-br from-primary/15 to-brand-cyan/10 text-primary",
  },
  {
    label: "Transactions",
    to: routes.app.transactions,
    icon: Receipt,
    tone: "bg-info-surface text-info",
  },
  {
    label: "Services",
    to: routes.app.services,
    icon: Grid2x2,
    tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
  {
    label: "Profile",
    to: routes.app.profile,
    icon: User,
    tone: "bg-success-surface text-success",
  },
  ]
}

const TX_ICON_TONE: Record<Transaction["type"], string> = {
  FUNDING: "bg-success-surface text-success",
  PAYMENT: "bg-muted text-muted-foreground",
  REFUND: "bg-info-surface text-info",
}

export function DashboardPage() {
  const { user, refreshUser } = useAuth()

  const walletQuery = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: async () => (await apiClient.get<Wallet>("/wallet/me")).data,
  })

  const transactionsQuery = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: async () => (await apiClient.get<Transaction[]>("/transactions", { params: { limit: 5 } })).data,
  })

  const kycQuery = useQuery({
    queryKey: ["kyc", "me"],
    queryFn: async () => (await apiClient.get<KycProfile>("/kyc/me")).data,
  })

  // Picks up a status change from an out-of-band Ops decision made while
  // this tab was already open — the auth context otherwise only refreshes
  // at login/bootstrap.
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const isKycApproved = user?.kycStatus === "APPROVED"
  const addMoneyTo = isKycApproved ? routes.app.addMoney : routes.app.kycStatus
  const quickActions = getQuickActions(addMoneyTo)

  return (
    <Stagger>
      <StaggerItem className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {greeting()}, {user?.fullName.split(" ")[0]}
        </h1>
        <Sparkles className="size-4 text-brand-cyan" aria-hidden="true" />
      </StaggerItem>
      <StaggerItem>
        <p className="text-sm text-muted-foreground">Here's what's happening with your wallet.</p>
      </StaggerItem>

      {kycQuery.data && kycQuery.data.status !== "APPROVED" && (
        <StaggerItem className="mt-6">
          <KycStatusBanner status={kycQuery.data.status} reviewNotes={kycQuery.data.reviewNotes} />
        </StaggerItem>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <StaggerItem className="lg:col-span-2">
          {walletQuery.isLoading && <Skeleton className="h-[200px] w-full rounded-[20px]" />}
          {walletQuery.isError && <ErrorState onRetry={() => walletQuery.refetch()} />}
          {walletQuery.data && (
            <TiltCard>
              <WalletCard
                availableBalance={walletQuery.data.availableBalance}
                pendingBalance={walletQuery.data.pendingBalance}
                walletId={walletQuery.data.walletId}
              />
            </TiltCard>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {isKycApproved ? (
              <Button size="lg" asChild>
                <Link to={routes.app.addMoney}>
                  <PlusCircle className="size-4" />
                  Add Money
                </Link>
              </Button>
            ) : (
              <Link
                to={routes.app.kycStatus}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/50 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Lock className="size-4" />
                Add Money
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  KYC Required
                </span>
              </Link>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to={routes.app.wallet}>View Wallet</Link>
            </Button>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="surface-tint-warning relative h-full overflow-hidden rounded-[20px] border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-warning/10">
            <div
              className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-warning/10 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Pending Funding</p>
              <span className="flex size-9 items-center justify-center rounded-full bg-warning text-white shadow-sm shadow-warning/30">
                <Clock className="size-4" />
              </span>
            </div>
            {walletQuery.data ? (
              <p className="font-tabular relative z-10 mt-2 text-3xl font-semibold text-foreground">
                {formatCurrency(walletQuery.data.pendingBalance)}
              </p>
            ) : (
              <Skeleton className="mt-2 h-9 w-32" />
            )}
            <p className="relative z-10 mt-2 text-sm text-muted-foreground">
              Awaiting Operations review. We'll notify you once it's approved.
            </p>
          </div>
        </StaggerItem>
      </div>

      <StaggerItem className="mt-8">
        <p className="mb-3 text-sm font-semibold text-foreground">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const isLocked = !isKycApproved && action.label === "Add Money"
            return (
              <Link
                key={action.label}
                to={action.to}
                className={cn(
                  "group relative flex flex-col items-center gap-2.5 rounded-xl border bg-card p-4 text-center shadow-sm transition-all duration-300",
                  isLocked
                    ? "border-dashed border-muted-foreground/30 opacity-70 hover:border-amber-400/50 hover:opacity-100"
                    : "border-border hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                )}
              >
                {isLocked && (
                  <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                    <Lock className="size-2.5 text-amber-600 dark:text-amber-400" />
                  </span>
                )}
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                    isLocked ? "bg-muted text-muted-foreground" : action.tone
                  )}
                >
                  <action.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </StaggerItem>

      <StaggerItem className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Recent Transactions</p>
          <Link
            to={routes.app.transactions}
            className="flex items-center gap-1 text-sm font-medium text-primary transition-transform hover:translate-x-0.5"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {transactionsQuery.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}
        {transactionsQuery.isError && <ErrorState onRetry={() => transactionsQuery.refetch()} />}
        {transactionsQuery.data && transactionsQuery.data.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            description="Once you add money to your wallet, your funding history will appear here."
            action={
              <Button size="sm" asChild>
                <Link to={addMoneyTo}>Add Money</Link>
              </Button>
            }
          />
        )}
        {transactionsQuery.data && transactionsQuery.data.length > 0 && (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            {transactionsQuery.data.map((tx) => (
              <li key={tx.id}>
                <Link
                  to={routes.app.transaction(tx.id)}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        TX_ICON_TONE[tx.type]
                      )}
                    >
                      {tx.type === "PAYMENT" ? (
                        <ArrowUpRight className="size-4" />
                      ) : (
                        <ArrowDownLeft className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`font-tabular text-sm font-semibold ${
                        tx.type === "FUNDING" ? "text-success" : "text-foreground"
                      }`}
                    >
                      {tx.type === "FUNDING" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </StaggerItem>
    </Stagger>
  )
}

export default DashboardPage
