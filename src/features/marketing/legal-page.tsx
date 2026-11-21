import { Fragment, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { routes } from "@/lib/routes"
import { Seo } from "@/components/shared/seo"
import { breadcrumbSchema } from "@/lib/structured-data"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { cn } from "@/lib/utils"
import {
  cookieDocument,
  governanceDocument,
  grievanceDocument,
  privacyDocument,
  termsDocument,
  type LegalDocument,
} from "@/content/legal"
import { Section } from "./marketing-ui"

/**
 * Renders a policy document. Placeholders written as [[like this]] are shown
 * as a visible marker rather than silently rendered as prose, so an unfilled
 * detail is obvious on the page instead of quietly going live inside a
 * sentence that reads as if it were complete.
 */
function withPlaceholders(text: string): ReactNode {
  const parts = text.split(/(\[\[.+?\]\])/g)
  return parts.map((part, i) => {
    const match = /^\[\[(.+?)\]\]$/.exec(part)
    if (!match) return <Fragment key={i}>{part}</Fragment>
    return (
      <mark
        key={i}
        className="rounded border border-warning/30 bg-warning-surface px-1.5 py-0.5 text-sm font-medium text-warning-strong"
        title="Placeholder — must be completed before launch"
      >
        {match[1]}
      </mark>
    )
  })
}

const legalNav = [
  { to: routes.legal.terms, label: "Terms & Conditions" },
  { to: routes.legal.privacy, label: "Privacy Policy" },
  { to: routes.legal.cookies, label: "Cookie Notice" },
  { to: routes.legal.governance, label: "Governance" },
  { to: routes.legal.grievance, label: "Grievance Redressal" },
]

export function LegalPage({ document }: { document: LegalDocument }) {
  const path = legalNav.find((item) => item.label === document.title)?.to ?? "/"
  const trail = [
    { label: "Home", path: "/" },
    { label: document.title, path },
  ]

  return (
    <div>
      <Seo
        title={document.title}
        description={document.lede.slice(0, 158)}
        path={path}
        jsonLd={[breadcrumbSchema(trail)]}
      />
      <section className="border-b border-border bg-hero-mesh">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <Breadcrumbs trail={trail} className="mb-5" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {document.lede}
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            Last updated <span className="font-medium text-foreground">{document.updated}</span>
          </p>
        </div>
      </section>

      <Section className="!py-12 lg:!py-16">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-heading text-sm font-semibold text-foreground">All policies</p>
            <nav className="mt-4 space-y-1">
              {legalNav.map((item) => {
                const active = item.label === document.title
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-foreground">Questions?</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                If anything here is unclear, ask us rather than guessing.
              </p>
              <Link
                to={routes.marketing.contact}
                className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
              >
                Contact us →
              </Link>
            </div>
          </aside>

          <article className="min-w-0">
            {document.draftNotice && (
              <div className="mb-10 flex gap-3 rounded-xl border border-warning/30 bg-warning-surface p-4">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-semibold text-warning-strong">Draft document</p>
                  <p className="mt-1 text-sm leading-relaxed text-warning-strong/90">
                    {document.draftNotice}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-10">
              {document.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    {section.heading}
                  </h2>
                  {section.body?.map((paragraph, i) => (
                    <p key={i} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {withPlaceholders(paragraph)}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-4 space-y-2.5">
                      {section.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50"
                            aria-hidden
                          />
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {withPlaceholders(bullet)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </article>
        </div>
      </Section>
    </div>
  )
}

/** One component per route, so the routing table stays declarative. */
export const TermsPage = () => <LegalPage document={termsDocument} />
export const PrivacyPage = () => <LegalPage document={privacyDocument} />
export const CookiePage = () => <LegalPage document={cookieDocument} />
export const GovernancePage = () => <LegalPage document={governanceDocument} />
export const GrievancePage = () => <LegalPage document={grievanceDocument} />
