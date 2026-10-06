import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, ArrowLeftRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

type TxStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED"
type TxType = "FUNDING" | "PAYMENT" | "REFUND"

interface TransactionItem {
  id: string
  transactionNumber: string
  customerId: string
  customerName: string
  type: TxType
  amount: string
  fee: string
  status: TxStatus
  method: string | null
  reference: string
  description: string
  createdAt: string
}

interface TransactionListResponse {
  items: TransactionItem[]
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

const STATUS_COLORS: Record<TxStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  REVERSED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
}

const TYPE_COLORS: Record<TxType, string> = {
  FUNDING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PAYMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  REFUND: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
}

const PAGE_SIZE = 25

// ── Component ─────────────────────────────────────────────────────────────────

export function OperationsTransactionsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (search) params.set("search", search)
  if (statusFilter !== "ALL") params.set("status", statusFilter)
  if (typeFilter !== "ALL") params.set("type", typeFilter)

  const { data, isLoading, isError, refetch } = useQuery<TransactionListResponse>({
    queryKey: ["ops-transactions", search, statusFilter, typeFilter, page],
    queryFn: async () =>
      (await apiClient.get<TransactionListResponse>(`/operations/transactions?${params}`)).data,
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
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Search, filter, and review all platform transaction records.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by TX#, reference, customer…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REVERSED">Reversed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="FUNDING">Funding</SelectItem>
            <SelectItem value="PAYMENT">Payment</SelectItem>
            <SelectItem value="REFUND">Refund</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-destructive">Failed to load transactions.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-24 text-center">
          <ArrowLeftRight className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No transactions found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">TX #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground text-right md:table-cell">Fee</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{tx.transactionNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{tx.customerName}</p>
                      {tx.method && (
                        <p className="text-xs text-muted-foreground">
                          {tx.method.replace("_", " ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[tx.type]}`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-muted-foreground md:table-cell">
                      {formatAmount(tx.fee)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[tx.status]}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t px-4 py-2.5">
              <p className="text-xs text-muted-foreground">
                {data.total} transaction{data.total !== 1 ? "s" : ""}
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

export default OperationsTransactionsPage
