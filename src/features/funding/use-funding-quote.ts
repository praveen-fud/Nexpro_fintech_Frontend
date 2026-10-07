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
    queryFn: async () => {
      // The API serialises Decimals as strings; normalise once here so every
      // consumer gets real numbers (otherwise `amount + fee` concatenates).
      const raw = (await apiClient.get<Record<keyof FundingQuote, string | number>>("/funding-requests/quote", {
        params: { amount, method },
      })).data
      return {
        requestedAmount: Number(raw.requestedAmount),
        fee: Number(raw.fee),
        walletCredit: Number(raw.walletCredit),
        totalPayment: Number(raw.totalPayment),
      } satisfies FundingQuote
    },
    enabled: amount > 0,
  })
}
