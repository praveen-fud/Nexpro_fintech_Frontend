import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import {
  serviceCategories,
  services,
  servicesByCategory,
  type ServiceCategory,
} from "@/content/catalog"
import { FeatureList, Section, SectionHeading, StatusPill } from "./marketing-ui"

export function ServicesPage() {
  const [active, setActive] = useState<ServiceCategory | "all">("all")
  const shown = active === "all" ? services : servicesByCategory(active)
  const liveCount = services.filter((s) => s.status === "live").length

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-mesh">
        <AuroraBackground tone="light" interactive={false} className="opacity-70" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              Services
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Everything your money needs to do,{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                from one balance.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Fund a wallet, pay a bill, move money to a bank, book travel. Each service draws on
              the same verified identity and the same auditable ledger, so you set up once and your
              records stay consistent across all of it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-11 px-6" asChild>
                <Link to={routes.signUp}>
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 bg-card/80 px-6 backdrop-blur-sm"
                asChild
              >
                <Link to={routes.marketing.contact}>Talk to us</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-success">{liveCount} services available today.</span>{" "}
              The rest are listed here so you can see where we are going — each one launches when
              its licence or partner is in place, not before.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="The catalogue"
          title="Built for payments, automation and scale"
          lede="Filter by what you need. Anything marked “Coming soon” is not yet live, and we will not pretend otherwise."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <FilterChip active={active === "all"} onClick={() => setActive("all")}>
            All services
          </FilterChip>
          {serviceCategories.map((category) => (
            <FilterChip
              key={category.id}
              active={active === category.id}
              onClick={() => setActive(category.id)}
            >
              {category.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.article
                key={`${service.category}-${service.slug}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.28) }}
                className="surface-mint flex h-full flex-col rounded-2xl border border-border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/25">
                    <Icon className="size-5" />
                  </span>
                  <StatusPill status={service.status} />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary">{service.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-5 border-t border-border/60 pt-5">
                  <FeatureList items={service.features} />
                </div>
              </motion.article>
            )
          })}
        </div>
      </Section>

      <section className="relative isolate overflow-hidden bg-app-dark-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <SectionHeading
                align="left"
                tone="dark"
                eyebrow="Get started"
                title="Open an account and verify once"
                lede="Identity verification takes a few guided steps. After that, every service you unlock works against the same verified profile."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-11 px-6" asChild>
                <Link to={routes.signUp}>
                  Create Account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link to={routes.marketing.contact}>Contact sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

export default ServicesPage
