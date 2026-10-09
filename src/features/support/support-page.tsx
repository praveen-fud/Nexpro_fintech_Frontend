import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Mail, MessageSquare, Phone, Send, Inbox } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient, ApiError } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"

const faqs = [
  {
    q: "How long does a funding request review take?",
    a: "Most funding requests are reviewed within 1 business day. You can track the status from Transactions at any time.",
  },
  {
    q: "Why is my wallet balance split into Available and Pending?",
    a: "Pending funding hasn't been approved by Operations yet, so it isn't usable. Only your Available Balance can be spent.",
  },
  {
    q: "Is my card information stored by Nexpro Paytech?",
    a: "No. We never store full card numbers or CVV. Only a masked reference is kept for your records.",
  },
  {
    q: "What happens if my funding request is rejected?",
    a: "You'll see the reason on the request's timeline, and no amount is credited to your wallet. Contact support if you have questions.",
  },
]

interface SupportTicket {
  id: string
  subject: string
  status: "OPEN" | "PENDING" | "COMPLETED"
  createdAt: string
}

export function SupportPage() {
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const ticketsQuery = useQuery({
    queryKey: ["support", "tickets"],
    queryFn: async () => (await apiClient.get<SupportTicket[]>("/support/tickets")).data,
  })

  const createTicket = useMutation({
    mutationFn: async () => apiClient.post("/support/tickets", { subject, message }),
    onSuccess: () => {
      toast.success("Support ticket created")
      setSubject("")
      setMessage("")
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] })
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not create ticket. Please try again.")
    },
  })

  return (
    <Stagger>
      <StaggerItem>
        <PageHeader title="Support" description="Get help, reach our team, or review your past requests." />
      </StaggerItem>

      <Tabs defaultValue="faq">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="ticket">Create Ticket</TabsTrigger>
          <TabsTrigger value="history">Ticket History</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-5 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-foreground">{faq.q}</p>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="contact" className="mt-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="group rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-brand-cyan/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <Mail className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">Email</p>
              <p className="mt-1 text-sm text-muted-foreground">support@nexpropaytech.example</p>
            </div>
            <div className="group rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-brand-cyan/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <Phone className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">Phone</p>
              <p className="mt-1 text-sm text-muted-foreground">+91 1800-000-000 (Mon–Fri, 9am–6pm)</p>
            </div>
            <div className="group rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-brand-cyan/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <MessageSquare className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">Chat</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a ticket and we'll respond here.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ticket" className="mt-5 max-w-lg">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="subject">Subject</FieldLabel>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="message">How can we help?</FieldLabel>
              <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <Button
              disabled={!subject || !message || createTicket.isPending}
              onClick={() => createTicket.mutate()}
            >
              <Send className="size-4" />
              Submit Ticket
            </Button>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="history" className="mt-5">
          {ticketsQuery.isLoading && <Skeleton className="h-32 w-full rounded-lg" />}
          {ticketsQuery.data && ticketsQuery.data.length === 0 && (
            <EmptyState icon={Inbox} title="No support tickets yet" description="Tickets you create will appear here." />
          )}
          {ticketsQuery.data && ticketsQuery.data.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card shadow-sm">
              {ticketsQuery.data.map((ticket) => (
                <li key={ticket.id} className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/40">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(ticket.createdAt)}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </Stagger>
  )
}

export default SupportPage
