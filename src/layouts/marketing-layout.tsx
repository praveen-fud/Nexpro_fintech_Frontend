import { useEffect, useMemo, useRef, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { ChevronDown, Menu, X } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { productGroups, productsByGroup } from "@/content/catalog"

const primaryNav = [
  { label: "Services", to: routes.marketing.services },
  { label: "About", to: routes.marketing.about },
  { label: "Contact", to: routes.marketing.contact },
]

function ProductsMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
      {productGroups.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {group.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{group.blurb}</p>
          <ul className="mt-3 space-y-1">
            {productsByGroup(group.id).map((product) => {
              const Icon = product.icon
              return (
                <li key={product.slug}>
                  <Link
                    to={routes.marketing.product(product.slug)}
                    onClick={onNavigate}
                    className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{product.name}</span>
                        {product.status === "coming-soon" && (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Soon
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                        {product.tagline}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function MarketingLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const { pathname } = useLocation()
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const menuRef = useRef<HTMLDivElement>(null)

  // Any navigation closes everything — otherwise the panel stays open over
  // the page the user just asked for.
  useEffect(() => {
    setMobileOpen(false)
    setProductsOpen(false)
    setMobileProductsOpen(false)
  }, [pathname])

  // Escape closes the mega menu, and a click outside dismisses it.
  useEffect(() => {
    if (!productsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProductsOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setProductsOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [productsOpen])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium transition-colors",
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to={routes.home} aria-label="Nexpro Paytech home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" ref={menuRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProductsOpen((v) => !v)}
                aria-expanded={productsOpen}
                aria-haspopup="true"
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors",
                  pathname.startsWith("/products")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Products
                <ChevronDown
                  className={cn("size-4 transition-transform", productsOpen && "rotate-180")}
                />
              </button>

              {productsOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-4 w-[min(56rem,90vw)] -translate-x-1/2 rounded-2xl border border-border bg-popover p-6 shadow-xl shadow-foreground/5">
                  <ProductsMenu onNavigate={() => setProductsOpen(false)} />
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                      Services marked “Soon” are not yet available to transact.
                    </p>
                    <Link
                      to={routes.marketing.products}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View all products
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {primaryNav.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" asChild>
              <Link to={routes.login}>Sign In</Link>
            </Button>
            <Button asChild>
              <Link to={routes.signUp}>Get Started</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-border bg-card px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setMobileProductsOpen((v) => !v)}
                aria-expanded={mobileProductsOpen}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium text-foreground"
              >
                Products
                <ChevronDown
                  className={cn("size-4 transition-transform", mobileProductsOpen && "rotate-180")}
                />
              </button>
              {mobileProductsOpen && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <ProductsMenu onNavigate={() => setMobileOpen(false)} />
                </div>
              )}

              {primaryNav.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mt-3 flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link to={routes.login}>Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to={routes.signUp}>Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter year={currentYear} />
    </div>
  )
}

function SiteFooter({ year }: { year: number }) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Nexpro Paytech builds payment infrastructure that is clear about what it does with
              your money — every balance derived from an auditable ledger, every fee shown before
              you commit.
            </p>
          </div>

          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Products</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {productGroups.map((group) => (
                <li key={group.id}>
                  <Link to={routes.marketing.products} className="hover:text-foreground">
                    {group.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={routes.marketing.services} className="hover:text-foreground">
                  All services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to={routes.marketing.about} className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link to={routes.marketing.contact} className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to={routes.legal.governance} className="hover:text-foreground">
                  Governance
                </Link>
              </li>
              <li>
                <Link to={routes.signUp} className="hover:text-foreground">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Policies</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to={routes.legal.terms} className="hover:text-foreground">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to={routes.legal.privacy} className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={routes.legal.cookies} className="hover:text-foreground">
                  Cookie Notice
                </Link>
              </li>
              <li>
                <Link to={routes.legal.grievance} className="hover:text-foreground">
                  Grievance Redressal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Nexpro Paytech. All rights reserved.</p>
          <p className="max-w-xl sm:text-right">
            Services shown as “Coming soon” are not yet available. Regulated services will launch
            only once the relevant authorisation or partner arrangement is in place.
          </p>
        </div>
      </div>
    </footer>
  )
}
