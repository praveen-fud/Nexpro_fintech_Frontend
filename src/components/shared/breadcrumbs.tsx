import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  path: string
}

/**
 * Visible breadcrumb trail. The matching BreadcrumbList structured data is
 * emitted separately by the page's <Seo> so the markup and the schema can
 * never disagree about the trail — both read the same array.
 *
 * The final crumb is the current page and is not a link, marked
 * aria-current="page" so assistive tech announces it as the location rather
 * than as another destination.
 */
export function Breadcrumbs({
  trail,
  className,
  tone = "light",
}: {
  trail: Crumb[]
  className?: string
  tone?: "light" | "dark"
}) {
  if (trail.length === 0) return null

  const linkTone =
    tone === "dark"
      ? "text-white/60 hover:text-white"
      : "text-muted-foreground hover:text-foreground"
  const currentTone = tone === "dark" ? "text-white" : "text-foreground"

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1
          return (
            <Fragment key={crumb.path}>
              <li className="flex items-center">
                {isLast ? (
                  <span aria-current="page" className={cn("font-medium", currentTone)}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className={cn("inline-flex items-center gap-1 transition-colors", linkTone)}
                  >
                    {i === 0 && <Home className="size-3.5" aria-hidden="true" />}
                    {crumb.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="flex items-center">
                  <ChevronRight
                    className={cn(
                      "size-3.5",
                      tone === "dark" ? "text-white/30" : "text-muted-foreground/50",
                    )}
                  />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
