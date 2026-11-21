import { absoluteUrl, company, siteUrl } from "@/config/site"

/**
 * JSON-LD builders. Kept out of seo.tsx so that file exports only a
 * component — a module mixing components and helpers breaks React Fast
 * Refresh for everything that imports it.
 */

/**
 * Organization. Only the fields we can state truthfully are included —
 * asserting a legal name, address or phone we do not have would be a
 * fabricated entity record, which is both dishonest and a ranking risk.
 */
export function organizationSchema(): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: siteUrl,
    logo: absoluteUrl("/logo-512.png"),
    description: company.description,
  }
  if (company.legalName) schema.legalName = company.legalName
  if (company.email) schema.email = company.email
  if (company.phone) schema.telephone = company.phone
  if (company.social.length > 0) schema.sameAs = company.social
  if (company.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      addressLocality: company.address.locality,
      addressRegion: company.address.region,
      postalCode: company.address.postalCode,
      addressCountry: company.address.country,
    }
  }
  if (company.phone) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: company.phone,
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    }
  }
  return schema
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: company.name,
    url: siteUrl,
    description: company.description,
  }
}

export function breadcrumbSchema(
  trail: { label: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/** A single catalogue entry, for product and service pages. */
export function serviceSchema(entry: {
  name: string
  description: string
  path: string
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: entry.name,
    description: entry.description,
    url: absoluteUrl(entry.path),
    provider: { "@type": "Organization", name: company.name, url: siteUrl },
    areaServed: { "@type": "Country", name: "India" },
  }
}

export function faqSchema(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }
}
