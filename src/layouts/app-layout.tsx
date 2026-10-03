import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  Home,
  Wallet,
  PlusCircle,
  Receipt,
  Grid2x2,
  User,
  HelpCircle,
  Menu,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  exact?: boolean
}

const sidebarNavItems: NavItem[] = [
  { label: "Home", to: routes.app.dashboard, icon: Home, exact: true },
  { label: "Wallet", to: routes.app.wallet, icon: Wallet },
  { label: "Add Money", to: routes.app.addMoney, icon: PlusCircle },
  { label: "Transactions", to: routes.app.transactions, icon: Receipt },
  { label: "Services", to: routes.app.services, icon: Grid2x2 },
  { label: "Profile", to: routes.app.profile, icon: User },
  { label: "Help", to: routes.app.support, icon: HelpCircle },
]

const bottomNavItems: NavItem[] = [
  { label: "Home", to: routes.app.dashboard, icon: Home, exact: true },
  { label: "Wallet", to: routes.app.wallet, icon: Wallet },
  { label: "Add Money", to: routes.app.addMoney, icon: PlusCircle },
  { label: "Activity", to: routes.app.transactions, icon: Receipt },
]

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function AppLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  const initials = user?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="bg-app-mesh flex min-h-screen w-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-[1px_0_0_0_rgba(16,24,40,0.04),4px_0_24px_-12px_rgba(16,24,40,0.08)] lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-3">
          {sidebarNavItems.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.to}
                to={item.to}
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
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-4.5" />
            </Button>
            <Link to={routes.app.profile} aria-label="Profile" className="transition-transform hover:scale-105">
              <Avatar className="size-8 ring-2 ring-transparent transition-all hover:ring-primary/20">
                <AvatarFallback className="bg-brand-gradient text-xs text-white">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 pb-24 lg:p-6 lg:pb-6">
          <Outlet />
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-border bg-card px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
          aria-label="Primary"
        >
          {bottomNavItems.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden="true" />
                )}
                <item.icon className={cn("size-5 transition-transform", active && "scale-110")} aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground">
                <Menu className="size-5" aria-hidden="true" />
                More
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-lg">
              <nav className="flex flex-col gap-1 py-2">
                <Link
                  to={routes.app.services}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Grid2x2 className="size-4.5" /> Services
                </Link>
                <Link
                  to={routes.app.profile}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <User className="size-4.5" /> Profile
                </Link>
                <Link
                  to={routes.app.support}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <HelpCircle className="size-4.5" /> Help
                </Link>
                <button
                  onClick={() => void logout()}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-error-surface"
                >
                  <LogOut className="size-4.5" /> Sign out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  )
}
