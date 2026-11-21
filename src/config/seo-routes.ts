/**
 * The indexable route manifest.
 *
 * This file deliberately has NO imports. It is read both by the app and by
 * vite.config.ts at build time (to emit sitemap.xml, llms.txt and a
 * pre-rendered <head> per route), and the build-time consumer runs in Node
 * where importing the icon library or `import.meta.env` would not work.
 *
 * Titles and descriptions live here as well as in each page's <Seo>, because
 * a social scraper never executes our JavaScript — it reads the HTML as
 * served. The build injects these into a per-route index.html so the tags are
 * real in the markup, and React then renders the identical values at runtime.
 */

export interface SeoRoute {
  path: string
  /** Without the " — Nexpro Paytech" suffix; the build appends it. */
  title: string
  description: string
  priority: number
  changefreq: "daily" | "weekly" | "monthly" | "yearly"
}

/** Product slugs, mirrored from src/content/catalog.ts. */
export const productSlugs = [
  "payouts",
  "international-payments",
  "business-banking",
  "pos",
  "payment-orchestration",
  "bus-booking",
  "hotel-booking",
  "flight-booking",
  "verify",
  "collections",
  "gold-silver",
] as const

const productTitles: Record<(typeof productSlugs)[number], [string, string]> = {
  payouts: [
    "Payouts",
    "Send money to many recipients at once over IMPS, NEFT and RTGS, with per-transfer status you can reconcile against your own records.",
  ],
  "international-payments": [
    "International Payments",
    "Accept payments from outside India and settle them into your account, with purpose codes captured at the point of payment.",
  ],
  "business-banking": [
    "Business Banking",
    "Virtual accounts that identify the payer automatically, a live balance across connected accounts, and auto-matching of receipts to invoices.",
  ],
  pos: [
    "POS Terminals",
    "Chip, swipe, contactless and QR acceptance at the counter, settling into the same Nexpro balance as the rest of your money.",
  ],
  "payment-orchestration": [
    "Payment Orchestration",
    "One integration across several payment gateways, routed by cost or success rate, with automatic failover when a provider degrades.",
  ],
  "bus-booking": [
    "Bus Booking",
    "Search verified bus operators, pick seats from a live layout and confirm instantly, paid from your Nexpro wallet balance.",
  ],
  "hotel-booking": [
    "Hotel Booking",
    "Search, compare and book accommodation across Indian cities, with instant confirmation and a GST invoice.",
  ],
  "flight-booking": [
    "Flight Booking",
    "Compare domestic and international fares across airlines, ticket instantly, and manage changes and cancellations afterwards.",
  ],
  verify: [
    "Verify",
    "PAN, GSTIN, company and bank-account verification, so you know a person or business is what it claims before you onboard or pay it.",
  ],
  collections: [
    "Collections",
    "Issue a unique reference per customer or invoice, match incoming payments automatically, and chase what is still outstanding.",
  ],
  "gold-silver": [
    "Digital Gold & Silver",
    "Buy gold and silver digitally from small amounts, held in insured vaults and sellable back to your wallet at a live quoted rate.",
  ],
}

const staticRoutes: SeoRoute[] = [
  {
    path: "/",
    title: "Nexpro Paytech",
    description:
      "Fund your wallet by credit card, UPI or bank transfer and manage your money from one auditable ledger. Payment infrastructure built for India.",
    priority: 1.0,
    changefreq: "weekly",
  },
  {
    path: "/services",
    title: "Services",
    description:
      "Add money, move funds to a bank, pay bills and book travel — every Nexpro Paytech service, with what is available today marked clearly.",
    priority: 0.9,
    changefreq: "weekly",
  },
  {
    path: "/products",
    title: "Products",
    description:
      "Payouts, collections, payment orchestration, verification and travel — the products Nexpro Paytech offers, and which are live today.",
    priority: 0.9,
    changefreq: "weekly",
  },
  {
    path: "/about",
    title: "About",
    description:
      "How Nexpro Paytech is built: an append-only ledger, identity verification reviewed by people, and a platform that refuses to start if misconfigured.",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    path: "/contact",
    title: "Contact",
    description:
      "Tell us what payment flow you need and we will say which parts of Nexpro Paytech exist today and which are waiting on a partner.",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    path: "/terms",
    title: "Terms & Conditions",
    description:
      "The agreement between you and Nexpro Paytech when you open an account, fund a wallet or use any of our services.",
    priority: 0.4,
    changefreq: "yearly",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "What personal data Nexpro Paytech collects, why, how long we keep it, and the rights you have over it under the DPDP Act 2023.",
    priority: 0.4,
    changefreq: "yearly",
  },
  {
    path: "/cookies",
    title: "Cookie Notice",
    description:
      "What Nexpro Paytech stores in your browser, what each item is for, and how to control it. No advertising or cross-site tracking cookies.",
    priority: 0.3,
    changefreq: "yearly",
  },
  {
    path: "/governance",
    title: "Governance",
    description:
      "How decisions are made at Nexpro Paytech, who is accountable, and the separation of duties and audit controls that apply regardless.",
    priority: 0.4,
    changefreq: "yearly",
  },
  {
    path: "/grievance-redressal",
    title: "Grievance Redressal",
    description:
      "How to raise a complaint with Nexpro Paytech, the four escalation levels, and how to reach the RBI Ombudsman if we cannot resolve it.",
    priority: 0.4,
    changefreq: "yearly",
  },
]

export const seoRoutes: SeoRoute[] = [
  ...staticRoutes,
  ...productSlugs.map((slug) => {
    const [title, description] = productTitles[slug]
    return {
      path: `/products/${slug}`,
      title,
      description,
      priority: 0.6,
      changefreq: "monthly" as const,
    }
  }),
]

/**
 * Routes behind authentication, plus the 404. Listed so robots.txt can
 * disallow them — they have no public content and crawling them only
 * produces soft-404s and login redirects.
 */
export const disallowedPaths = [
  "/app",
  "/operations",
  "/admin",
  "/login",
  "/sign-up",
  "/pay",
]
