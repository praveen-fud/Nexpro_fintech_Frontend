import { Link, Navigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { routes } from "@/lib/routes"
import { Seo } from "@/components/shared/seo"
import { breadcrumbSchema, serviceSchema } from "@/lib/structured-data"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { findProduct, productGroups, productsByGroup } from "@/content/catalog"
import { CatalogCard, FeatureList, Section, SectionHeading, StatusPill } from "./marketing-ui"

/**
 * One template serving every product page. The catalogue is the content, so a
 * new product is a catalogue entry rather than another near-identical file
 * that drifts out of step with the others.
 */
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? findProduct(slug) : undefined

  if (!product) return <Navigate to={routes.marketing.products} replace />

  const Icon = product.icon
  const group = productGroups.find((g) => g.id === product.group)
  const related = productsByGroup(product.group).filter((p) => p.slug !== product.slug)
  const path = routes.marketing.product(product.slug)
  const trail = [
    { label: "Home", path: "/" },
    { label: "Products", path: routes.marketing.products },
    { label: product.name, path },
  ]

  return (
    <div>
      <Seo
        title={product.name}
        description={`${product.tagline}. ${product.description}`.slice(0, 158)}
        path={path}
        jsonLd={[
          breadcrumbSchema(trail),
          serviceSchema({ name: product.name, description: product.description, path }),
        ]}
      />
      <section className="relative overflow-hidden bg-hero-mesh">
        <AuroraBackground tone="light" interactive={false} className="opacity-70" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-20">
          <Breadcrumbs trail={trail} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/25">
                  <Icon className="size-6" />
                </span>
                <StatusPill status={product.status} />
                {group && (
                  <span className="rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                    {group.label}
                  </span>
                )}
              </div>

              <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-lg font-medium text-primary">{product.tagline}</p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {product.status === "live" ? (
                  <Button size="lg" className="h-11 px-6" asChild>
                    <Link to={routes.signUp}>
                      Get Started
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="h-11 px-6" asChild>
                    <Link to={routes.marketing.contact}>
                      Register your interest
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 bg-card/80 px-6 backdrop-blur-sm"
                  asChild
                >
                  <Link to={routes.marketing.services}>See all services</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card-aurora relative overflow-hidden rounded-hero p-8 text-white">
                <span className="flex size-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Icon className="size-6" />
                </span>
                <p className="mt-6 font-heading text-xl font-semibold">What you get</p>
                <div className="mt-5">
                  <FeatureList items={product.features} tone="dark" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {product.status === "coming-soon" && (
        <Section className="border-t border-border bg-card !py-12">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-background p-6 text-center">
            <p className="font-heading text-lg font-semibold text-foreground">
              {product.name} is not live yet
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This is a regulated service. We will launch it once the necessary authorisation or
              partner arrangement is in place — and not a day before. Register your interest and we
              will tell you when it is genuinely ready, rather than when it is nearly ready.
            </p>
            <Button className="mt-5" asChild>
              <Link to={routes.marketing.contact}>Register your interest</Link>
            </Button>
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section className="border-t border-border">
          <SectionHeading
            eyebrow="Also in this group"
            title={group?.label ?? "Related products"}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <CatalogCard
                key={item.slug}
                entry={item}
                to={routes.marketing.product(item.slug)}
                index={i}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

export default ProductDetailPage
