import { Link } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { PlusCircle, Receipt, Zap, ShoppingBag, TrendingUp, Landmark, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { Badge } from "@/components/ui/badge"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface ServiceItem {
  title: string
  description: string
  icon: LucideIcon
  to?: string
  comingSoon?: boolean
}

interface ServiceGroup {
  title: string
  items: ServiceItem[]
}

const groups: ServiceGroup[] = [
  {
    title: "Wallet Services",
    items: [
      { title: "Add Money", description: "Fund your wallet via card, UPI, or bank transfer.", icon: PlusCircle, to: routes.app.addMoney },
      { title: "Transaction History", description: "Review every funding request and payment.", icon: Receipt, to: routes.app.transactions },
    ],
  },
  {
    title: "Payment Services",
    items: [
      { title: "Bill Payments", description: "Pay utility and recurring bills from your wallet.", icon: Zap, comingSoon: true },
      { title: "Merchant Payments", description: "Pay supported merchants directly.", icon: ShoppingBag, comingSoon: true },
    ],
  },
  {
    title: "Future Services",
    items: [
      { title: "Investments", description: "Grow your balance with curated options.", icon: TrendingUp, comingSoon: true },
      { title: "Loans", description: "Access credit based on your wallet activity.", icon: Landmark, comingSoon: true },
      { title: "Insurance", description: "Protect what matters, from inside your wallet.", icon: ShieldCheck, comingSoon: true },
    ],
  },
]

function ServiceCard({ item }: { item: ServiceItem }) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-brand-cyan/15 text-primary transition-transform duration-300",
            !item.comingSoon && "group-hover:scale-110"
          )}
        >
          <item.icon className="size-5" aria-hidden="true" />
        </span>
        {item.comingSoon && <Badge variant="secondary">Coming Soon</Badge>}
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{item.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
    </>
  )

  const className = cn(
    "group block rounded-lg border border-border bg-card p-5 transition-all duration-300",
    item.comingSoon ? "opacity-70" : "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
  )

  if (item.to && !item.comingSoon) {
    return (
      <Link to={item.to} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export function ServicesPage() {
  return (
    <Stagger>
      <StaggerItem>
        <PageHeader title="Services" description="Everything you can do with your Nexpro wallet." />
      </StaggerItem>
      <div className="space-y-8">
        {groups.map((group) => (
          <StaggerItem key={group.title}>
            <p className="mb-3 text-sm font-semibold text-foreground">{group.title}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <ServiceCard key={item.title} item={item} />
              ))}
            </div>
          </StaggerItem>
        ))}
      </div>
    </Stagger>
  )
}

export default ServicesPage
