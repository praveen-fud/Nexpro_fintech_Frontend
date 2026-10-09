import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion, type Variants } from "framer-motion"
import { Eye, ShieldCheck, Zap } from "lucide-react"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { TiltCard } from "@/components/shared/tilt-card"
import { WalletCard } from "@/components/shared/wallet-card"
import { Logo } from "@/components/shared/logo"
import { EASE_OUT, Stagger, StaggerItem } from "@/components/shared/motion"
import { routes } from "@/lib/routes"

const features = [
  { icon: ShieldCheck, label: "Bank-grade security, every request" },
  { icon: Eye, label: "Full transparency on every rupee" },
  { icon: Zap, label: "Review-backed, never a false promise" },
]

const panelStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const panelItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

export const FormStagger = Stagger
export const FormItem = StaggerItem

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      {/* Brand panel — desktop only. All the motion lives here so the form
          itself can stay calm, crisp, and fast to scan. */}
      <div className="relative hidden w-[46%] shrink-0 overflow-hidden bg-app-dark-bg lg:flex lg:flex-col lg:justify-between lg:p-12">
        <AuroraBackground />

        <motion.div initial="hidden" animate="visible" variants={panelStagger} className="relative z-10">
          <motion.div variants={panelItem}>
            <Link to={routes.home}>
              <Logo className="text-white" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={panelStagger}
          className="relative z-10 flex flex-1 flex-col items-start justify-center gap-10 py-12"
        >
          <motion.div variants={panelItem} className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Your money. <br /> Managed simply.
            </h1>
            <p className="mt-4 text-base text-white/70">
              Fund your wallet securely and track every rupee from request to approval —
              nothing ambiguous, nothing hidden.
            </p>
          </motion.div>

          <motion.div variants={panelItem} className="w-full max-w-sm">
            <TiltCard>
              <WalletCard availableBalance={75000} pendingBalance={25000} walletId="NXP-8291-4471" />
            </TiltCard>
          </motion.div>

          <motion.div variants={panelItem} className="flex flex-col gap-3">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <feature.icon className="size-3.5 text-brand-cyan" />
                </span>
                {feature.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={panelStagger}
          className="relative z-10 text-xs text-white/40"
        >
          <motion.span variants={panelItem}>
            Nexpro Paytech is a product preview environment. No real funds are processed.
          </motion.span>
        </motion.p>
      </div>

      {/* Mobile brand band — compact, non-interactive aurora so small
          screens still feel premium without crowding the form. */}
      <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden bg-app-dark-bg lg:hidden">
        <AuroraBackground interactive={false} />
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Link to={routes.home}>
            <Logo className="text-white" />
          </Link>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex flex-1 items-center justify-center bg-background px-4 py-10 lg:py-12">
        <div className="-mt-8 w-full max-w-md rounded-2xl bg-background p-6 shadow-[0_-8px_30px_-12px_rgba(16,24,40,0.15)] sm:p-8 lg:mt-0 lg:rounded-none lg:p-0 lg:shadow-none">
          {children}
        </div>
      </div>
    </div>
  )
}
