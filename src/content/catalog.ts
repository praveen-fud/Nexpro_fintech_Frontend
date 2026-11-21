import {
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  Bus,
  Building2,
  CreditCard,
  Coins,
  Fingerprint,
  Globe2,
  Hotel,
  Landmark,
  Layers,
  Plane,
  Receipt,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Train,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react"

/**
 * The public catalogue — the single source of truth for what Nexpro Paytech
 * offers. The marketing nav, the Services page, the Products pages and the
 * in-app service list all read from here, so a service is described once.
 *
 * `status` is deliberate and load-bearing. Most of these are regulated
 * activities that run through a licensed partner (a sponsor bank, a BBPOU, an
 * RBI-authorised payment aggregator, an IRCTC agent). Until that partner is
 * contracted and integrated, a service is "coming-soon" and the UI says so
 * plainly rather than implying we can transact it today.
 *
 * `partnerNote` records what each one actually needs. It is internal planning
 * context for whoever picks the service up next — it is never rendered.
 */

export type ServiceStatus = "live" | "coming-soon"

export type ProductGroupId = "business-banking" | "travel" | "utility"

export interface CatalogEntry {
  slug: string
  name: string
  tagline: string
  description: string
  icon: LucideIcon
  status: ServiceStatus
  features: string[]
  /** Internal only — the licence or partner this depends on. Not rendered. */
  partnerNote?: string
}

export interface Product extends CatalogEntry {
  group: ProductGroupId
}

export const productGroups: { id: ProductGroupId; label: string; blurb: string }[] = [
  {
    id: "business-banking",
    label: "Business Banking",
    blurb: "Move money in and out, at business scale.",
  },
  {
    id: "travel",
    label: "Travel Platforms",
    blurb: "Sell travel from the same balance.",
  },
  {
    id: "utility",
    label: "Utility Platforms",
    blurb: "Verification, collections and digital assets.",
  },
]

export const products: Product[] = [
  // ── Business Banking ──────────────────────────────────────────────────────
  {
    slug: "payouts",
    name: "Payouts",
    group: "business-banking",
    tagline: "Pay vendors, staff and partners in bulk",
    description:
      "Send money out to many recipients at once — IMPS, NEFT and RTGS — with per-transfer status you can reconcile against your own records.",
    icon: Banknote,
    status: "coming-soon",
    partnerNote: "Needs RBI Payment Aggregator authorisation or a sponsor-bank payout partner.",
    features: [
      "Single and bulk transfers from one balance",
      "IMPS, NEFT and RTGS routing chosen per transfer",
      "Per-recipient status, not just a batch result",
      "Every transfer written to the same ledger as everything else",
    ],
  },
  {
    slug: "international-payments",
    name: "International Payments",
    group: "business-banking",
    tagline: "Collect and settle across currencies",
    description:
      "Accept payments from outside India and settle them into your account, with the paperwork a cross-border transaction actually requires.",
    icon: Globe2,
    status: "coming-soon",
    partnerNote: "Requires an AD-II partner and FEMA-compliant purpose-code handling.",
    features: [
      "Multi-currency collection",
      "Transparent conversion, quoted before you commit",
      "Purpose codes captured at the point of payment",
      "Settlement advice you can hand to your accountant",
    ],
  },
  {
    slug: "business-banking",
    name: "Business Banking",
    group: "business-banking",
    tagline: "Collections, balances and reconciliation",
    description:
      "One place to see money arriving, what it was for, and what is still unmatched — instead of a bank statement and a spreadsheet.",
    icon: Building2,
    status: "coming-soon",
    partnerNote: "Connected-banking APIs via sponsor bank; per-bank integration.",
    features: [
      "Virtual accounts that identify the payer automatically",
      "Live balance across connected accounts",
      "Auto-matching of receipts to invoices",
      "An exception queue for everything that did not match",
    ],
  },
  {
    slug: "pos",
    name: "POS Terminals",
    group: "business-banking",
    tagline: "Take card payments in person",
    description:
      "Card and contactless acceptance at the counter, with settlements landing in the same wallet as the rest of your money.",
    icon: ScanLine,
    status: "coming-soon",
    partnerNote: "Requires acquiring bank relationship and certified terminal supply.",
    features: [
      "Chip, swipe, contactless and QR on one device",
      "Settlement into your Nexpro balance",
      "Per-terminal and per-operator reporting",
      "Printed and digital receipts",
    ],
  },
  {
    slug: "payment-orchestration",
    name: "Payment Orchestration",
    group: "business-banking",
    tagline: "Route across gateways, automatically",
    description:
      "Use more than one gateway without building for each. Route by cost or success rate, and fail over when a provider degrades.",
    icon: Layers,
    status: "coming-soon",
    partnerNote: "Needs at least two PA/PG integrations before routing is meaningful.",
    features: [
      "One integration, several providers behind it",
      "Routing rules by method, amount or success rate",
      "Automatic retry on a different provider",
      "Side-by-side provider performance",
    ],
  },

  // ── Travel ────────────────────────────────────────────────────────────────
  {
    slug: "bus-booking",
    name: "Bus Booking",
    group: "travel",
    tagline: "Seats across operators and routes",
    description:
      "Search operators, pick seats from a live layout, and confirm instantly — paid from the wallet balance you already hold.",
    icon: Bus,
    status: "coming-soon",
    partnerNote: "Aggregator API contract required.",
    features: [
      "Verified operators across major routes",
      "Interactive seat selection",
      "Instant confirmation and e-ticket",
      "Cancellation and refund handling",
    ],
  },
  {
    slug: "hotel-booking",
    name: "Hotel Booking",
    group: "travel",
    tagline: "Stays for business and leisure",
    description: "Search, compare and book accommodation, with confirmation and invoice in one place.",
    icon: Hotel,
    status: "coming-soon",
    partnerNote: "Aggregator/GDS API contract required.",
    features: [
      "Wide property coverage across cities",
      "Compare on price, location and rating",
      "Instant confirmation with a GST invoice",
      "Clear cancellation terms before you book",
    ],
  },
  {
    slug: "flight-booking",
    name: "Flight Booking",
    group: "travel",
    tagline: "Domestic and international fares",
    description: "Compare fares across airlines, book, and manage the ticket afterwards — all from one balance.",
    icon: Plane,
    status: "coming-soon",
    partnerNote: "GDS or consolidator contract (Amadeus/TBO or equivalent).",
    features: [
      "Fares compared across airlines",
      "Domestic and international routes",
      "Instant ticketing and PNR",
      "Date changes and cancellations",
    ],
  },

  // ── Utility ───────────────────────────────────────────────────────────────
  {
    slug: "verify",
    name: "Verify",
    group: "utility",
    tagline: "Identity and business verification",
    description:
      "Check that a person, a business or a bank account is what it claims to be — before you onboard it or pay it.",
    icon: Fingerprint,
    status: "coming-soon",
    partnerNote: "Needs a KYC/KYB data partner; Aadhaar checks require AUA/KUA licensing.",
    features: [
      "PAN, GSTIN and company verification",
      "Bank account and IFSC validation via penny-drop",
      "Document checks with tamper detection",
      "A risk signal, not just a pass or fail",
    ],
  },
  {
    slug: "collections",
    name: "Collections",
    group: "utility",
    tagline: "Get paid, and know who paid",
    description:
      "Issue collection references, track what has landed against each one, and chase what has not — without manual matching.",
    icon: Receipt,
    status: "coming-soon",
    partnerNote: "Virtual-account issuance via sponsor bank.",
    features: [
      "A unique reference per customer or invoice",
      "Automatic matching of incoming payments",
      "Ageing and outstanding views",
      "Reminders on what is overdue",
    ],
  },
  {
    slug: "gold-silver",
    name: "Digital Gold & Silver",
    group: "utility",
    tagline: "Buy, hold and sell by the gram",
    description:
      "Buy gold and silver digitally in small amounts, held in insured vaults, sellable back at a live quoted rate.",
    icon: Coins,
    status: "coming-soon",
    partnerNote: "Vault partner (Augmont/SafeGold); review SEBI/consumer-protection position.",
    features: [
      "Buy from small ticket sizes",
      "Live buy and sell rates, quoted before you confirm",
      "Insured third-party vault storage",
      "Sell back to the wallet at any time",
    ],
  },
]

/**
 * The Services page. Where a service overlaps a product (travel, pay-in/
 * pay-out) it is described from the user's point of view here, and from the
 * capability point of view in `products`.
 */
export type ServiceCategory = "payments" | "banking" | "travel" | "utility"

export interface Service extends CatalogEntry {
  category: ServiceCategory
}

export const serviceCategories: { id: ServiceCategory; label: string }[] = [
  { id: "payments", label: "Payments" },
  { id: "banking", label: "Banking" },
  { id: "travel", label: "Travel" },
  { id: "utility", label: "Utility" },
]

export const services: Service[] = [
  {
    slug: "add-money",
    name: "Add Money",
    category: "payments",
    tagline: "Fund your wallet three ways",
    description:
      "Top up by credit card, UPI or bank transfer. Card payments are confirmed with the provider before anything is credited; UPI and bank transfers are checked against your payment evidence by our Operations team.",
    icon: Wallet,
    status: "live",
    features: [
      "Credit card, UPI and bank transfer",
      "Fees shown before you commit, never after",
      "Every credit posted to an append-only ledger",
      "Full status trail on every request",
    ],
  },
  {
    slug: "card-to-bank",
    name: "Card to Bank",
    category: "payments",
    tagline: "Move card funds to a bank account",
    description:
      "Transfer from a supported card to a verified bank account, with the rate and fee quoted up front.",
    icon: ArrowLeftRight,
    status: "live",
    features: [
      "Quoted rate before you confirm",
      "Transfers only to verified accounts",
      "Clear, itemised fee breakdown",
      "Tracked end to end",
    ],
  },
  {
    slug: "payin-payout",
    name: "Pay-In / Pay-Out",
    category: "banking",
    tagline: "Money in and money out, at volume",
    description:
      "Collect from many payers and pay out to many recipients, with reconciliation that keeps both sides matched.",
    icon: ArrowLeftRight,
    status: "coming-soon",
    partnerNote: "RBI PA authorisation or sponsor-bank partner.",
    features: [
      "Bulk processing on both sides",
      "Real-time status per transaction",
      "Automated reconciliation",
      "Exports your finance team can use",
    ],
  },
  {
    slug: "vendor-payments",
    name: "Vendor Payments",
    category: "banking",
    tagline: "Pay suppliers on time, with a record",
    description:
      "Schedule and release supplier payments with approvals, so every payment has a reason and an approver attached.",
    icon: Truck,
    status: "coming-soon",
    partnerNote: "Depends on Payouts.",
    features: [
      "Approval steps before money moves",
      "Scheduled and recurring payments",
      "Payment advice sent to the vendor",
      "A full audit trail per payment",
    ],
  },
  {
    slug: "bbps",
    name: "Bill Payments",
    category: "utility",
    tagline: "Electricity, gas, water and more",
    description:
      "Pay utility bills through Bharat Bill Payment System, with instant confirmation and a receipt that counts.",
    icon: Receipt,
    status: "coming-soon",
    partnerNote: "Requires BBPOU authorisation or an agent-institution arrangement.",
    features: [
      "Electricity, gas, water, broadband and DTH",
      "Fetch the live bill before paying",
      "Instant confirmation with a BBPS receipt",
      "Reminders for recurring bills",
    ],
  },
  {
    slug: "fastag",
    name: "FASTag Recharge",
    category: "utility",
    tagline: "Top up and keep moving",
    description: "Recharge a FASTag in seconds and get alerts on every toll deduction.",
    icon: CreditCard,
    status: "coming-soon",
    partnerNote: "NETC/NPCI via issuer bank.",
    features: [
      "Recharge across issuers",
      "Alerts on each deduction",
      "Low-balance reminders",
      "Toll history in one view",
    ],
  },
  {
    slug: "aeps",
    name: "AEPS Banking",
    category: "banking",
    tagline: "Aadhaar-authenticated banking",
    description:
      "Cash withdrawal, balance enquiry and mini statement using Aadhaar biometric authentication, for customers who bank in person.",
    icon: Fingerprint,
    status: "coming-soon",
    partnerNote: "UIDAI AUA/KUA licensing plus a bank Business Correspondent agreement. Longest lead time of anything here.",
    features: [
      "Cash withdrawal with biometric authentication",
      "Balance enquiry and mini statement",
      "Aadhaar-to-Aadhaar transfer",
      "Every request logged for audit",
    ],
  },
  {
    slug: "train-booking",
    name: "Train Booking",
    category: "travel",
    tagline: "Rail tickets with live availability",
    description: "Check real seat availability, book, and manage the ticket afterwards.",
    icon: Train,
    status: "coming-soon",
    partnerNote: "IRCTC authorised B2B agent approval.",
    features: [
      "Live seat and berth availability",
      "Instant confirmation and e-ticket",
      "PNR status and updates",
      "Cancellations and refunds",
    ],
  },
  {
    slug: "flight-booking",
    name: "Flight Booking",
    category: "travel",
    tagline: "Domestic and international fares",
    description: "Compare across airlines and ticket instantly.",
    icon: Plane,
    status: "coming-soon",
    partnerNote: "See products/flight-booking.",
    features: [
      "Fares across multiple airlines",
      "Domestic and international",
      "Instant ticketing",
      "Changes and cancellations",
    ],
  },
  {
    slug: "hotel-booking",
    name: "Hotel Booking",
    category: "travel",
    tagline: "Stays, booked and invoiced",
    description: "Find and confirm accommodation with transparent terms.",
    icon: Hotel,
    status: "coming-soon",
    partnerNote: "See products/hotel-booking.",
    features: [
      "Broad property coverage",
      "Compare before you book",
      "Instant confirmation",
      "GST invoice included",
    ],
  },
  {
    slug: "bus-booking",
    name: "Bus Booking",
    category: "travel",
    tagline: "Seats across operators",
    description: "Book intercity bus travel with seat selection.",
    icon: Bus,
    status: "coming-soon",
    partnerNote: "See products/bus-booking.",
    features: [
      "Verified operators",
      "Pick your seat",
      "Instant e-ticket",
      "Clear cancellation terms",
    ],
  },
]

/** The flagship platform offerings shown on the home page. */
export const platforms: CatalogEntry[] = [
  {
    slug: "enterprise",
    name: "Nexpro Enterprise",
    tagline: "Run financial services under your own brand",
    description:
      "A white-label platform for businesses that want to offer payments and financial services to their own customers, with their own branding and their own commission structure.",
    icon: Building2,
    status: "coming-soon",
    partnerNote: "Depends on the multi-tier distributor architecture.",
    features: [
      "Your brand, your domain, your customers",
      "Commission structures you control",
      "Role-based access for your whole team",
      "Reporting across your entire network",
    ],
  },
  {
    slug: "banking",
    name: "Nexpro Banking",
    tagline: "Collections, payouts and reconciliation",
    description:
      "The money-movement layer: take payments in, send them out, and keep both sides reconciled without manual matching.",
    icon: Landmark,
    status: "coming-soon",
    features: [
      "Collections with automatic attribution",
      "Bulk payouts with per-recipient status",
      "Reconciliation and an exception queue",
      "Workflows you can shape to your process",
    ],
  },
  {
    slug: "api",
    name: "Nexpro API",
    tagline: "Build it into your own product",
    description:
      "The same capabilities as the dashboard, available as documented APIs and webhooks for teams who would rather build their own interface.",
    icon: Smartphone,
    status: "coming-soon",
    features: [
      "REST APIs with predictable errors",
      "Signed webhooks for every state change",
      "Idempotency keys on anything that moves money",
      "Test keys separated from live",
    ],
  },
  {
    slug: "escrow",
    name: "Nexpro Escrow",
    tagline: "Funds released only when terms are met",
    description:
      "Hold money safely between two parties and release it only once agreed conditions are satisfied — for marketplaces, property and high-value trade.",
    icon: ShieldCheck,
    status: "coming-soon",
    partnerNote: "Requires a partner bank and an appointed trustee.",
    features: [
      "Funds held with a partner bank",
      "Release conditions agreed in advance",
      "Milestone-based release",
      "An independent trustee for oversight",
    ],
  },
  {
    slug: "verify",
    name: "Nexpro Verify",
    tagline: "Know who you are dealing with",
    description:
      "Identity, business and bank-account verification, so onboarding is fast for genuine customers and difficult for everyone else.",
    icon: BadgeCheck,
    status: "coming-soon",
    features: [
      "Identity and document verification",
      "Business and GSTIN checks",
      "Bank account validation",
      "Risk scoring on top of the raw result",
    ],
  },
]

// ── lookups ─────────────────────────────────────────────────────────────────

export const productsByGroup = (group: ProductGroupId) => products.filter((p) => p.group === group)

export const servicesByCategory = (category: ServiceCategory) =>
  services.filter((s) => s.category === category)

export const findProduct = (slug: string) => products.find((p) => p.slug === slug)

export const findService = (slug: string) => services.find((s) => s.slug === slug)
