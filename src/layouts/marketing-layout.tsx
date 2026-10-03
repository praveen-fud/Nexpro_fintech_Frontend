import { useMemo, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
]

export function MarketingLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === routes.home
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to={routes.home}>
            <Logo />
          </Link>

          {isHome && (
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link to={routes.login}>Sign In</Link>
            </Button>
            <Button asChild>
              <Link to={routes.signUp}>Create Account</Link>
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {open && (
          <div className="border-t border-border px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {isHome &&
                navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
                    {link.label}
                  </a>
                ))}
              <div className="mt-2 flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link to={routes.login} onClick={() => setOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={routes.signUp} onClick={() => setOpen(false)}>
                    Create Account
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-2 lg:col-span-1">
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                A modern, secure platform for funding and managing your wallet.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#how-it-works" className="hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-foreground">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to={routes.login} className="hover:text-foreground">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to={routes.signUp} className="hover:text-foreground">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Terms &amp; Conditions</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {currentYear} Nexpro Fintech. All rights reserved.</p>
            <p>Nexpro Fintech is a product demonstration environment. No real funds are processed.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
