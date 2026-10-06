import { lazy, Suspense, type ReactNode } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { FullScreenLoader } from "@/components/shared/full-screen-loader"
import { ProtectedRoute } from "@/app/guards/protected-route"
import { KycGate } from "@/app/guards/kyc-gate"
import { RequireApprovedKyc } from "@/app/guards/require-approved-kyc"
import { MarketingLayout } from "@/layouts/marketing-layout"
import { AppLayout } from "@/layouts/app-layout"
import { OperationsLayout } from "@/layouts/operations-layout"
import { AdminLayout } from "@/layouts/admin-layout"
import { routes } from "@/lib/routes"

const LandingPage = lazy(() => import("@/features/marketing/landing-page"))
const SignUpPage = lazy(() => import("@/features/auth/sign-up-page"))
const LoginPage = lazy(() => import("@/features/auth/login-page"))

const KycPage = lazy(() => import("@/features/kyc/kyc-page"))
const KycStatusPage = lazy(() => import("@/features/kyc/kyc-status-page"))
const DashboardPage = lazy(() => import("@/features/dashboard/dashboard-page"))
const WalletPage = lazy(() => import("@/features/wallet/wallet-page"))
const AddMoneyPage = lazy(() => import("@/features/funding/add-money-page"))
const CreditCardFundingPage = lazy(() => import("@/features/funding/credit-card-funding-page"))
const UpiFundingPage = lazy(() => import("@/features/funding/upi-funding-page"))
const BankTransferFundingPage = lazy(() => import("@/features/funding/bank-transfer-funding-page"))
const FundingRequestDetailPage = lazy(() => import("@/features/funding/funding-request-detail-page"))
const FundingSuccessPage = lazy(() => import("@/features/funding/funding-success-page"))
const TransactionsPage = lazy(() => import("@/features/transactions/transactions-page"))
const TransactionDetailPage = lazy(() => import("@/features/transactions/transaction-detail-page"))
const ServicesPage = lazy(() => import("@/features/services/services-page"))
const ProfilePage = lazy(() => import("@/features/profile/profile-page"))
const SupportPage = lazy(() => import("@/features/support/support-page"))

const OperationsOverviewPage = lazy(() => import("@/features/operations/operations-overview-page"))
const FundingQueuePage = lazy(() => import("@/features/operations/funding-queue-page"))
const FundingDetailPage = lazy(() => import("@/features/operations/funding-detail-page"))
const KycQueuePage = lazy(() => import("@/features/operations/kyc-queue-page"))
const KycDetailPage = lazy(() => import("@/features/operations/kyc-detail-page"))
const OperationsCustomersPage = lazy(() => import("@/features/operations/operations-customers-page"))
const OperationsWalletsPage = lazy(() => import("@/features/operations/operations-wallets-page"))
const OperationsTransactionsPage = lazy(() => import("@/features/operations/operations-transactions-page"))
const OperationsPlaceholderPage = lazy(() => import("@/features/operations/operations-placeholder-page"))
const AdminDashboardPage = lazy(() => import("@/features/admin/admin-dashboard-page"))
const AdminCustomersPage = lazy(() => import("@/features/admin/admin-customers-page"))
const AdminFeesPage = lazy(() => import("@/features/admin/admin-fees-page"))
const AdminLimitsPage = lazy(() => import("@/features/admin/admin-limits-page"))
const AdminAuditLogsPage = lazy(() => import("@/features/admin/admin-audit-logs-page"))
const AdminPlaceholderPage = lazy(() => import("@/features/admin/admin-placeholder-page"))
const UserManagementPage = lazy(() => import("@/features/admin/user-management-page"))

/** Every route gets the same subtle fade+rise entrance — one change, applied
 * consistently everywhere, rather than hand-animating each page. Pure CSS
 * (not Framer Motion) so the app-shell entry chunk doesn't eagerly pull in
 * the animation library — that stays code-split into the lazy page chunks
 * that actually use it. */
function Page({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <div key={pathname} className="animate-page-enter">
        {children}
      </div>
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path={routes.home} element={<Page><LandingPage /></Page>} />
      </Route>

      <Route path={routes.signUp} element={<Page><SignUpPage /></Page>} />
      <Route path={routes.login} element={<Page><LoginPage /></Page>} />

      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route element={<KycGate />}>
          <Route path={routes.app.kyc} element={<Page><KycPage /></Page>} />

          <Route element={<RequireApprovedKyc />}>
            <Route path={routes.app.addMoney} element={<Page><AddMoneyPage /></Page>} />
            <Route path={routes.app.addMoneyCreditCard} element={<Page><CreditCardFundingPage /></Page>} />
            <Route path={routes.app.addMoneyUpi} element={<Page><UpiFundingPage /></Page>} />
            <Route path={routes.app.addMoneyBankTransfer} element={<Page><BankTransferFundingPage /></Page>} />
            <Route path="/app/funding-requests/:id" element={<Page><FundingRequestDetailPage /></Page>} />
            <Route path="/app/funding-requests/:id/success" element={<Page><FundingSuccessPage /></Page>} />
            <Route path="/app/transactions/:id" element={<Page><TransactionDetailPage /></Page>} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path={routes.app.dashboard} element={<Page><DashboardPage /></Page>} />
            <Route path={routes.app.kycStatus} element={<Page><KycStatusPage /></Page>} />
            <Route path={routes.app.profile} element={<Page><ProfilePage /></Page>} />
            <Route path={routes.app.support} element={<Page><SupportPage /></Page>} />

            <Route element={<RequireApprovedKyc />}>
              <Route path={routes.app.wallet} element={<Page><WalletPage /></Page>} />
              <Route path={routes.app.transactions} element={<Page><TransactionsPage /></Page>} />
              <Route path={routes.app.services} element={<Page><ServicesPage /></Page>} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["OPERATIONS", "SUPER_ADMIN"]} />}>
        <Route element={<OperationsLayout />}>
          <Route path={routes.operations.overview} element={<Page><OperationsOverviewPage /></Page>} />
          <Route path={routes.operations.fundingQueue} element={<Page><FundingQueuePage /></Page>} />
          <Route path="/operations/funding/:id" element={<Page><FundingDetailPage /></Page>} />
          <Route path={routes.operations.kycQueue} element={<Page><KycQueuePage /></Page>} />
          <Route path="/operations/kyc/:id" element={<Page><KycDetailPage /></Page>} />
          <Route
            path={routes.operations.customers}
            element={<Page><OperationsCustomersPage /></Page>}
          />
          <Route
            path={routes.operations.wallets}
            element={<Page><OperationsWalletsPage /></Page>}
          />
          <Route
            path={routes.operations.transactions}
            element={<Page><OperationsTransactionsPage /></Page>}
          />
          <Route
            path={routes.operations.reconciliation}
            element={
              <Page>
                <OperationsPlaceholderPage title="Reconciliation" description="Match provider transactions against ledger entries." />
              </Page>
            }
          />
          <Route
            path={routes.operations.support}
            element={
              <Page>
                <OperationsPlaceholderPage title="Support" description="Manage customer support tickets." />
              </Page>
            }
          />
          <Route
            path={routes.operations.reports}
            element={
              <Page>
                <OperationsPlaceholderPage title="Reports" description="Operational and financial reporting." />
              </Page>
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
        <Route element={<AdminLayout />}>
          <Route
            path={routes.admin.dashboard}
            element={<Page><AdminDashboardPage /></Page>}
          />
          <Route
            path={routes.admin.customers}
            element={<Page><AdminCustomersPage /></Page>}
          />
          <Route
            path={routes.admin.operationsUsers}
            element={<Page><UserManagementPage /></Page>}
          />
          <Route
            path={routes.admin.funding}
            element={
              <Page>
                <AdminPlaceholderPage title="Funding" description="Platform-wide funding oversight." />
              </Page>
            }
          />
          <Route
            path={routes.admin.wallets}
            element={
              <Page>
                <AdminPlaceholderPage title="Wallets" description="Platform-wide wallet oversight." />
              </Page>
            }
          />
          <Route
            path={routes.admin.transactions}
            element={
              <Page>
                <AdminPlaceholderPage title="Transactions" description="Platform-wide transaction oversight." />
              </Page>
            }
          />
          <Route
            path={routes.admin.kyc}
            element={
              <Page>
                <AdminPlaceholderPage title="KYC & Compliance" description="Compliance oversight and escalations." />
              </Page>
            }
          />
          <Route
            path={routes.admin.paymentMethods}
            element={
              <Page>
                <AdminPlaceholderPage title="Payment Methods" description="Enable or disable funding methods." />
              </Page>
            }
          />
          <Route
            path={routes.admin.fees}
            element={<Page><AdminFeesPage /></Page>}
          />
          <Route
            path={routes.admin.limits}
            element={<Page><AdminLimitsPage /></Page>}
          />
          <Route
            path={routes.admin.roles}
            element={
              <Page>
                <AdminPlaceholderPage title="Roles & Permissions" description="Manage granular role-based permissions." />
              </Page>
            }
          />
          <Route
            path={routes.admin.reports}
            element={
              <Page>
                <AdminPlaceholderPage title="Reports" description="Platform-wide reporting." />
              </Page>
            }
          />
          <Route
            path={routes.admin.reconciliation}
            element={
              <Page>
                <AdminPlaceholderPage title="Reconciliation" description="Platform-wide reconciliation oversight." />
              </Page>
            }
          />
          <Route
            path={routes.admin.auditLogs}
            element={<Page><AdminAuditLogsPage /></Page>}
          />
          <Route
            path={routes.admin.settings}
            element={
              <Page>
                <AdminPlaceholderPage title="System Settings" description="Platform-wide configuration." />
              </Page>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}
