import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Check, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CatalogEntry, ServiceStatus } from "@/content/catalog"

/**
 * Shared building blocks for the public marketing pages, so every page gets
 * the same rhythm (eyebrow / heading / lede) and the same card treatment
 * without each one re-deciding its own spacing and type scale.
 */

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  tone = "light",
}: {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  align?: "center" | "left"
  tone?: "light" | "dark"
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.14em]",
            tone === "dark" ? "text-brand-gold-light" : "text-primary",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-heading text-3xl font-semibold tracking-tight sm:text-4xl",
          tone === "dark" ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            tone === "dark" ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  )
}

/**
 * Says plainly whether a service can be used today. Most of the catalogue
 * depends on a licensed partner we have not contracted yet, and a marketing
 * page that quietly implies otherwise is the kind of thing a regulator reads
 * back to you later.
 */
export function StatusPill({
  status,
  className,
}: {
  status: ServiceStatus
  className?: string
}) {
  if (status === "live") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-surface px-2.5 py-1 text-xs font-medium text-success",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-success" aria-hidden />
        Available now
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-hidden />
      Coming soon
    </span>
  )
}

export function FeatureList({
  items,
  tone = "light",
}: {
  items: string[]
  tone?: "light" | "dark"
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
              tone === "dark" ? "bg-brand-gold/25 text-brand-gold-light" : "bg-primary/10 text-primary",
            )}
          >
            <Check className="size-2.5" strokeWidth={3} />
          </span>
          <span
            className={cn(
              "text-sm leading-relaxed",
              tone === "dark" ? "text-white/75" : "text-muted-foreground",
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function CatalogCard({
  entry,
  to,
  index = 0,
}: {
  entry: CatalogEntry
  to?: string
  index?: number
}) {
  const Icon = entry.icon
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/25">
          <Icon className="size-5" />
        </span>
        <StatusPill status={entry.status} />
      </div>
      <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{entry.name}</h3>
      <p className="mt-1 text-sm font-medium text-primary">{entry.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
      {to && (
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Learn more
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </>
  )

  const className = cn(
    "group surface-mint flex h-full flex-col rounded-2xl border border-border p-6",
    "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="h-full"
    >
      {to ? (
        <Link to={to} className={className}>
          {body}
        </Link>
      ) : (
        <div className={className}>{body}</div>
      )}
    </motion.div>
  )
}

export function StatCard({
  value,
  label,
  icon: Icon,
}: {
  value: string
  label: string
  icon?: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
      {Icon && (
        <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-gold-light">
          <Icon className="size-5" />
        </span>
      )}
      <p className="font-heading text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/60">{label}</p>
    </div>
  )
}

/** Standard vertical rhythm for a marketing section. */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn("py-16 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">{children}</div>
    </section>
  )
}
