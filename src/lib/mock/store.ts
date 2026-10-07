/**
 * In-memory "backend" for demo/showcase deployments (e.g. a Netlify preview
 * with no API server behind it). Mirrors the real backend's domain model —
 * ledger-derived balances, the funding-request state machine, fee rules —
 * so swapping this out for the real API later (lib/mock/server.ts is the
 * only thing that wires it in) changes nothing about how the UI behaves.
 *
 * State resets on a full page reload. That's intentional: this is a
 * walkthrough aid, not a persistence layer.
 */

import type {
  FundingMethod,
  FundingRequest,
  FundingStatus,
  KycProfile,
  Role,
  Transaction,
  User,
  WalletLedgerEntry,
} from "@/types/domain"

export interface MockUser extends User {
  password: string
  mobileNumber: string
}

/** Backend's FundingRequest model has review_notes; the customer-facing API
 * type in types/domain.ts doesn't expose it (no page reads it today), but
 * we track it here for parity and in case a future screen wants it. */
export interface MockFundingRequest extends FundingRequest {
  reviewNotes?: string
}

interface WalletRecord {
  id: string
  userId: string
  walletNumber: string
}

interface SupportTicketRecord {
  id: string
  customerId: string
  subject: string
  message: string
  status: "OPEN" | "PENDING" | "COMPLETED"
  createdAt: string
}

function uid(): string {
  return crypto.randomUUID()
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursAgo(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

function stamp(prefix: string): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase()
  return `${prefix}-${yy}${mm}${dd}-${rand}`
}

export const METHOD_LABEL: Record<FundingMethod, string> = {
  CREDIT_CARD: "Credit Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users: MockUser[] = [
  {
    id: "user-rahul",
    fullName: "Rahul Sharma",
    email: "customer@nexpro.test",
    mobileNumber: "9876543210",
    role: "CUSTOMER",
    kycStatus: "APPROVED",
    createdAt: daysAgo(40),
    password: "Password123",
  },
  {
    id: "user-ananya",
    fullName: "Ananya Singh",
    email: "ananya.singh@example.test",
    mobileNumber: "9876500001",
    role: "CUSTOMER",
    kycStatus: "UNDER_REVIEW",
    createdAt: daysAgo(12),
    password: "Password123",
  },
  {
    id: "user-arjun",
    fullName: "Arjun Mehta",
    email: "arjun.mehta@example.test",
    mobileNumber: "9876500002",
    role: "CUSTOMER",
    kycStatus: "NOT_STARTED",
    createdAt: daysAgo(3),
    password: "Password123",
  },
  {
    id: "user-neha",
    fullName: "Neha Patel",
    email: "neha.patel@example.test",
    mobileNumber: "9876500003",
    role: "CUSTOMER",
    kycStatus: "APPROVED",
    createdAt: daysAgo(60),
    password: "Password123",
  },
  {
    id: "user-priya",
    fullName: "Priya Nair",
    email: "ops@nexpro.test",
    mobileNumber: "9999900001",
    role: "OPERATIONS",
    kycStatus: "NOT_STARTED",
    createdAt: daysAgo(200),
    password: "Password123",
  },
  {
    id: "user-admin",
    fullName: "Nexpro Admin",
    email: "admin@nexpro.test",
    mobileNumber: "9999900002",
    role: "SUPER_ADMIN",
    kycStatus: "NOT_STARTED",
    createdAt: daysAgo(400),
    password: "Password123",
  },
]

function findUser(id: string): MockUser {
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error(`mock: unknown user ${id}`)
  return user
}

// ---------------------------------------------------------------------------
// Wallets + ledger (source of truth for balances — never a mutable field)
// ---------------------------------------------------------------------------

export const wallets: WalletRecord[] = users
  .filter((u) => u.role === "CUSTOMER")
  .map((u) => ({ id: uid(), userId: u.id, walletNumber: `NXP-${u.id.slice(-6).toUpperCase().padStart(8, "0")}` }))

export const ledgerEntries: WalletLedgerEntry[] = []

function walletFor(userId: string): WalletRecord {
  const wallet = wallets.find((w) => w.userId === userId)
  if (!wallet) throw new Error(`mock: no wallet for user ${userId}`)
  return wallet
}

export function getAvailableBalance(userId: string): number {
  const wallet = walletFor(userId)
  return ledgerEntries
    .filter((e) => e.walletId === wallet.id && e.status === "POSTED")
    .reduce((sum, e) => sum + (e.direction === "CREDIT" ? e.amount : -e.amount), 0)
}

export function getPendingBalance(userId: string): number {
  const wallet = walletFor(userId)
  return ledgerEntries
    .filter((e) => e.walletId === wallet.id && e.status === "PENDING")
    .reduce((sum, e) => sum + (e.direction === "CREDIT" ? e.amount : -e.amount), 0)
}

function postPendingCredit(userId: string, amount: number, reference: string, transactionId: string, entryType: string) {
  ledgerEntries.push({
    id: uid(),
    walletId: walletFor(userId).id,
    transactionId,
    entryType,
    direction: "CREDIT",
    amount,
    status: "PENDING",
    reference,
    createdAt: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// Fee rules (mirrors Backend/app/services/fee_service.py)
// ---------------------------------------------------------------------------

export function calculateFee(method: FundingMethod, amount: number): number {
  if (method !== "CREDIT_CARD") return 0
  const raw = Math.round(amount * 0.02)
  return Math.min(Math.max(raw, 99), 2000)
}

// ---------------------------------------------------------------------------
// Funding requests + transactions
// ---------------------------------------------------------------------------

export const fundingRequests: MockFundingRequest[] = []
export const transactions: Transaction[] = []
export const paymentDetailsByRequest = new Map<string, Record<string, unknown>>()

function seedFundingRequest(opts: {
  customerId: string
  method: FundingMethod
  amount: number
  status: FundingStatus
  createdAt: string
  reviewNotes?: string
  posted?: boolean
}) {
  const customer = findUser(opts.customerId)
  const fee = calculateFee(opts.method, opts.amount)
  const reference = `NXP-${customer.mobileNumber.slice(-5)}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`
  const requestId = uid()
  const txnId = uid()

  const request: FundingRequest = {
    id: requestId,
    requestNumber: stamp("FR"),
    customerId: customer.id,
    customerName: customer.fullName,
    method: opts.method,
    requestedAmount: opts.amount,
    fee,
    walletCredit: opts.amount,
    status: opts.status,
    paymentStatus:
      opts.status === "APPROVED" ? "CAPTURED" : opts.status === "REJECTED" ? "FAILED" : "PENDING",
    reference,
    assignedTo: null,
    createdAt: opts.createdAt,
    updatedAt: opts.createdAt,
  }
  fundingRequests.push(request)

  transactions.push({
    id: txnId,
    transactionNumber: stamp("TXN"),
    type: "FUNDING",
    amount: opts.amount,
    fee,
    status: opts.status === "APPROVED" ? "COMPLETED" : opts.status === "REJECTED" ? "FAILED" : "PENDING",
    method: opts.method,
    reference,
    description: `Wallet Funding via ${METHOD_LABEL[opts.method]}`,
    createdAt: opts.createdAt,
    updatedAt: opts.createdAt,
  })

  if (opts.posted || opts.status === "APPROVED") {
    ledgerEntries.push({
      id: uid(),
      walletId: walletFor(customer.id).id,
      transactionId: txnId,
      entryType: "FUNDING_CREDIT",
      direction: "CREDIT",
      amount: opts.amount,
      status: "POSTED",
      reference,
      createdAt: opts.createdAt,
    })
  } else if (opts.status === "PENDING" || opts.status === "UNDER_REVIEW" || opts.status === "ADDITIONAL_INFORMATION_REQUIRED") {
    postPendingCredit(customer.id, opts.amount, reference, txnId, "FUNDING_CREDIT")
  }

  return request
}

// Seed: Rahul — the primary demo walkthrough account — ₹75,000 available,
// ₹25,000 pending, exactly matching the product brief's dashboard example.
seedFundingRequest({ customerId: "user-rahul", method: "BANK_TRANSFER", amount: 75000, status: "APPROVED", createdAt: daysAgo(5), posted: true })
seedFundingRequest({ customerId: "user-rahul", method: "UPI", amount: 25000, status: "UNDER_REVIEW", createdAt: hoursAgo(6) })
seedFundingRequest({
  customerId: "user-rahul",
  method: "CREDIT_CARD",
  amount: 5000,
  status: "REJECTED",
  createdAt: daysAgo(2),
  reviewNotes: "Payment reference could not be verified.",
})

// Seed: a few other customers' wallets + in-flight requests, so Operations
// screens have more than one row to review.
seedFundingRequest({ customerId: "user-neha", method: "BANK_TRANSFER", amount: 10000, status: "APPROVED", createdAt: daysAgo(20), posted: true })
seedFundingRequest({ customerId: "user-neha", method: "BANK_TRANSFER", amount: 8000, status: "UNDER_REVIEW", createdAt: daysAgo(1) })
seedFundingRequest({ customerId: "user-ananya", method: "CREDIT_CARD", amount: 15000, status: "PENDING", createdAt: hoursAgo(2) })

for (const req of fundingRequests) {
  if (req.status === "REJECTED") {
    req.reviewNotes = "Payment reference could not be verified."
  }
}

function findRequest(id: string): MockFundingRequest {
  const req = fundingRequests.find((r) => r.id === id)
  if (!req) throw new Error(`mock: unknown funding request ${id}`)
  return req
}

function findTransactionByReference(reference: string): Transaction | undefined {
  return transactions.find((t) => t.reference === reference)
}

const FUNDING_TRANSITIONS: Record<FundingStatus, FundingStatus[]> = {
  PENDING: ["UNDER_REVIEW", "CANCELLED", "FAILED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "ADDITIONAL_INFORMATION_REQUIRED"],
  ADDITIONAL_INFORMATION_REQUIRED: ["UNDER_REVIEW"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
  FAILED: [],
}

class MockConflictError extends Error {}

function ensureTransition(current: FundingStatus, target: FundingStatus) {
  if (!FUNDING_TRANSITIONS[current].includes(target)) {
    throw new MockConflictError(
      `This request is already ${current.toLowerCase().replace(/_/g, " ")} and cannot be changed again.`
    )
  }
}

export function createFundingRequest(
  customerId: string,
  method: FundingMethod,
  amount: number,
  paymentDetails: Record<string, unknown>,
  proofFileName?: string
): MockFundingRequest {
  const request = seedFundingRequest({ customerId, method, amount, status: "PENDING", createdAt: new Date().toISOString() })
  paymentDetailsByRequest.set(request.id, { ...paymentDetails, proofFileName })
  return request
}

export function markUnderReview(id: string): MockFundingRequest {
  const req = findRequest(id)
  if (req.status === "PENDING") {
    req.status = "UNDER_REVIEW"
    req.updatedAt = new Date().toISOString()
  }
  return req
}

const consumedIdempotencyKeys = new Set<string>()

export function approveFundingRequest(id: string, idempotencyKey: string): MockFundingRequest {
  if (consumedIdempotencyKeys.has(idempotencyKey)) {
    throw new MockConflictError("This approval has already been processed.")
  }
  consumedIdempotencyKeys.add(idempotencyKey)

  const req = findRequest(id)
  ensureTransition(req.status, "APPROVED")

  req.status = "APPROVED"
  req.paymentStatus = "CAPTURED"
  req.updatedAt = new Date().toISOString()

  const txn = findTransactionByReference(req.reference)
  if (txn) {
    txn.status = "COMPLETED"
    txn.updatedAt = req.updatedAt
  }

  const wallet = walletFor(req.customerId)
  const pendingEntry = ledgerEntries.find(
    (e) => e.walletId === wallet.id && e.reference === req.reference && e.status === "PENDING"
  )
  if (pendingEntry) pendingEntry.status = "POSTED"

  return req
}

export function rejectFundingRequest(id: string, reason: string): MockFundingRequest {
  const req = findRequest(id)
  ensureTransition(req.status, "REJECTED")

  req.status = "REJECTED"
  req.paymentStatus = "FAILED"
  req.reviewNotes = reason
  req.updatedAt = new Date().toISOString()

  const txn = findTransactionByReference(req.reference)
  if (txn) {
    txn.status = "FAILED"
    txn.updatedAt = req.updatedAt
  }

  const wallet = walletFor(req.customerId)
  const pendingEntry = ledgerEntries.find(
    (e) => e.walletId === wallet.id && e.reference === req.reference && e.status === "PENDING"
  )
  if (pendingEntry) pendingEntry.status = "REVERSED"

  return req
}

export function requestAdditionalInformation(id: string, message: string): MockFundingRequest {
  const req = findRequest(id)
  ensureTransition(req.status, "ADDITIONAL_INFORMATION_REQUIRED")
  req.status = "ADDITIONAL_INFORMATION_REQUIRED"
  req.reviewNotes = message
  req.updatedAt = new Date().toISOString()
  return req
}

export { MockConflictError }

// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

export const kycProfiles = new Map<string, KycProfile>(
  users
    .filter((u) => u.role === "CUSTOMER")
    .map((u) => [
      u.id,
      {
        id: uid(),
        customerId: u.id,
        status: u.kycStatus,
        submittedAt: u.kycStatus === "NOT_STARTED" ? undefined : daysAgo(10),
        personalInfo:
          u.kycStatus === "NOT_STARTED"
            ? undefined
            : { dateOfBirth: "1992-04-18", address: "221B Residency Road", city: "Bengaluru", state: "Karnataka", pinCode: "560025" },
        documents:
          u.kycStatus === "NOT_STARTED"
            ? []
            : [
                { id: uid(), type: "ID_PROOF" as const, fileName: "aadhaar.pdf", status: "APPROVED" as const, uploadedAt: daysAgo(10) },
                { id: uid(), type: "ADDRESS_PROOF" as const, fileName: "utility-bill.pdf", status: "APPROVED" as const, uploadedAt: daysAgo(10) },
                { id: uid(), type: "PAN" as const, fileName: "pan-card.jpg", status: "APPROVED" as const, uploadedAt: daysAgo(10) },
              ],
        bankAccount:
          u.kycStatus === "NOT_STARTED"
            ? undefined
            : { accountHolderName: u.fullName, accountNumberMasked: "XXXXXXXX4821", ifsc: "HDFC0001234" },
      },
    ])
)

export function submitKyc(
  customerId: string,
  personalInfo: Record<string, string>,
  bankAccount: Record<string, string>,
  documentNames: Record<string, string>
): KycProfile {
  const profile: KycProfile = {
    id: uid(),
    customerId,
    status: "UNDER_REVIEW",
    submittedAt: new Date().toISOString(),
    personalInfo: {
      dateOfBirth: personalInfo.dateOfBirth ?? "",
      address: personalInfo.address ?? "",
      city: personalInfo.city ?? "",
      state: personalInfo.state ?? "",
      pinCode: personalInfo.pinCode ?? "",
    },
    documents: Object.entries(documentNames).map(([field, fileName]) => ({
      id: uid(),
      type: field === "idProof" ? "ID_PROOF" : field === "addressProof" ? "ADDRESS_PROOF" : "PAN",
      fileName,
      status: "SUBMITTED",
      uploadedAt: new Date().toISOString(),
    })),
    bankAccount: {
      accountHolderName: bankAccount.accountHolderName ?? "",
      accountNumberMasked: bankAccount.accountNumber ? `XXXXXXXX${bankAccount.accountNumber.slice(-4)}` : "",
      bankName: bankAccount.bankName ?? "",
      ifsc: bankAccount.ifsc ?? "",
    },
  }
  kycProfiles.set(customerId, profile)
  const user = findUser(customerId)
  user.kycStatus = "UNDER_REVIEW"
  return profile
}

// ---------------------------------------------------------------------------
// Support tickets
// ---------------------------------------------------------------------------

export const supportTickets: SupportTicketRecord[] = [
  {
    id: uid(),
    customerId: "user-rahul",
    subject: "Question about processing fee",
    message: "Why was a fee charged on my credit card top-up?",
    status: "COMPLETED",
    createdAt: daysAgo(15),
  },
]

export function createSupportTicket(customerId: string, subject: string, message: string): SupportTicketRecord {
  const ticket: SupportTicketRecord = { id: uid(), customerId, subject, message, status: "OPEN", createdAt: new Date().toISOString() }
  supportTickets.push(ticket)
  return ticket
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

let currentUserId: string | null = null

export function login(identifier: string, password: string): MockUser | null {
  const user = users.find((u) => (u.email === identifier || u.mobileNumber === identifier) && u.password === password)
  if (!user) return null
  currentUserId = user.id
  return user
}

export function logout(): void {
  currentUserId = null
}

export function getCurrentUser(): MockUser | null {
  return currentUserId ? (users.find((u) => u.id === currentUserId) ?? null) : null
}

export function signUp(fullName: string, email: string, mobileNumber: string, password: string): MockUser {
  const existing = users.find((u) => u.email === email || u.mobileNumber === mobileNumber)
  if (existing) throw new Error("An account with this email or mobile number already exists.")

  const user: MockUser = {
    id: uid(),
    fullName,
    email,
    mobileNumber,
    role: "CUSTOMER",
    kycStatus: "NOT_STARTED",
    createdAt: new Date().toISOString(),
    password,
  }
  users.push(user)
  wallets.push({ id: uid(), userId: user.id, walletNumber: `NXP-${user.id.slice(-8).toUpperCase()}` })
  kycProfiles.set(user.id, { id: uid(), customerId: user.id, status: "NOT_STARTED", documents: [] })
  return user
}

export function requireRole(roles: Role[]): MockUser {
  const user = getCurrentUser()
  if (!user) {
    const err = new Error("Please sign in to continue.")
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  if (!roles.includes(user.role)) {
    const err = new Error("You do not have permission to perform this action.")
    ;(err as Error & { status: number }).status = 403
    throw err
  }
  return user
}
