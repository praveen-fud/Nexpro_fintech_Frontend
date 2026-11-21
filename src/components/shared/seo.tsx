import { absoluteUrl, company } from "@/config/site"

/**
 * Per-page document head.
 *
 * React 19 hoists <title>, <meta> and <link> rendered anywhere in the tree
 * into <head> and de-duplicates them, so this needs no helmet library — the
 * tags below are written where the page is, and end up where they belong.
 */

const DEFAULT_OG_IMAGE = "/og-image.jpg"
const TITLE_SUFFIX = `${company.name}`

/**
 * JSON-LD is serialised by hand so a "</script>" inside any string cannot
 * close the tag early. The data is ours, not user input, but a serializer
 * that is only safe because of where its input happens to come from is a
 * trap for whoever extends it next.
 */
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export interface SeoProps {
  /** Page title WITHOUT the site-name suffix; it is appended here. */
  title: string
  description: string
  /** Path only, e.g. "/services". Resolved against the configured origin. */
  path: string
  /** Absolute or root-relative image for social cards. */
  image?: string
  /** Set for pages that must not be indexed (404, app shell). */
  noindex?: boolean
  /** Structured data objects to emit alongside the page. */
  jsonLd?: Record<string, unknown>[]
}

export function Seo({ title, description, path, image, noindex, jsonLd }: SeoProps) {
  const fullTitle = title === company.name ? title : `${title} — ${TITLE_SUFFIX}`
  const canonical = absoluteUrl(path)
  const ogImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE)

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={company.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${company.name} — ${company.tagline}`} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd?.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
    </>
  )
}
