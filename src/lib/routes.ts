export const routes = {
  home: "/",
  signUp: "/sign-up",
  login: "/login",
  payLink: (token: string) => `/pay/${token}`,

  app: {
    root: "/app",
    dashboard: "/app",
    kyc: "/app/kyc",
    kycStatus: "/app/kyc/status",
    wallet: "/app/wallet",
    addMoney: "/app/add-money",
    addMoneyCreditCard: "/app/add-money/credit-card",
    addMoneyUpi: "/app/add-money/upi",
    addMoneyBankTransfer: "/app/add-money/bank-transfer",
    fundingRequest: (id: string) => `/app/funding-requests/${id}`,
    fundingRequestSuccess: (id: string) => `/app/funding-requests/${id}/success`,
    transactions: "/app/transactions",
    transaction: (id: string) => `/app/transactions/${id}`,
    services: "/app/services",
    cardToBank: "/app/services/card-to-bank",
    profile: "/app/profile",
    support: "/app/support",
  },

  operations: {
    root: "/operations",
    overview: "/operations",
    requests: "/operations/requests",
    fundingQueue: "/operations/funding",
    fundingDetail: (id: string) => `/operations/funding/${id}`,
    kycQueue: "/operations/kyc",
    kycDetail: (id: string) => `/operations/kyc/${id}`,
    customers: "/operations/customers",
    wallets: "/operations/wallets",
    transactions: "/operations/transactions",
    reconciliation: "/operations/reconciliation",
    support: "/operations/support",
    reports: "/operations/reports",
  },

  admin: {
    root: "/admin",
    dashboard: "/admin",
    requests: "/admin/requests",
    customers: "/admin/customers",
    operationsUsers: "/admin/operations",
    funding: "/admin/funding",
    wallets: "/admin/wallets",
    transactions: "/admin/transactions",
    kyc: "/admin/kyc",
    paymentMethods: "/admin/payment-methods",
    fees: "/admin/fees",
    limits: "/admin/limits",
    roles: "/admin/roles",
    reports: "/admin/reports",
    reconciliation: "/admin/reconciliation",
    auditLogs: "/admin/audit-logs",
    settings: "/admin/settings",
  },
} as const

export type RouteRole = "CUSTOMER" | "OPERATIONS" | "SUPER_ADMIN"

/** Landing area for each role after sign-in. */
export function homeForRole(role: RouteRole): string {
  if (role === "SUPER_ADMIN") return routes.admin.root
  if (role === "OPERATIONS") return routes.operations.root
  return routes.app.root
}

/** True when `path` sits inside the area that `role` is allowed to use. */
export function pathAllowedForRole(path: string, role: RouteRole): boolean {
  const root = homeForRole(role)
  return path === root || path.startsWith(`${root}/`)
}
