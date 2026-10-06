import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

type KycStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "APPROVED"
  | "REJECTED"

interface Customer {
  id: string
  fullName: string
  email: string
  mobileNumber: string
  kycStatus: KycStatus
  isActive: boolean
  createdAt: string
}

interface CustomerListResponse {
  items: Customer[]
  total: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const KYC_LABELS: Record<KycStatus, string> = {
  NOT_STARTED: "Not Started",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ADDITIONAL_INFORMATION_REQUIRED: "Info Required",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

const KYC_COLORS: Record<KycStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  UNDER_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ADDITIONAL_INFORMATION_REQUIRED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

function KycBadge({ status }: { status: KycStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${KYC_COLORS[status]}`}>
      {KYC_LABELS[status]}
    </span>
  )
}

const PAGE_SIZE = 20

// ── Component ─────────────────────────────────────────────────────────────────

export function OperationsCustomersPage() {
  const [search, setSearch] = useState("")
  const [kycFilter, setKycFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (search) params.set("search", search)
  if (kycFilter !== "ALL") params.set("kycStatus", kycFilter)

  const { data, isLoading, isError, refetch } = useQuery<CustomerListResponse>({
    queryKey: ["ops-customers", search, kycFilter, page],
    queryFn: async () =>
      (await apiClient.get<CustomerListResponse>(`/operations/customers?${params}`)).data,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleKycFilter(value: string) {
    setKycFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Search and view customer profiles and KYC status.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or mobile…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={kycFilter} onValueChange={handleKycFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All KYC Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All KYC Statuses</SelectItem>
            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="ADDITIONAL_INFORMATION_REQUIRED">Info Required</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
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
          <p className="text-sm text-destructive">Failed to load customers.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-24 text-center">
          <Users className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No customers found</p>
          {search || kycFilter !== "ALL" ? (
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Customers will appear here once they register.</p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Mobile</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">KYC</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">{c.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{c.mobileNumber}</td>
                    <td className="px-4 py-3">
                      <KycBadge status={c.kycStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          c.isActive
                            ? "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                            : "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400"
                        }
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t px-4 py-2.5">
              <p className="text-xs text-muted-foreground">
                {data.total} customer{data.total !== 1 ? "s" : ""}
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

export default OperationsCustomersPage
