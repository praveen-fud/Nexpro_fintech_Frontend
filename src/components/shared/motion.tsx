import type { ReactNode } from "react"
import { motion, type Variants } from "framer-motion"

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
}

/** Wrap a section's children in this, then wrap each child in <StaggerItem> for a cascading entrance. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className={className}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  )
}
