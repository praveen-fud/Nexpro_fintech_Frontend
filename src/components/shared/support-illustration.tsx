import { cn } from "@/lib/utils"

/**
 * Support / FAQ illustration for the contact page.
 *
 * Drawn here as inline SVG rather than shipped as a raster asset: it scales
 * to any size without a second file to download, and it is built from the
 * brand tokens so it stays in step with the palette instead of drifting out
 * of it the way an exported PNG would.
 *
 * Original artwork. The composition follows the convention for this kind of
 * section — a figure at a desk surrounded by the things support is made of —
 * but every shape here is ours.
 */
export function SupportIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 620 460"
      role="img"
      aria-label="A person at a laptop surrounded by a checklist, a question mark, a message bubble and an idea — the pieces of getting an answer."
      className={cn("h-auto w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="si-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-mint)" />
          <stop offset="100%" stopColor="color-mix(in oklch, var(--brand-mint-strong) 32%, white)" />
        </linearGradient>
        <linearGradient id="si-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in oklch, var(--brand-primary) 18%, white)" />
          <stop offset="100%" stopColor="color-mix(in oklch, var(--brand-primary) 32%, white)" />
        </linearGradient>
        <linearGradient id="si-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-primary)" />
          <stop offset="100%" stopColor="#0f7a52" />
        </linearGradient>
        <linearGradient id="si-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-gold-light)" />
          <stop offset="100%" stopColor="var(--brand-gold)" />
        </linearGradient>
      </defs>

      {/* Soft ground */}
      <ellipse cx="310" cy="250" rx="290" ry="200" fill="url(#si-bg)" opacity="0.75" />

      {/* Scattered sparkle dots */}
      <g fill="var(--brand-mint-strong)" opacity="0.5">
        <circle cx="86" cy="118" r="4" />
        <circle cx="540" cy="150" r="5" />
        <circle cx="498" cy="86" r="3" />
        <circle cx="128" cy="330" r="3.5" />
        <circle cx="566" cy="300" r="4" />
        <circle cx="60" cy="226" r="3" />
      </g>
      <g fill="var(--brand-gold)" opacity="0.55">
        <circle cx="462" cy="122" r="3" />
        <circle cx="104" cy="178" r="3" />
        <circle cx="520" cy="236" r="2.5" />
      </g>

      {/* ── Question mark, the thing being resolved ───────────────────────── */}
      <g transform="translate(286 28)">
        <circle cx="26" cy="34" r="34" fill="url(#si-gold)" opacity="0.22" />
        <path
          d="M16 22c0-7 5-12 12-12s12 4 12 11c0 6-4 8-7 10-3 2-4 4-4 7"
          fill="none"
          stroke="var(--brand-gold)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <circle cx="29" cy="50" r="3.6" fill="var(--brand-gold)" />
      </g>

      {/* ── Checklist card ────────────────────────────────────────────────── */}
      <g transform="translate(36 150)">
        <rect
          x="0"
          y="0"
          width="166"
          height="122"
          rx="16"
          fill="white"
          stroke="color-mix(in oklch, var(--brand-primary) 14%, white)"
          strokeWidth="2"
        />
        {[0, 1, 2].map((row) => (
          <g key={row} transform={`translate(20 ${22 + row * 32})`}>
            <circle cx="11" cy="11" r="11" fill="color-mix(in oklch, var(--brand-mint-strong) 30%, white)" />
            <path
              d="M6.5 11.3l3 3 6-6.4"
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="32"
              y="5"
              width={row === 2 ? 68 : 104}
              height="7"
              rx="3.5"
              fill="color-mix(in oklch, var(--brand-primary) 22%, white)"
            />
            <rect
              x="32"
              y="16"
              width={row === 2 ? 44 : 72}
              height="5"
              rx="2.5"
              fill="color-mix(in oklch, var(--brand-primary) 11%, white)"
            />
          </g>
        ))}
      </g>

      {/* ── Message bubble ────────────────────────────────────────────────── */}
      <g transform="translate(424 128)">
        <path
          d="M14 0h130a14 14 0 0 1 14 14v62a14 14 0 0 1-14 14H52l-22 20 3-20H14A14 14 0 0 1 0 76V14A14 14 0 0 1 14 0z"
          fill="white"
          stroke="color-mix(in oklch, var(--brand-primary) 14%, white)"
          strokeWidth="2"
        />
        <rect x="24" y="24" width="112" height="8" rx="4" fill="color-mix(in oklch, var(--brand-primary) 26%, white)" />
        <rect x="24" y="42" width="84" height="8" rx="4" fill="color-mix(in oklch, var(--brand-primary) 16%, white)" />
        <rect x="24" y="60" width="58" height="8" rx="4" fill="color-mix(in oklch, var(--brand-gold) 34%, white)" />
      </g>

      {/* ── Idea ──────────────────────────────────────────────────────────── */}
      <g transform="translate(470 262)">
        <circle cx="30" cy="30" r="30" fill="white" stroke="color-mix(in oklch, var(--brand-primary) 12%, white)" strokeWidth="2" />
        <path
          d="M30 14a12 12 0 0 0-7 21.7V39a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.3A12 12 0 0 0 30 14z"
          fill="url(#si-gold)"
        />
        <rect x="25" y="44" width="10" height="3.4" rx="1.7" fill="var(--brand-gold)" />
        <rect x="26.5" y="50" width="7" height="3" rx="1.5" fill="var(--brand-gold)" opacity="0.7" />
      </g>

      {/* ── Desk ──────────────────────────────────────────────────────────── */}
      <rect x="140" y="368" width="340" height="12" rx="6" fill="url(#si-desk)" />

      {/* ── Figure ────────────────────────────────────────────────────────── */}
      <g transform="translate(228 168)">
        {/* Chair back */}
        <rect x="-26" y="92" width="22" height="86" rx="11" fill="color-mix(in oklch, var(--brand-primary) 24%, white)" />

        {/* Torso */}
        <path
          d="M18 104c0-28 18-46 44-46s44 18 44 46v96H18z"
          fill="var(--brand-primary)"
        />
        {/* Collar */}
        <path d="M50 60h24l-12 20z" fill="color-mix(in oklch, white 82%, var(--brand-primary))" />

        {/* Neck */}
        <rect x="54" y="40" width="16" height="26" rx="8" fill="#d8a87c" />
        {/* Head */}
        <ellipse cx="62" cy="26" rx="25" ry="27" fill="#e8b98d" />
        {/* Hair */}
        <path
          d="M37 24c0-16 11-27 25-27s25 11 25 27c0 4-1 7-2 9-2-9-9-13-23-13-10 0-17 3-21 9-2 3-3 1-4-5z"
          fill="#3d2b23"
        />
        {/* Bun */}
        <circle cx="86" cy="6" r="11" fill="#3d2b23" />
        {/* Brow + eye, kept minimal — a flat illustration reads better
            without a rendered face */}
        <circle cx="70" cy="26" r="2.6" fill="#3d2b23" />
        <path d="M63 18.5c3-2 7-2 10 0" fill="none" stroke="#3d2b23" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M74 36c-3 2.5-7 2.5-10 0.5" fill="none" stroke="#c98f63" strokeWidth="2" strokeLinecap="round" />

        {/* Near arm, raised to the chin — the "thinking it over" pose.
            Drawn after the head so the hand sits in front of the jaw, and
            kept high enough that the laptop does not cover it. */}
        <path
          d="M104 104c14 2 20 12 14 24-5 10-16 14-26 10"
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="19"
          strokeLinecap="round"
        />
        <path
          d="M92 138c-8-4-10-14-6-22 3-6 9-9 14-8"
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* Hand at the chin */}
        <ellipse cx="84" cy="48" rx="11" ry="12.5" fill="#e8b98d" transform="rotate(-18 84 48)" />
      </g>

      {/* ── Laptop ────────────────────────────────────────────────────────── */}
      <g transform="translate(238 286)">
        <path d="M8 0h148a8 8 0 0 1 8 8v66H0V8a8 8 0 0 1 8-8z" fill="url(#si-screen)" />
        <rect x="14" y="14" width="96" height="7" rx="3.5" fill="white" opacity="0.85" />
        <rect x="14" y="29" width="130" height="6" rx="3" fill="white" opacity="0.45" />
        <rect x="14" y="43" width="112" height="6" rx="3" fill="white" opacity="0.45" />
        <rect x="14" y="57" width="64" height="6" rx="3" fill="var(--brand-gold-light)" opacity="0.9" />
        <path d="M-16 74h196l10 14H-26z" fill="color-mix(in oklch, var(--brand-primary) 30%, white)" />
        <rect x="62" y="79" width="40" height="4" rx="2" fill="color-mix(in oklch, var(--brand-primary) 52%, white)" />
      </g>

      {/* ── Plant ─────────────────────────────────────────────────────────── */}
      <g transform="translate(74 290)">
        <path d="M28 82V44" stroke="var(--brand-primary)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M28 54c-16-2-23-13-22-27 14-2 23 8 22 27z" fill="var(--brand-cyan)" />
        <path d="M28 46c13-3 19-12 18-24-12-1-19 7-18 24z" fill="var(--brand-primary)" opacity="0.85" />
        <path d="M10 78h36l-4 24a6 6 0 0 1-6 5H20a6 6 0 0 1-6-5z" fill="url(#si-gold)" />
      </g>

      {/* ── Cup ───────────────────────────────────────────────────────────── */}
      <g transform="translate(428 338)">
        <path d="M0 4h34v18a13 13 0 0 1-13 13h-8A13 13 0 0 1 0 22z" fill="white" stroke="color-mix(in oklch, var(--brand-primary) 16%, white)" strokeWidth="2" />
        <path d="M34 10h5a7 7 0 0 1 0 14h-5" fill="none" stroke="color-mix(in oklch, var(--brand-primary) 22%, white)" strokeWidth="2.5" />
        <path d="M6 10h22v8H6z" fill="color-mix(in oklch, var(--brand-gold) 45%, white)" />
      </g>
    </svg>
  )
}
