import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CreditCard,
  Smartphone,
  Landmark,
  ShieldCheck,
  Lock,
  Eye,
  ClipboardCheck,
  Wallet,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletCard } from "@/components/shared/wallet-card"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { TiltCard } from "@/components/shared/tilt-card"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

const fundingMethods = [
  {
    icon: CreditCard,
    title: "Credit Card",
    description: "Fund your wallet using a supported card.",
    surface: "surface-tint-primary",
    iconTone: "bg-primary text-white shadow-primary/30",
  },
  {
    icon: Smartphone,
    title: "UPI",
    description: "Complete payment securely through UPI.",
    surface: "surface-tint-info",
    iconTone: "bg-info text-white shadow-info/30",
  },
  {
    icon: Landmark,
    title: "Bank Transfer",
    description: "Transfer funds from your bank account.",
    surface: "surface-tint-success",
    iconTone: "bg-success text-white shadow-success/30",
  },
]

const steps = [
  {
    icon: ClipboardCheck,
    title: "Complete your KYC",
    description: "Verify your identity once, in a few guided steps.",
  },
  {
    icon: Wallet,
    title: "Submit a funding request",
    description: "Choose Credit Card, UPI, or Bank Transfer and tell us how much to add.",
  },
  {
    icon: Eye,
    title: "Operations reviews it",
    description: "Our team verifies the request against your payment evidence.",
  },
  {
    icon: CheckCircle2,
    title: "Wallet is credited",
    description: "Once approved, your available balance updates — clearly and transparently.",
  },
]

const securityPoints = [
  {
    icon: Lock,
    title: "No raw card data stored",
    description: "We never store full card numbers or CVV. Payment details are tokenized by design.",
  },
  {
    icon: ShieldCheck,
    title: "Ledger-backed wallet",
    description: "Every rupee in your wallet traces back to an immutable ledger entry — never a guess.",
  },
  {
    icon: Eye,
    title: "Transparent review",
    description: "Every funding request shows exactly what's requested, reviewed, and credited.",
  },
]

const faqs = [
  {
    q: "Is my money actually moved instantly?",
    a: "Funding requests are reviewed by our Operations team before your wallet is credited. We never claim instant settlement — you'll always see an accurate status.",
  },
  {
    q: "What happens after I submit a funding request?",
    a: "Your request enters a review queue. You can track its status — Pending, Under Review, Approved, or Rejected — from your dashboard at any time.",
  },
  {
    q: "Is this platform processing real payments today?",
    a: "This environment is a product preview. No real banking, UPI, or card processing is connected yet — the experience simulates the full workflow end-to-end.",
  },
]

export function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-hero-mesh">
        <AuroraBackground tone="light" interactive={false} className="opacity-80" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              Nexpro Fintech
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your money. <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent">Managed simply.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              Fund your wallet securely through supported payment methods and manage your financial
              services from one simple platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-11 px-6" asChild>
                <Link to={routes.signUp}>
                  Create Account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6 bg-card/80 backdrop-blur-sm" asChild>
                <Link to={routes.login}>Sign In</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-full max-w-md"
          >
            <TiltCard>
              <WalletCard availableBalance={75000} walletId="NXP-8291-4471" />
            </TiltCard>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-border bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              A clear, four-step workflow from funding request to wallet credit.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative rounded-lg border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="absolute top-5 right-5 text-sm font-semibold text-muted-foreground/40">
                  0{i + 1}
                </span>
                <div className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-brand-cyan/15 text-primary transition-transform duration-300 group-hover:scale-110">
                  <step.icon className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Supported funding methods</h2>
            <p className="mt-3 text-muted-foreground">Choose whichever works best for you.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {fundingMethods.map((method, i) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={cn(
                  "group rounded-[20px] border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  method.surface
                )}
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                    method.iconTone
                  )}
                >
                  <method.icon className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-semibold text-foreground">{method.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{method.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="border-t border-border bg-app-dark-bg py-16 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Security, by design</h2>
            <p className="mt-3 text-white/70">
              Every financial action is transparent, reviewed, and recorded.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {securityPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group rounded-lg border border-white/10 bg-app-dark-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 hover:bg-white/[0.07]"
              >
                <div className="flex size-11 items-center justify-center rounded-md bg-white/10 text-brand-cyan transition-transform duration-300 group-hover:scale-110">
                  <point.icon className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-semibold">{point.title}</p>
                <p className="mt-1.5 text-sm text-white/65">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Transparent transactions, always
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                We distinguish between what you requested, what you were charged, and what hit your
                wallet — so there's never ambiguity about your money.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
              className="surface-tint-success rounded-[20px] border p-6 shadow-md"
            >
              <dl className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <dt className="text-sm text-muted-foreground">Requested Amount</dt>
                  <dd className="font-tabular text-sm font-semibold text-foreground">₹25,000</dd>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <dt className="text-sm text-muted-foreground">Processing Fee</dt>
                  <dd className="font-tabular text-sm font-semibold text-foreground">₹499</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-foreground">Wallet Credit</dt>
                  <dd className="font-tabular text-base font-semibold text-success">₹25,000</dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-border bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-lg border border-border bg-background p-5 transition-colors duration-300 hover:border-primary/30"
              >
                <p className="text-sm font-semibold text-foreground">{faq.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-app-dark-bg">
        {/* Animated gradient field */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-32 size-[28rem] animate-aurora-1 rounded-full bg-brand-primary/50 blur-3xl" />
          <div className="absolute -right-20 top-0 size-[26rem] animate-aurora-2 rounded-full bg-brand-cyan/40 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-1/3 size-[30rem] animate-aurora-3 rounded-full bg-fuchsia-500/30 blur-3xl" />
          {/* Moving grid, faded at the edges */}
          <div
            className="absolute inset-0 animate-grid-pan opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Slow-rotating conic ring */}
          <div className="absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full opacity-30 [background:conic-gradient(from_0deg,transparent,#06b6d4,transparent_35%,#6366f1,transparent_70%,#d946ef,transparent)] [mask-image:radial-gradient(circle,transparent_58%,black_60%,transparent_66%)]" />
        </div>

        {/* Floating business chips */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          <div className="absolute left-[8%] top-[22%] flex animate-float-y items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
            <Wallet className="size-4 text-brand-cyan" /> Wallet funded
            <span className="font-medium text-emerald-300">+₹25,000</span>
          </div>
          <div className="absolute right-[8%] top-[28%] flex animate-float-y-delayed items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
            <ShieldCheck className="size-4 text-emerald-300" /> KYC verified
          </div>
          <div className="absolute bottom-[18%] left-[14%] flex animate-float-y-delayed items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
            <Smartphone className="size-4 text-indigo-300" /> UPI received
          </div>
          <div className="absolute bottom-[22%] right-[12%] flex animate-float-y items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
            <Lock className="size-4 text-brand-cyan" /> Bank-grade security
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl px-4 py-24 text-center text-white lg:py-32"
        >
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Takes only a few minutes
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
              get started?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75 sm:text-lg">
            Create your account and complete KYC in minutes.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="group relative h-12 overflow-hidden bg-white px-7 text-base text-brand-deep-indigo shadow-xl shadow-brand-cyan/30 hover:bg-white"
              asChild
            >
              <Link to={routes.signUp}>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  Create Account
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/25 bg-white/5 px-7 text-base text-white backdrop-blur-md hover:bg-white/15 hover:text-white"
              asChild
            >
              <Link to={routes.login}>Sign In</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
            {["Secure KYC", "Instant wallet", "UPI, card & bank transfer"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
    </div>
  )
}

export default LandingPage
