import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { routes } from "@/lib/routes"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { Seo } from "@/components/shared/seo"
import { breadcrumbSchema } from "@/lib/structured-data"
import { platforms, productGroups, productsByGroup } from "@/content/catalog"
import { CatalogCard, FeatureList, Section, SectionHeading, StatusPill } from "./marketing-ui"

const PRODUCTS_TRAIL = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
]

export function ProductsPage() {
  return (
    <div>
      <Seo
        title="Products"
        description="Payouts, collections, payment orchestration, verification and travel — the products Nexpro Paytech offers, and which are live today."
        path="/products"
        jsonLd={[breadcrumbSchema(PRODUCTS_TRAIL)]}
      />

      <section className="relative overflow-hidden bg-hero-mesh">
        <AuroraBackground tone="light" interactive={false} className="opacity-70" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Breadcrumbs trail={PRODUCTS_TRAIL} className="mb-5" />
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              The pieces you need,{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                and nothing you don’t.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Take one product or several. They share one identity, one balance and one ledger, so
              adding the next one does not mean onboarding again or reconciling across systems.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Platforms"
          title="Five ways to build on Nexpro"
          lede="Whether you want a dashboard your team logs into, APIs your engineers build against, or a platform under your own brand."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform, i) => {
            const Icon = platform.icon
            return (
              <motion.article
                key={platform.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.25) }}
                className="surface-mint flex h-full flex-col rounded-2xl border border-border p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/25">
                    <Icon className="size-5" />
                  </span>
                  <StatusPill status={platform.status} />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {platform.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary">{platform.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {platform.description}
                </p>
                <div className="mt-5 border-t border-border/60 pt-5">
                  <FeatureList items={platform.features} />
                </div>
              </motion.article>
            )
          })}
        </div>
      </Section>

      {productGroups.map((group, groupIndex) => (
        <Section
          key={group.id}
          className={groupIndex % 2 === 0 ? "border-t border-border bg-card" : "border-t border-border"}
        >
          <SectionHeading eyebrow={group.label} title={group.blurb} />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productsByGroup(group.id).map((product, i) => (
              <CatalogCard
                key={product.slug}
                entry={product}
                to={routes.marketing.product(product.slug)}
                index={i}
              />
            ))}
          </div>
        </Section>
      ))}

      <section className="relative isolate overflow-hidden bg-app-dark-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <SectionHeading
                align="left"
                tone="dark"
                eyebrow="Not sure which you need?"
                title="Tell us what you’re trying to do"
                lede="Describe the flow you need and we will tell you honestly which pieces exist today and which are still ahead of us."
              />
            </div>
            <Button size="lg" className="h-11 shrink-0 px-6" asChild>
              <Link to={routes.marketing.contact}>
                Talk to us
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductsPage
