/**
 * Every fact about the company and the site, in one place.
 *
 * Canonical URLs, the sitemap, Open Graph tags, structured data and the
 * policy documents all read from here, so the domain and the company
 * details are configured once rather than hard-coded across a dozen files.
 *
 * Anything still `null` is genuinely unknown — a CIN or a registered address
 * cannot be invented. Unknown values are OMITTED from the rendered page and
 * from structured data rather than printed as a placeholder: a missing phone
 * number is better than "+91 00000 00000", and incomplete structured data is
 * better than schema asserting a fake address, which search engines treat as
 * a trust violation.
 */

/**
 * Set VITE_SITE_URL to the production origin at build time, e.g.
 *   VITE_SITE_URL=https://nexpropaytech.com
 * It must have no trailing slash. In dev it falls back to the dev server so
 * canonical links resolve to something real while you are working.
 */
const rawSiteUrl =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, "") ||
  (import.meta.env.DEV ? "http://localhost:5174" : "https://nexpropaytech.com")

export const siteUrl = rawSiteUrl

export const absoluteUrl = (path: string): string =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`

export interface PostalAddress {
  street: string
  locality: string
  region: string
  postalCode: string
  country: string
}

export const company = {
  /** Trading name, used in UI and titles. */
  name: "Nexpro Paytech",
  /** Registered legal entity name. Required on the Terms page. */
  legalName: null as string | null,
  /** Corporate Identification Number. */
  cin: null as string | null,
  gstin: null as string | null,

  tagline: "Payment infrastructure that is honest about itself",
  description:
    "Nexpro Paytech is a payments platform for India: fund a wallet by card, UPI or bank transfer, move money to a bank account, and manage it all from one auditable ledger.",

  /** Contact routes. Null means "we do not have one to publish yet". */
  email: null as string | null,
  supportEmail: null as string | null,
  phone: null as string | null,

  address: null as PostalAddress | null,

  /** Social profiles, for Organization.sameAs. Empty until they exist. */
  social: [] as string[],

  foundingYear: 2026,
} as const

/** True once we can publish a complete Organization record. */
export const hasPublishableOrganisation = Boolean(company.legalName)

/** True once a LocalBusiness / physical-presence record would be truthful. */
export const hasPhysicalPresence = Boolean(company.address && company.phone)

/**
 * The public routes, in the order they should appear in the sitemap.
 * `changefreq`/`priority` are advisory only; search engines largely ignore
 * them, but they cost nothing and some crawlers still read them.
 */
export interface SitemapRoute {
  path: string
  priority: number
  changefreq: "daily" | "weekly" | "monthly" | "yearly"
}
