import { useState, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { Bell, LogOut, Menu } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

export interface PortalNavItem {
  label: string
  to: string
  icon: LucideIcon
  exact?: boolean
}

interface PortalLayoutProps {
  navItems: PortalNavItem[]
  portalLabel: string
  children: ReactNode
}

function isActive(pathname: string, item: PortalNavItem) {
  return item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function NavList({ navItems, pathname, onNavigate }: { navItems: PortalNavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
      {navItems.map((item) => {
        const active = isActive(pathname, item)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-primary/10 to-brand-cyan/5 text-primary shadow-[inset_0_0_0_1px_rgba(79,70,229,0.12)]"
                : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {active && (
              <span className="bg-brand-gradient absolute inset-y-1.5 left-0 w-1 rounded-full" aria-hidden="true" />
            )}
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function PortalLayout({ navItems, portalLabel, children }: PortalLayoutProps) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const initials = user?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="bg-app-mesh flex min-h-screen w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-[1px_0_0_0_rgba(16,24,40,0.04),4px_0_24px_-12px_rgba(16,24,40,0.08)] lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <Logo />
        </div>
        <div className="px-5 pt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">{portalLabel}</div>
        <NavList navItems={navItems} pathname={pathname} />
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-sm lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
                  <Logo />
                </div>
                <div className="px-5 pt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {portalLabel}
                </div>
                <NavList navItems={navItems} pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold text-foreground lg:hidden">{portalLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-4.5" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="size-8 ring-2 ring-transparent transition-all hover:ring-primary/20">
                <AvatarFallback className="bg-brand-gradient text-xs text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-sm leading-tight sm:block">
                <p className="font-medium text-foreground">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.role.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
