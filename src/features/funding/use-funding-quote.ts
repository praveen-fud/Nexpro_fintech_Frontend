import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { FundingMethod } from "@/types/domain"

export interface FundingQuote {
  requestedAmount: number
  fee: number
  walletCredit: number
  totalPayment: number
}

/**
 * Fee calculation is owned by the backend fee service, never computed here —
 * this hook only displays what /funding-requests/quote returns.
 */
export function useFundingQuote(amount: number, method: FundingMethod) {
  return useQuery({
    queryKey: ["funding", "quote", amount, method],
    queryFn: async () =>
      (await apiClient.get<FundingQuote>("/funding-requests/quote", { params: { amount, method } })).data,
    enabled: amount > 0,
  })
}
