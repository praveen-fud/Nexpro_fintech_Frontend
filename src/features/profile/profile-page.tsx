import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ShieldCheck,
  Landmark,
  Lock,
  Bell,
  Gauge,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"
import { routes } from "@/lib/routes"
import { useAuth } from "@/features/auth/auth-context"
import type { KycProfile } from "@/types/domain"

interface Limits {
  perTransaction: number
  daily: number
  monthly: number
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-shadow duration-300 hover:shadow-md">
      {children}
    </div>
  )
}

function Row({
  icon: Icon,
  title,
  description,
  to,
  trailing,
}: {
  icon: LucideIcon
  title: string
  description?: string
  to?: string
  trailing?: ReactNode
}) {
  const content = (
    <div className="group flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-brand-cyan/15 text-primary transition-transform duration-300 group-hover:scale-110">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {trailing ?? (to && <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5" />)}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="-mx-2 block rounded-md px-2 hover:bg-muted/40">
        {content}
      </Link>
    )
  }
  return content
}

export function ProfilePage() {
  const { user, logout } = useAuth()
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: true, push: false })

  const kycQuery = useQuery({
    queryKey: ["kyc", "me"],
    queryFn: async () => (await apiClient.get<KycProfile>("/kyc/me")).data,
  })

  const limitsQuery = useQuery({
    queryKey: ["limits", "me"],
    queryFn: async () => (await apiClient.get<Limits>("/limits/me")).data,
  })

  const initials = user?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Stagger>
      <StaggerItem>
        <PageHeader title="Profile" description="Manage your account, verification, and preferences." />
      </StaggerItem>

      <div className="space-y-5">
        <StaggerItem>
          <div className="bg-brand-gradient relative overflow-hidden rounded-[20px] p-6 text-white">
            <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-semibold">
                {initials}
              </span>
              <div>
                <p className="text-lg font-semibold">{user?.fullName}</p>
                <p className="text-sm text-white/75">{user?.email}</p>
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <SectionCard>
            <p className="mb-1 text-sm font-semibold text-foreground">Personal Information</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Full Name</dt>
                <dd className="font-medium text-foreground">{user?.fullName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{user?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Mobile Number</dt>
                <dd className="font-medium text-foreground">{user?.mobileNumber}</dd>
              </div>
            </dl>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard>
            <p className="mb-1 text-sm font-semibold text-foreground">Verification &amp; Banking</p>
            <div className="divide-y divide-border">
              <Row
                icon={ShieldCheck}
                title="KYC Verification"
                description="View your verification status and documents"
                to={routes.app.kycStatus}
                trailing={
                  kycQuery.data ? <StatusBadge status={kycQuery.data.status} /> : <Skeleton className="h-5 w-20" />
                }
              />
              <Row
                icon={Landmark}
                title="Bank Accounts"
                description={
                  kycQuery.data?.bankAccount
                    ? `${kycQuery.data.bankAccount.accountHolderName} · ${kycQuery.data.bankAccount.accountNumberMasked}`
                    : "No bank account on file yet"
                }
              />
            </div>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard>
            <p className="mb-1 text-sm font-semibold text-foreground">Security</p>
            <div className="divide-y divide-border">
              <Row icon={Lock} title="Change Password" description="Update your account password" />
            </div>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard>
            <p className="mb-2 text-sm font-semibold text-foreground">Notifications</p>
            <div className="divide-y divide-border">
              <Row
                icon={Bell}
                title="Email notifications"
                trailing={
                  <Switch
                    checked={notifPrefs.email}
                    onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, email: v }))}
                  />
                }
              />
              <Row
                icon={Bell}
                title="SMS notifications"
                trailing={
                  <Switch checked={notifPrefs.sms} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, sms: v }))} />
                }
              />
              <Row
                icon={Bell}
                title="Push notifications"
                trailing={
                  <Switch checked={notifPrefs.push} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, push: v }))} />
                }
              />
            </div>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard>
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Gauge className="size-4" /> Limits
            </p>
            {limitsQuery.data ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Per Transaction</dt>
                  <dd className="font-tabular font-medium text-foreground">
                    {formatCurrency(limitsQuery.data.perTransaction)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Daily Limit</dt>
                  <dd className="font-tabular font-medium text-foreground">{formatCurrency(limitsQuery.data.daily)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Monthly Limit</dt>
                  <dd className="font-tabular font-medium text-foreground">{formatCurrency(limitsQuery.data.monthly)}</dd>
                </div>
              </dl>
            ) : (
              <Skeleton className="mt-3 h-16 w-full" />
            )}
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard>
            <div className="divide-y divide-border">
              <Row icon={HelpCircle} title="Help &amp; Support" to={routes.app.support} />
              <Row icon={FileText} title="Terms &amp; Privacy Policy" />
            </div>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <Button
            variant="outline"
            className="w-full text-error hover:bg-error-surface hover:text-error"
            onClick={() => void logout()}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </StaggerItem>
      </div>
    </Stagger>
  )
}

export default ProfilePage
