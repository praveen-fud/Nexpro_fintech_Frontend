import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Compass, LifeBuoy, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { Seo } from "@/components/shared/seo"
import { routes } from "@/lib/routes"

const destinations = [
  {
    icon: Package,
    title: "Products",
    description: "Payouts, collections, verification and more.",
    to: routes.marketing.products,
  },
  {
    icon: Sparkles,
    title: "Services",
    description: "Everything you can do from one balance.",
    to: routes.marketing.services,
  },
  {
    icon: LifeBuoy,
    title: "Contact us",
    description: "Tell us what you were looking for.",
    to: routes.marketing.contact,
  },
]

export function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <>
      {/* A 404 must never be indexed, or search engines accumulate soft-404s
          that dilute the pages that do matter. */}
      <Seo
        title="Page not found"
        description="The page you were looking for does not exist or has moved."
        path={pathname}
        noindex
      />

      <section className="relative overflow-hidden bg-hero-mesh">
        <AuroraBackground tone="light" interactive={false} className="opacity-70" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/25">
              <Compass className="size-7" />
            </span>

            <p className="mt-8 font-heading text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
              404
            </p>
            <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              We couldn’t find that page
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              The link may be out of date, or the address may have a typo in it. Nothing has gone
              wrong with your account — this is just a page that isn’t here.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-11 px-6" asChild>
                <Link to={routes.home}>
                  <ArrowLeft className="size-4" />
                  Back to home
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 bg-card/80 px-6 backdrop-blur-sm"
                asChild
              >
                <Link to={routes.marketing.contact}>Report a broken link</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border py-14 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Try one of these instead
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {destinations.map((destination, i) => {
              const Icon = destination.icon
              return (
                <motion.div
                  key={destination.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                >
                  <Link
                    to={destination.to}
                    className="surface-mint group flex h-full flex-col rounded-2xl border border-border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 font-heading text-base font-semibold text-foreground">
                      {destination.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {destination.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Go
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default NotFoundPage
