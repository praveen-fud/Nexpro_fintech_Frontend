import { useNavigate } from "react-router-dom"
import { CreditCard, Smartphone, Landmark, ChevronRight } from "lucide-react"
import { FlowLayout } from "@/layouts/flow-layout"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { routes } from "@/lib/routes"

const methods = [
  {
    key: "credit-card",
    title: "Credit Card",
    description: "Pay by card in a secure window — credited instantly.",
    icon: CreditCard,
    to: routes.app.addMoneyCreditCard,
  },
  {
    key: "upi",
    title: "UPI",
    description: "Scan the QR or use our UPI ID, then submit the UTR and screenshot.",
    icon: Smartphone,
    to: routes.app.addMoneyUpi,
  },
  {
    key: "bank-transfer",
    title: "Bank Transfer",
    description: "Send via NEFT, IMPS or RTGS, then submit the UTR.",
    icon: Landmark,
    to: routes.app.addMoneyBankTransfer,
  },
]

export function AddMoneyPage() {
  const navigate = useNavigate()

  return (
    <FlowLayout title="Add Money" closeTo={routes.app.dashboard} maxWidthClassName="max-w-2xl">
      <Stagger>
        <StaggerItem>
          <p className="mb-6 text-sm text-muted-foreground">Choose how you'd like to fund your wallet.</p>
        </StaggerItem>
        <div className="space-y-3">
          {methods.map((method) => (
            <StaggerItem key={method.key}>
              <button
                onClick={() => navigate(method.to)}
                className="group flex w-full items-center gap-4 rounded-lg border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-brand-cyan/15 text-primary transition-transform duration-300 group-hover:scale-110">
                  <method.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-semibold text-foreground">{method.title}</span>
                  <span className="block text-sm text-muted-foreground">{method.description}</span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
                  aria-hidden="true"
                />
              </button>
            </StaggerItem>
          ))}
        </div>
        <StaggerItem>
          <p className="mt-6 text-xs text-muted-foreground">
            Card payments are credited as soon as the payment is confirmed. UPI and bank transfers are credited after
            our team verifies your payment details.
          </p>
        </StaggerItem>
      </Stagger>
    </FlowLayout>
  )
}

export default AddMoneyPage
