import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileLock2,
  Fingerprint,
  Gauge,
  Heart,
  ScrollText,
  Target,
  Telescope,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { routes } from "@/lib/routes"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { Seo } from "@/components/shared/seo"
import { breadcrumbSchema } from "@/lib/structured-data"
import { cn } from "@/lib/utils"
import { Section, SectionHeading, StatCard } from "./marketing-ui"

const perspective = [
  {
    id: "overview",
    icon: Eye,
    title: "Overview",
    body: "Nexpro Paytech is a payments platform built around a simple idea: you should always be able to see where your money is, what it cost you, and who touched it. Everything else follows from that.",
  },
  {
    id: "mission",
    icon: Target,
    title: "Mission",
    body: "To make moving money feel unremarkable — fast enough that you stop thinking about it, and transparent enough that you never have to wonder what happened to a payment.",
  },
  {
    id: "vision",
    icon: Telescope,
    title: "Vision",
    body: "One verified identity and one balance that reaches every financial service a person or business needs, instead of a separate account, a separate login and a separate reconciliation for each.",
  },
  {
    id: "values",
    icon: Heart,
    title: "Values",
    body: "Say what the product actually does. Show fees before taking them, not after. Treat a customer's money and identity documents as things we are holding, not things we own.",
  },
  {
    id: "purpose",
    icon: ScrollText,
    title: "Purpose",
    body: "Good financial infrastructure is mostly invisible and entirely dependable. We would rather launch a service late and correct than early and approximate.",
  },
]

const principles = [
  {
    icon: FileLock2,
    title: "The ledger is the truth",
    body: "A balance is never a number we edit. It is derived from an append-only ledger, so every rupee in an account traces back to an entry explaining how it got there. Approving the same funding request twice cannot credit it twice — that is enforced in the database, and there is a test that proves it.",
  },
  {
    icon: Fingerprint,
    title: "Verify once, carefully",
    body: "Identity verification is a real review by a real person, not a checkbox. Documents are checked by their actual contents rather than what a filename claims, stored outside the public path, and served only to the customer they belong to and the reviewer handling the case.",
  },
  {
    icon: Gauge,
    title: "Fail closed, loudly",
    body: "The platform refuses to start if it is configured in a way that would be unsafe to serve traffic — a weak signing secret, an open cross-origin policy, a database that would lose your records on restart. A misconfiguration should be an outage, not a quiet breach.",
  },
]

const journey = [
  { period: "Stage 1", title: "Wallet and funding", body: "Card, UPI and bank-transfer funding with a reviewed approval flow." },
  { period: "Stage 2", title: "Ledger and identity", body: "Append-only ledger, KYC review, role-based access and audit logging." },
  { period: "Stage 3", title: "Live card payments", body: "Payments confirmed with the provider before any balance moves." },
  { period: "Next", title: "The wider catalogue", body: "Collections, payouts, bills and travel, each as its partner is contracted." },
]

const commitments = [
  { value: "Append-only", label: "Ledger, never an editable balance" },
  { value: "Argon2id", label: "Password hashing, industry standard" },
  { value: "15 min", label: "Idle session timeout, enforced server-side" },
  { value: "Every action", label: "Written to an audit log" },
]

const ABOUT_TRAIL = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
]

export function AboutPage() {
  const [slide, setSlide] = useState(0)
  const current = perspective[slide]
  const CurrentIcon = current.icon

  const move = (delta: number) =>
    setSlide((s) => (s + delta + perspective.length) % perspective.length)

  return (
    <div>
      <Seo
        title="About"
        description="How Nexpro Paytech is built: an append-only ledger, identity verification reviewed by people, and a platform that refuses to start if misconfigured."
        path="/about"
        jsonLd={[breadcrumbSchema(ABOUT_TRAIL)]}
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
            <Breadcrumbs trail={ABOUT_TRAIL} className="mb-5" />
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Payment infrastructure that is{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                honest about itself.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Plenty of platforms will tell you they are secure. Fewer will tell you what they
              actually do with your money, which services they can genuinely provide today, and
              what happens when something goes wrong. We would rather be the second kind.
            </p>
          </motion.div>
        </div>
      </section>

      <Section className="border-t border-border bg-card">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            align="left"
            eyebrow="Our perspective"
            title="Fintech needs more than code."
            lede="Payments are a trust business before they are a technology business. The engineering only matters because it is what makes the trust justified."
          />

          <div className="relative">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="surface-mint rounded-2xl border border-border p-8"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/25">
                <CurrentIcon className="size-6" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold text-foreground">
                {current.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
            </motion.div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-1.5">
                {perspective.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-label={`Show ${item.title}`}
                    aria-current={i === slide}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === slide ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-primary/40",
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Previous">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Next">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="What defines us"
          title="Three commitments we actually build against"
          lede="Not aspirations — these are properties of the system, and each one is enforced in code."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {principles.map((principle, i) => {
            const Icon = principle.icon
            return (
              <motion.article
                key={principle.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="surface-mint rounded-2xl border border-border p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-primary/25">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </motion.article>
            )
          })}
        </div>
      </Section>

      <Section className="border-t border-border bg-card">
        <SectionHeading
          eyebrow="How we got here"
          title="Built in stages, deliberately"
          lede="Each stage had to be correct before the next one started. Payments is not a domain that rewards shortcuts."
        />
        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-border md:block" />
          <div className="grid gap-8 md:grid-cols-4">
            {journey.map((item, i) => (
              <motion.div
                key={item.period}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <span className="relative z-10 flex size-10 items-center justify-center rounded-full border-4 border-card bg-brand-gradient font-heading text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {item.period}
                </p>
                <h3 className="mt-1 font-heading text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <section className="relative isolate overflow-hidden bg-app-dark-bg py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            tone="dark"
            eyebrow="What we can state plainly"
            title="Facts, not badges"
            lede="We are a young platform, so we are not going to decorate this page with partner counts and uptime percentages we have not earned. Here is what is true about how the system is built."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {commitments.map((item) => (
              <StatCard key={item.label} value={item.value} label={item.label} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" className="h-11 px-6" asChild>
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

export default AboutPage
