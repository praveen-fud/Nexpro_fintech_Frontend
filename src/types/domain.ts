/**
 * Core domain types shared across the Nexpro Fintech customer, operations,
 * and admin surfaces. These mirror the backend Pydantic response schemas —
 * keep them in sync with apps/Backend/app/schemas.
 */

export type Role = "CUSTOMER" | "OPERATIONS" | "SUPER_ADMIN"

export type FundingMethod = "CREDIT_CARD" | "UPI" | "BANK_TRANSFER"

export type FundingStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "FAILED"

export type PaymentStatus =
  | "INITIATED"
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED"
  | "REVERSED"

export type KycStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "APPROVED"
  | "REJECTED"

export type TransactionType = "FUNDING" | "PAYMENT" | "REFUND"

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED"

export type LedgerDirection = "CREDIT" | "DEBIT"

export interface User {
  id: string
  fullName: string
  email: string
  mobileNumber: string
  role: Role
  kycStatus: KycStatus
  createdAt: string
}

export interface Wallet {
  id: string
  walletId: string
  availableBalance: number
  pendingBalance: number
  currency: "INR"
  updatedAt: string
}

export interface WalletLedgerEntry {
  id: string
  walletId: string
  transactionId: string | null
  entryType: string
  direction: LedgerDirection
  amount: number
  status: string
  reference: string
  createdAt: string
}

export interface FundingRequest {
  id: string
  requestNumber: string
  customerId: string
  customerName: string
  method: FundingMethod
  requestedAmount: number
  fee: number
  walletCredit: number
  status: FundingStatus
  paymentStatus: PaymentStatus
  reference: string
  utr?: string | null
  hasProof?: boolean
  assignedTo?: string | null
  createdAt: string
  updatedAt: string
}

export interface FundingTimelineEvent {
  id: string
  label: string
  description?: string
  status: "complete" | "current" | "upcoming" | "rejected"
  timestamp?: string
}

export interface Transaction {
  id: string
  transactionNumber: string
  type: TransactionType
  amount: number
  fee: number
  status: TransactionStatus
  method?: FundingMethod
  reference: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface KycDocument {
  id: string
  type: "ID_PROOF" | "ADDRESS_PROOF" | "PAN" | "PHOTO" | "BANK_PROOF"
  fileName: string
  status: "SUBMITTED" | "APPROVED" | "REJECTED"
  uploadedAt: string
}

export interface KycProfile {
  id: string
  customerId: string
  status: KycStatus
  submittedAt?: string
  personalInfo?: {
    dateOfBirth: string
    address: string
    city: string
    state: string
    pinCode: string
  }
  documents: KycDocument[]
  bankAccount?: {
    accountHolderName: string
    accountNumberMasked: string
    bankName?: string
    ifsc: string
  }
  reviewNotes?: string
}

export interface Notification {
  id: string
  title: string
  description: string
  read: boolean
  createdAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
