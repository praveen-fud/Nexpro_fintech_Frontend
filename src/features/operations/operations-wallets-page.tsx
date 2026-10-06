import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Wallet, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

interface WalletItem {
  walletId: string
  walletNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  availableBalance: string
  pendingBalance: string
  currency: string
  createdAt: string
}

interface WalletListResponse {
  items: WalletItem[]
  total: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value))
}

const PAGE_SIZE = 20

// ── Component ─────────────────────────────────────────────────────────────────

export function OperationsWalletsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (search) params.set("search", search)

  const { data, isLoading, isError, refetch } = useQuery<WalletListResponse>({
    queryKey: ["ops-wallets", search, page],
    queryFn: async () =>
      (await apiClient.get<WalletListResponse>(`/operations/wallets?${params}`)).data,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Wallets</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          View customer wallet balances and ledger activity. Balances are always derived from the ledger.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by wallet number, name, or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-destructive">Failed to load wallets.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-24 text-center">
          <Wallet className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No wallets found</p>
          <p className="text-xs text-muted-foreground">
            Wallets are created automatically when a customer completes KYC.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Wallet #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Available</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Pending</th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Currency</th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((w) => (
                  <tr key={w.walletId} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                      {w.walletNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{w.customerName}</p>
                      <p className="text-xs text-muted-foreground">{w.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatAmount(w.availableBalance)}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">
                      {formatAmount(w.pendingBalance)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {w.currency}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t px-4 py-2.5">
              <p className="text-xs text-muted-foreground">
                {data.total} wallet{data.total !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OperationsWalletsPage
