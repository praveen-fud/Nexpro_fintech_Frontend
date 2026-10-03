import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { FlowLayout } from "@/layouts/flow-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { FundingRequest, Wallet } from "@/types/domain"

export function FundingSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const requestQuery = useQuery({
    queryKey: ["funding-request", id],
    queryFn: async () => (await apiClient.get<FundingRequest>(`/funding-requests/${id}`)).data,
    enabled: !!id,
  })

  const walletQuery = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: async () => (await apiClient.get<Wallet>("/wallet/me")).data,
  })

  return (
    <FlowLayout title="Funding Approved" maxWidthClassName="max-w-md">
      <div className="flex flex-col items-center py-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex size-16 items-center justify-center rounded-full bg-success-surface text-success"
        >
          <Check className="size-8" strokeWidth={2.5} />
        </motion.div>

        <h1 className="mt-5 text-xl font-semibold text-foreground">Money added to your wallet</h1>

        {requestQuery.data ? (
          <p className="font-tabular mt-2 text-3xl font-semibold text-success">
            +{formatCurrency(requestQuery.data.walletCredit)}
          </p>
        ) : (
          <Skeleton className="mt-3 h-9 w-40" />
        )}

        <div className="mt-6 w-full rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">New Available Balance</p>
          {walletQuery.data ? (
            <p className="font-tabular mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(walletQuery.data.availableBalance)}
            </p>
          ) : (
            <Skeleton className="mt-1 h-8 w-32" />
          )}
        </div>

        <Button size="lg" className="mt-8 w-full" onClick={() => navigate(routes.app.wallet)}>
          View Wallet
        </Button>
        <Button size="lg" variant="ghost" className="mt-2 w-full" onClick={() => navigate(routes.app.dashboard)}>
          Back to Home
        </Button>
      </div>
    </FlowLayout>
  )
}

export default FundingSuccessPage
