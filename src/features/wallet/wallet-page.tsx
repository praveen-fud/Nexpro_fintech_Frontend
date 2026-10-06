import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle, Receipt, Inbox, Wallet as WalletIcon, Clock, Activity, Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"
import type { Wallet, WalletLedgerEntry } from "@/types/domain"

const PREF_KEY = "nexpro_balance_hidden"
function readPref(): boolean {
  try { return localStorage.getItem(PREF_KEY) !== "false" } catch { return true }
}
function writePref(h: boolean) {
  try { localStorage.setItem(PREF_KEY, String(h)) } catch {}
}

export function WalletPage() {
  const { user } = useAuth()
  const isKycApproved = user?.kycStatus === "APPROVED"
  const [hidden, setHidden] = useState<boolean>(readPref)

  const toggle = () => {
    const next = !hidden
    setHidden(next)
    writePref(next)
  }

  const walletQuery = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: async () => (await apiClient.get<Wallet>("/wallet/me")).data,
  })

  const ledgerQuery = useQuery({
    queryKey: ["wallet", "ledger"],
    queryFn: async () => (await apiClient.get<WalletLedgerEntry[]>("/wallet/ledger")).data,
  })

  return (
    <Stagger>
      <StaggerItem>
        <PageHeader
          title="Wallet"
          description="Your available balance, pending funding, and ledger activity."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                aria-label={hidden ? "Show balances" : "Hide balances"}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              {isKycApproved ? (
                <Button asChild>
                  <Link to={routes.app.addMoney}>
                    <PlusCircle className="size-4" />
                    Add Money
                  </Link>
                </Button>
              ) : (
                <Link
                  to={routes.app.kycStatus}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-amber-400/50 hover:text-amber-600"
                >
                  <Lock className="size-4" />
                  Add Money
                </Link>
              )}
            </div>
          }
        />
      </StaggerItem>

      {walletQuery.isLoading && <Skeleton className="h-28 w-full rounded-lg" />}
      {walletQuery.isError && <ErrorState onRetry={() => walletQuery.refetch()} />}
      {walletQuery.data && (
        <StaggerItem className="grid gap-4 sm:grid-cols-3">
          <div className="surface-tint-success group rounded-[20px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-success/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <span className="flex size-9 items-center justify-center rounded-full bg-success text-white shadow-sm shadow-success/30 transition-transform duration-300 group-hover:scale-110">
                <WalletIcon className="size-4" />
              </span>
            </div>
            <p
              className="font-tabular mt-2 text-2xl font-semibold text-foreground"
              style={{
                filter: hidden ? "blur(8px)" : "blur(0px)",
                opacity: hidden ? 0.55 : 1,
                transition: "filter 350ms cubic-bezier(0.4,0,0.2,1), opacity 350ms ease",
                userSelect: hidden ? "none" : "auto",
              }}
            >
              {formatCurrency(walletQuery.data.availableBalance)}
            </p>
          </div>
          <div className="surface-tint-warning group rounded-[20px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-warning/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pending Balance</p>
              <span className="flex size-9 items-center justify-center rounded-full bg-warning text-white shadow-sm shadow-warning/30 transition-transform duration-300 group-hover:scale-110">
                <Clock className="size-4" />
              </span>
            </div>
            <p
              className="font-tabular mt-2 text-2xl font-semibold text-warning"
              style={{
                filter: hidden ? "blur(8px)" : "blur(0px)",
                opacity: hidden ? 0.55 : 1,
                transition: "filter 350ms cubic-bezier(0.4,0,0.2,1), opacity 350ms ease",
                userSelect: hidden ? "none" : "auto",
              }}
            >
              {formatCurrency(walletQuery.data.pendingBalance)}
            </p>
          </div>
          <div className="surface-tint-info group rounded-[20px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-info/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Activity</p>
              <span className="flex size-9 items-center justify-center rounded-full bg-info text-white shadow-sm shadow-info/30 transition-transform duration-300 group-hover:scale-110">
                <Activity className="size-4" />
              </span>
            </div>
            <p
              className="font-tabular mt-2 text-2xl font-semibold text-foreground"
              style={{
                filter: hidden ? "blur(8px)" : "blur(0px)",
                opacity: hidden ? 0.55 : 1,
                transition: "filter 350ms cubic-bezier(0.4,0,0.2,1), opacity 350ms ease",
                userSelect: hidden ? "none" : "auto",
              }}
            >
              {formatCurrency(walletQuery.data.availableBalance + walletQuery.data.pendingBalance)}
            </p>
          </div>
          <div className="rounded-[20px] border border-border bg-muted/40 p-5 sm:col-span-3">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Wallet ID</p>
            <p className="font-tabular mt-1 text-sm font-medium text-foreground">{walletQuery.data.walletId}</p>
          </div>
        </StaggerItem>
      )}

      <StaggerItem className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Wallet Activity</p>
          <Link to={routes.app.transactions} className="text-sm font-medium text-primary hover:underline">
            View all transactions
          </Link>
        </div>

        {ledgerQuery.isLoading && <Skeleton className="h-48 w-full rounded-lg" />}
        {ledgerQuery.isError && <ErrorState onRetry={() => ledgerQuery.refetch()} />}
        {ledgerQuery.data && ledgerQuery.data.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No wallet activity yet"
            description="Ledger entries appear here once a funding request is approved and credited."
          />
        )}
        {ledgerQuery.data && ledgerQuery.data.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card shadow-sm">
            {ledgerQuery.data.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      entry.direction === "CREDIT" ? "bg-success-surface text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Receipt className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{entry.entryType.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "font-tabular text-sm font-semibold",
                      entry.direction === "CREDIT" ? "text-success" : "text-foreground"
                    )}
                  >
                    {entry.direction === "CREDIT" ? "+" : "-"}
                    {formatCurrency(entry.amount)}
                  </span>
                  <StatusBadge status={entry.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </StaggerItem>
    </Stagger>
  )
}

export default WalletPage
