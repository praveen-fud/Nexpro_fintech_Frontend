import MockAdapter from "axios-mock-adapter"
import { apiClient } from "@/lib/api-client"
import type { FundingMethod, FundingStatus, Role } from "@/types/domain"
import {
  MockConflictError,
  METHOD_LABEL,
  approveFundingRequest,
  calculateFee,
  createFundingRequest,
  createSupportTicket,
  fundingRequests,
  getAvailableBalance,
  getCurrentUser,
  getPendingBalance,
  kycProfiles,
  ledgerEntries,
  login,
  logout,
  markUnderReview,
  paymentDetailsByRequest,
  rejectFundingRequest,
  requestAdditionalInformation,
  requireRole,
  signUp,
  submitKyc,
  supportTickets,
  transactions,
  users,
  wallets,
  type MockUser,
} from "./store"

type ReplyTuple = [number, unknown] | [number, unknown, Record<string, string>]

function ok(data: unknown): ReplyTuple {
  return [200, data]
}

function fail(status: number, message: string): ReplyTuple {
  return [status, { message }]
}

/** Wraps a handler so requireRole()/MockConflictError throws turn into the
 * same {message} error shape the real backend (and ApiError) expects. */
function guarded(roles: Role[], handler: (user: MockUser, config: import("axios").AxiosRequestConfig) => ReplyTuple) {
  return (config: import("axios").AxiosRequestConfig): ReplyTuple => {
    try {
      const user = requireRole(roles)
      return handler(user, config)
    } catch (err) {
      if (err instanceof MockConflictError) return fail(409, err.message)
      const status = (err as { status?: number }).status ?? 400
      return fail(status, err instanceof Error ? err.message : "Something went wrong.")
    }
  }
}

/** Axios v1 wraps config.headers in an AxiosHeaders instance (case-insensitive
 * .get()) in most code paths, but it can still be a plain object — handle both. */
function getHeader(config: import("axios").AxiosRequestConfig, name: string): string | undefined {
  const headers = config.headers as unknown as { get?: (n: string) => string | undefined } | Record<string, string> | undefined
  if (!headers) return undefined
  if (typeof (headers as { get?: unknown }).get === "function") {
    return (headers as { get: (n: string) => string | undefined }).get(name) ?? undefined
  }
  const dict = headers as Record<string, string>
  return dict[name] ?? dict[name.toLowerCase()] ?? dict[name.toUpperCase()]
}

function parseBody(config: import("axios").AxiosRequestConfig): Record<string, any> {
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data)
    } catch {
      return {}
    }
  }
  return (config.data as Record<string, any>) ?? {}
}

function newToken(): string {
  return `demo.${crypto.randomUUID()}`
}

function userResponse(user: MockUser) {
  const { password: _password, ...rest } = user
  return rest
}

function walletResponse(user: MockUser) {
  const wallet = wallets.find((w) => w.userId === user.id)!
  return {
    id: wallet.id,
    walletId: wallet.walletNumber,
    availableBalance: getAvailableBalance(user.id),
    pendingBalance: getPendingBalance(user.id),
    currency: "INR" as const,
    updatedAt: new Date().toISOString(),
  }
}

function fundingRequestResponse(req: (typeof fundingRequests)[number]) {
  return { ...req }
}

const OPERATIONS_ROLES: Role[] = ["OPERATIONS", "SUPER_ADMIN"]

export function startMockServer(): void {
  const mock = new MockAdapter(apiClient, { delayResponse: 350 })

  // --- auth --------------------------------------------------------------
  mock.onPost("/auth/sign-up").reply((config) => {
    const body = parseBody(config)
    try {
      const user = signUp(body.fullName, body.email, body.mobileNumber, body.password)
      return [201, userResponse(user)]
    } catch (err) {
      return fail(409, err instanceof Error ? err.message : "Could not create account.")
    }
  })

  mock.onPost("/auth/verify-otp").reply(() => [204, null])

  mock.onPost("/auth/login").reply((config) => {
    const body = parseBody(config)
    const user = login(body.identifier, body.password)
    if (!user) return fail(401, "Incorrect email/mobile number or password.")
    return ok({ accessToken: newToken(), user: userResponse(user) })
  })

  mock.onPost("/auth/refresh").reply(() => {
    const user = getCurrentUser()
    if (!user) return fail(401, "Session expired. Please sign in again.")
    return ok({ accessToken: newToken() })
  })

  // Idle-timeout heartbeat — the mock session never idles out server-side.
  mock.onPost("/auth/heartbeat").reply(() => [204, null])

  mock.onPost("/auth/logout").reply(() => {
    logout()
    return [204, null]
  })

  // --- users ---------------------------------------------------------------
  mock.onGet("/users/me").reply(
    guarded(["CUSTOMER", "OPERATIONS", "SUPER_ADMIN"], (user) => ok(userResponse(user)))
  )

  // --- wallet --------------------------------------------------------------
  mock.onGet("/wallet/me").reply(guarded(["CUSTOMER"], (user) => ok(walletResponse(user))))

  mock.onGet("/wallet/ledger").reply(
    guarded(["CUSTOMER"], (user) => {
      const wallet = wallets.find((w) => w.userId === user.id)!
      const entries = ledgerEntries
        .filter((e) => e.walletId === wallet.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      return ok(entries)
    })
  )

  // --- kyc -------------------------------------------------------------------
  mock.onGet("/kyc/me").reply(
    guarded(["CUSTOMER"], (user) => {
      const profile = kycProfiles.get(user.id) ?? { id: crypto.randomUUID(), customerId: user.id, status: "NOT_STARTED", documents: [] }
      return ok(profile)
    })
  )

  mock.onPost("/kyc/submit").reply(
    guarded(["CUSTOMER"], (user, config) => {
      const formData = config.data as FormData
      const personalInfo = JSON.parse((formData.get("personalInfo") as string) ?? "{}")
      const bankAccount = JSON.parse((formData.get("bankAccount") as string) ?? "{}")
      const documentNames: Record<string, string> = {}
      for (const field of ["idProof", "addressProof", "panCard"]) {
        const file = formData.get(field) as File | null
        if (file) documentNames[field] = file.name
      }
      const profile = submitKyc(user.id, personalInfo, bankAccount, documentNames)
      return [201, profile]
    })
  )

  // --- funding requests (customer) -------------------------------------------
  mock.onGet("/funding-requests/quote").reply(
    guarded(["CUSTOMER"], (_user, config) => {
      const amount = Number(config.params?.amount)
      const method = config.params?.method as FundingMethod
      if (!amount || amount <= 0) return fail(400, "Enter an amount greater than zero.")
      const fee = calculateFee(method, amount)
      return ok({ requestedAmount: amount, fee, walletCredit: amount, totalPayment: amount + fee })
    })
  )

  mock.onGet("/funding-requests/bank-transfer/beneficiary").reply(
    guarded(["CUSTOMER"], (user) =>
      ok({
        accountName: "Nexpro Paytech Pvt Ltd",
        accountNumberMasked: "XXXXXXXX4821",
        ifsc: "NXPR0000001",
        reference: `NXP-${user.mobileNumber.slice(-5)}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
      })
    )
  )

  mock.onPost("/funding-requests").reply(
    guarded(["CUSTOMER"], (user, config) => {
      let method: FundingMethod
      let amount: number
      let paymentDetails: Record<string, unknown> = {}
      let proofFileName: string | undefined

      if (config.data instanceof FormData) {
        const formData = config.data
        method = formData.get("method") as FundingMethod
        amount = Number(formData.get("amount"))
        paymentDetails = JSON.parse((formData.get("paymentDetails") as string) ?? "{}")
        const proof = formData.get("proof") as File | null
        proofFileName = proof?.name
      } else {
        const body = parseBody(config)
        method = body.method
        amount = Number(body.amount)
        paymentDetails = body.paymentDetails ?? {}
      }

      if (!amount || amount < 100 || amount > 200000) {
        return fail(400, "Amount must be between ₹100 and ₹2,00,000.")
      }

      const request = createFundingRequest(user.id, method, amount, paymentDetails, proofFileName)
      return [201, fundingRequestResponse(request)]
    })
  )

  mock.onGet(/^\/funding-requests\/[^/]+$/).reply(
    guarded(["CUSTOMER"], (user, config) => {
      const id = config.url!.split("/").pop()!
      const request = fundingRequests.find((r) => r.id === id)
      if (!request || request.customerId !== user.id) return fail(404, "Funding request not found.")
      return ok(fundingRequestResponse(request))
    })
  )

  // --- transactions ------------------------------------------------------
  mock.onGet("/transactions").reply(
    guarded(["CUSTOMER"], (user, config) => {
      const ownRequestIds = new Set(fundingRequests.filter((r) => r.customerId === user.id).map((r) => r.reference))
      let items = transactions.filter((t) => ownRequestIds.has(t.reference))
      const type = config.params?.type
      const status = config.params?.status
      if (type) items = items.filter((t) => t.type === type)
      if (status) items = items.filter((t) => t.status === status)
      items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const limit = Number(config.params?.limit) || 50
      return ok(items.slice(0, limit))
    })
  )

  mock.onGet(/^\/transactions\/[^/]+$/).reply(
    guarded(["CUSTOMER"], (user, config) => {
      const id = config.url!.split("/").pop()!
      const txn = transactions.find((t: { id: string }) => t.id === id)
      const ownRequestIds = new Set(fundingRequests.filter((r) => r.customerId === user.id).map((r) => r.reference))
      if (!txn || !ownRequestIds.has(txn.reference)) return fail(404, "Transaction not found.")
      return ok(txn)
    })
  )

  // --- limits --------------------------------------------------------------
  mock.onGet("/limits/me").reply(
    guarded(["CUSTOMER"], () => ok({ perTransaction: 200000, daily: 500000, monthly: 2000000 }))
  )

  // --- support -------------------------------------------------------------
  mock.onGet("/support/tickets").reply(
    guarded(["CUSTOMER"], (user) => {
      const tickets = supportTickets
        .filter((t) => t.customerId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      return ok(tickets)
    })
  )

  mock.onPost("/support/tickets").reply(
    guarded(["CUSTOMER"], (user, config) => {
      const body = parseBody(config)
      const ticket = createSupportTicket(user.id, body.subject, body.message)
      return [201, ticket]
    })
  )

  // --- operations ------------------------------------------------------------
  mock.onGet("/operations/overview").reply(
    guarded(OPERATIONS_ROLES, () => {
      const openStatuses: FundingStatus[] = ["PENDING", "UNDER_REVIEW"]
      const pendingFunding = fundingRequests
        .filter((r) => openStatuses.includes(r.status))
        .reduce((sum, r) => sum + r.requestedAmount, 0)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const approvedToday = fundingRequests.filter(
        (r) => r.status === "APPROVED" && new Date(r.updatedAt) >= todayStart
      ).length

      const totalFundingVolume = fundingRequests
        .filter((r) => r.status === "APPROVED")
        .reduce((sum, r) => sum + r.requestedAmount, 0)

      const kycPending = users.filter((u) => u.kycStatus === "SUBMITTED" || u.kycStatus === "UNDER_REVIEW").length
      const exceptions = fundingRequests.filter((r) => r.status === "ADDITIONAL_INFORMATION_REQUIRED").length

      const fundingVolumeByDay = Array.from({ length: 7 }).map((_, i) => {
        const day = new Date()
        day.setHours(0, 0, 0, 0)
        day.setDate(day.getDate() - (6 - i))
        const next = new Date(day)
        next.setDate(next.getDate() + 1)
        const amount = fundingRequests
          .filter((r) => {
            const created = new Date(r.createdAt)
            return created >= day && created < next
          })
          .reduce((sum, r) => sum + r.requestedAmount, 0)
        return { day: day.toLocaleDateString("en-US", { weekday: "short" }), amount }
      })

      const fundingByMethod = (Object.keys(METHOD_LABEL) as FundingMethod[])
        .map((method) => ({ method: METHOD_LABEL[method], value: fundingRequests.filter((r) => r.method === method).length }))
        .filter((m) => m.value > 0)

      const pendingCount = fundingRequests.filter((r) => openStatuses.includes(r.status)).length

      return ok({
        pendingFunding,
        approvedToday,
        totalFundingVolume,
        kycPending,
        exceptions,
        fundingVolumeByDay,
        fundingByMethod,
        needsAttention: [
          { label: "funding requests awaiting review", count: pendingCount, to: "/operations/funding" },
          { label: "KYC reviews pending", count: kycPending, to: "/operations/kyc" },
          { label: "requests needing more information", count: exceptions, to: "/operations/funding" },
        ],
      })
    })
  )

  mock.onGet("/operations/funding-requests").reply(
    guarded(OPERATIONS_ROLES, (_user, config) => {
      let items = [...fundingRequests]
      const status = config.params?.status
      const search = (config.params?.search as string | undefined)?.toLowerCase()
      if (status) items = items.filter((r) => r.status === status)
      if (search) {
        items = items.filter(
          (r) =>
            r.requestNumber.toLowerCase().includes(search) ||
            r.customerName.toLowerCase().includes(search) ||
            (users.find((u) => u.id === r.customerId)?.email.toLowerCase().includes(search) ?? false) ||
            (users.find((u) => u.id === r.customerId)?.mobileNumber.includes(search) ?? false)
        )
      }
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      return ok(items)
    })
  )

  mock.onGet(/^\/operations\/funding-requests\/[^/]+$/).reply(
    guarded(OPERATIONS_ROLES, (_user, config) => {
      const id = config.url!.split("/").pop()!
      const request = fundingRequests.find((r) => r.id === id)
      if (!request) return fail(404, "Funding request not found.")
      markUnderReview(id)

      const customer = users.find((u) => u.id === request.customerId)!
      const details = paymentDetailsByRequest.get(id) ?? {}
      const checklist = [
        customer.kycStatus === "APPROVED"
          ? { key: "kyc", label: "KYC Verified", result: "pass" }
          : customer.kycStatus === "UNDER_REVIEW" || customer.kycStatus === "SUBMITTED"
            ? { key: "kyc", label: "KYC Under Review", result: "warning", detail: "Not yet approved" }
            : { key: "kyc", label: "KYC Not Verified", result: "fail", detail: customer.kycStatus },
        details.upiId || details.maskedCard || details.referenceNumber
          ? {
              key: "payment",
              label: "Payment Evidence Received",
              result: "pass",
              detail: String(details.upiId ?? details.maskedCard ?? details.referenceNumber),
            }
          : { key: "payment", label: "Payment Evidence Missing", result: "fail" },
        { key: "amount", label: "Amount Matches Request", result: "pass", detail: `₹${request.requestedAmount.toLocaleString("en-IN")} requested` },
        { key: "reference", label: "Reference Matches", result: "pass", detail: request.reference },
        request.requestedAmount > 100000
          ? { key: "risk", label: "Risk Check", result: "warning", detail: "Large amount — review carefully" }
          : { key: "risk", label: "Risk Check", result: "pass", detail: "Within normal range" },
        ...(request.method === "BANK_TRANSFER"
          ? [
              details.proofFileName
                ? { key: "documents", label: "Supporting Documents", result: "pass" as const, detail: "Proof of transfer attached" }
                : { key: "documents", label: "Supporting Documents", result: "warning" as const, detail: "No proof uploaded" },
            ]
          : []),
      ]

      return ok({
        ...fundingRequests.find((r) => r.id === id)!,
        customer: {
          fullName: customer.fullName,
          email: customer.email,
          mobileNumber: customer.mobileNumber,
          kycStatus: customer.kycStatus,
          customerSince: customer.createdAt,
        },
        checklist,
      })
    })
  )

  mock.onPost(/^\/operations\/funding-requests\/[^/]+\/approve$/).reply(
    guarded(OPERATIONS_ROLES, (_user, config) => {
      const id = config.url!.split("/").slice(-2)[0]
      const key = getHeader(config, "Idempotency-Key")
      if (!key) return fail(400, "Missing Idempotency-Key header for this action.")
      const request = approveFundingRequest(id, key)
      return ok(fundingRequestResponse(request))
    })
  )

  mock.onPost(/^\/operations\/funding-requests\/[^/]+\/reject$/).reply(
    guarded(OPERATIONS_ROLES, (_user, config) => {
      const id = config.url!.split("/").slice(-2)[0]
      const body = parseBody(config)
      const request = rejectFundingRequest(id, body.reason)
      return ok(fundingRequestResponse(request))
    })
  )

  mock.onPost(/^\/operations\/funding-requests\/[^/]+\/request-information$/).reply(
    guarded(OPERATIONS_ROLES, (_user, config) => {
      const id = config.url!.split("/").slice(-2)[0]
      const body = parseBody(config)
      const request = requestAdditionalInformation(id, body.message)
      return ok(fundingRequestResponse(request))
    })
  )

  mock.onAny(/.*/).reply((config) => {
    console.warn(`[mock] Unhandled request: ${config.method?.toUpperCase()} ${config.url}`)
    return fail(404, "This demo endpoint isn't implemented yet.")
  })
}
