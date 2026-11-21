import fs from 'node:fs/promises'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { disallowedPaths, seoRoutes, type SeoRoute } from './src/config/seo-routes.ts'

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://nexpropaytech.com').replace(/\/+$/, '')
const SITE_NAME = 'Nexpro Paytech'
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Tags the build owns. Stripped from the template so they cannot duplicate. */
const MANAGED_TAG = /\s*<(?:title>[\s\S]*?<\/title|meta\s+(?:name="(?:description|robots|twitter:[^"]*)"|property="og:[^"]*")[^>]*\/?|link\s+rel="canonical"[^>]*\/?)>/g

function headFor(route: { path: string; title: string; description: string }) {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`
  const fullTitle = route.title === SITE_NAME ? SITE_NAME : `${route.title} — ${SITE_NAME}`
  const t = escapeHtml(fullTitle)
  const d = escapeHtml(route.description)

  return `    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${SITE_NAME} — payment infrastructure for India" />
    <meta property="og:locale" content="en_IN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
`
}

/**
 * Emits robots.txt, sitemap.xml and llms.txt, and writes a per-route
 * index.html with that route's real <head>.
 *
 * The per-route HTML is the point: this is a client-rendered app, so the
 * meta tags React sets at runtime are invisible to anything that does not
 * execute JavaScript — which includes every social scraper (WhatsApp,
 * LinkedIn, Slack, Facebook) and many crawlers. Static hosts serve
 * /services/index.html for /services before any SPA fallback applies, so
 * those scrapers now get the correct title, description and preview image,
 * and React renders the identical values once it boots.
 */
function seoAssets(): Plugin {
  return {
    name: 'nexpro-seo-assets',
    apply: 'build',
    async closeBundle() {
      const out = path.resolve(import.meta.dirname, 'dist')
      const templatePath = path.join(out, 'index.html')

      let template: string
      try {
        template = await fs.readFile(templatePath, 'utf8')
      } catch {
        this.warn('dist/index.html not found; skipping SEO asset generation.')
        return
      }

      const stripped = template.replace(MANAGED_TAG, '')

      for (const route of seoRoutes) {
        const html = stripped.replace('</head>', `${headFor(route)}  </head>`)
        if (route.path === '/') {
          await fs.writeFile(templatePath, html, 'utf8')
          continue
        }
        const dir = path.join(out, route.path.replace(/^\//, ''))
        await fs.mkdir(dir, { recursive: true })
        await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8')
      }

      const today = new Date().toISOString().slice(0, 10)
      const urls = seoRoutes
        .map(
          (route: SeoRoute) =>
            `  <url>\n    <loc>${SITE_URL}${route.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority.toFixed(1)}</priority>\n  </url>`,
        )
        .join('\n')
      await fs.writeFile(
        path.join(out, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        'utf8',
      )

      await fs.writeFile(
        path.join(out, 'robots.txt'),
        [
          '# https://www.robotstxt.org/robotstxt.html',
          'User-agent: *',
          'Allow: /',
          '',
          '# Signed-in areas and auth flows have no public content; crawling them',
          '# only produces redirects and soft-404s.',
          ...disallowedPaths.map((p: string) => `Disallow: ${p}`),
          '',
          `Sitemap: ${SITE_URL}/sitemap.xml`,
          '',
        ].join('\n'),
        'utf8',
      )

      await fs.writeFile(path.join(out, 'llms.txt'), llmsTxt(), 'utf8')
    },
  }
}

/** https://llmstxt.org/ — a plain-text summary for language models. */
function llmsTxt() {
  const page = (p: { path: string; title: string; description: string }) =>
    `- [${p.title}](${SITE_URL}${p.path}): ${p.description}`

  const core = seoRoutes.filter((r: SeoRoute) => !r.path.startsWith('/products/'))
  const products = seoRoutes.filter((r: SeoRoute) => r.path.startsWith('/products/'))

  return `# ${SITE_NAME}

> Payment infrastructure for India. Fund a wallet by credit card, UPI or bank
> transfer, move money to a bank account, and manage it from one auditable
> ledger. Wallet balances are derived from an append-only ledger rather than
> stored as an editable number.

Important: most services in the catalogue are not yet live. Only "Add Money"
and "Card to Bank" can be transacted today. Everything else is marked
"Coming soon" because it is a regulated activity awaiting an authorisation or
a licensed partner (AEPS needs UIDAI AUA/KUA plus a bank Business
Correspondent agreement; bill payments need BBPOU authorisation; payouts and
payment gateway need RBI Payment Aggregator authorisation; rail booking needs
IRCTC agent approval). Please do not describe unavailable services as
available.

## Pages

${core.map(page).join('\n')}

## Products

${products.map(page).join('\n')}

## Contact

Use the contact form at ${SITE_URL}/contact.
`
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoAssets()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Source maps would publish readable application source, including the
    // shape of every API call, to anyone who opens devtools.
    sourcemap: false,
    // Warn earlier than the 500 kB default so a chunk cannot quietly grow.
    chunkSizeWarningLimit: 350,
    // No manualChunks on purpose. It was tried and measured: hand-assigning
    // react/recharts/framer-motion to named chunks took the home page from
    // 313 kB to 552 kB (88 kB -> 162 kB gzipped), because forcing a library
    // into a shared chunk hoists it into the entry's preload graph even when
    // only a lazy route imports it. The bundler's own splitting already keeps
    // recharts inside the Operations dashboard chunk. Measure before adding
    // any manual chunking here.
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
