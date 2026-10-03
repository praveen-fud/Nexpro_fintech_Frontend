import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

/** Wraps children in a subtle, premium 3D tilt + sheen that follows the pointer. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 18 })
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 18 })
  const scale = useSpring(1, { stiffness: 150, damping: 18 })
  const glowOpacity = useSpring(0, { stiffness: 120, damping: 20 })
  const glowX = useTransform(rawRotateY, [-7, 7], [0, 100])
  const glowBackground = useTransform(
    glowX,
    (v) => `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.18) ${v}%, transparent 80%)`
  )

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5
    rawRotateY.set(relX * 14)
    rawRotateX.set(relY * -14)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => {
        scale.set(1.03)
        glowOpacity.set(1)
      }}
      onMouseLeave={() => {
        rawRotateX.set(0)
        rawRotateY.set(0)
        scale.set(1)
        glowOpacity.set(0)
      }}
      style={{ rotateX, rotateY, scale, transformPerspective: 900 }}
      className={className}
    >
      <div className="relative">
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{ opacity: glowOpacity, background: glowBackground }}
        />
      </div>
    </motion.div>
  )
}
