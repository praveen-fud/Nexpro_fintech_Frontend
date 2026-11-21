import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Building2, CheckCircle2, Loader2, Mail, MapPin, Phone, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { IconInput } from "@/components/shared/icon-input"
import { AuroraBackground } from "@/components/shared/aurora-background"
import { apiClient, ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { company } from "@/config/site"
import { Seo } from "@/components/shared/seo"
import { breadcrumbSchema } from "@/lib/structured-data"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { SupportIllustration } from "@/components/shared/support-illustration"
import { Section, SectionHeading } from "./marketing-ui"

const contactSchema = z.object({
  enquirerType: z.enum(["BUSINESS", "INDIVIDUAL"]),
  fullName: z.string().min(2, "Enter your full name").max(120),
  email: z.email("Enter a valid email address").max(254),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  organisation: z.string().max(120).optional().or(z.literal("")),
  message: z
    .string()
    .min(20, "Tell us a little more — at least 20 characters")
    .max(2000, "Please keep this under 2000 characters"),
})

type ContactForm = z.infer<typeof contactSchema>

/**
 * Only the channels we can actually publish. A contact page listing
 * "+91 00000 00000" tells a visitor the site is unfinished more loudly than
 * leaving the row out does — so unset values are omitted entirely, and the
 * form remains the route that always works.
 */
const channels = [
  company.email && {
    icon: Mail,
    label: "Email",
    value: company.email,
    href: `mailto:${company.email}`,
  },
  company.phone && {
    icon: Phone,
    label: "Phone",
    value: company.phone,
    href: `tel:${company.phone.replace(/[^+\d]/g, "")}`,
  },
  company.address && {
    icon: MapPin,
    label: "Registered office",
    value: [
      company.address.street,
      company.address.locality,
      `${company.address.region} ${company.address.postalCode}`,
    ]
      .filter(Boolean)
      .join(", "),
  },
].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[]

const supportAnswers = [
  {
    q: "How long until someone replies?",
    a: "Two working days at the outside, usually sooner. You get a reference number straight away either way.",
  },
  {
    q: "Which services can I actually use today?",
    a: "Add Money and Card to Bank. Everything else on the site is marked “Coming soon” and we mean it literally — each one is waiting on an authorisation or a partner.",
  },
  {
    q: "Can you tell me when a service will launch?",
    a: "We can tell you where it is in the queue and what it is waiting on. We will not give you a date we are not confident in.",
  },
  {
    q: "Do you work with businesses as well as individuals?",
    a: "Yes. Tell us which you are in the form and the right person picks it up.",
  },
]

const CONTACT_TRAIL = [
  { label: "Home", path: "/" },
  { label: "Contact", path: "/contact" },
]

export function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      enquirerType: "BUSINESS",
      fullName: "",
      email: "",
      mobileNumber: "",
      organisation: "",
      message: "",
    },
  })

  const enquirerType = form.watch("enquirerType")
  const isBusiness = enquirerType === "BUSINESS"

  const onSubmit = async (values: ContactForm) => {
    setSubmitting(true)
    try {
      await apiClient.post("/contact", values)
      setSent(true)
      form.reset()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not send your message. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Seo
        title="Contact"
        description="Tell us what payment flow you need and we will say which parts of Nexpro Paytech exist today and which are waiting on a partner."
        path="/contact"
        jsonLd={[breadcrumbSchema(CONTACT_TRAIL)]}
      />

      <section className="relative overflow-hidden bg-hero-mesh">
        <AuroraBackground tone="light" interactive={false} className="opacity-70" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Breadcrumbs trail={CONTACT_TRAIL} className="mb-5" />
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Tell us what you’re{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">trying to build.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Describe the flow you need and we will tell you which parts exist today, which are
              waiting on a partner, and roughly how long that is likely to take.
            </p>
          </motion.div>
        </div>
      </section>

      <Section className="!pt-0">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="surface-mint rounded-2xl border border-border p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-success-surface text-success">
                  <CheckCircle2 className="size-7" />
                </span>
                <h2 className="mt-5 font-heading text-xl font-semibold text-foreground">
                  Message received
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Thank you — we have your enquiry and will come back to you at the email address
                  you gave us. If it is urgent, the phone number below reaches us faster.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Send us an enquiry
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We read every message. Expect a reply within two working days.
                </p>

                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>I am enquiring as</FieldLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            { value: "BUSINESS", label: "A business", icon: Building2 },
                            { value: "INDIVIDUAL", label: "An individual", icon: User },
                          ] as const
                        ).map((option) => {
                          const Icon = option.icon
                          const active = enquirerType === option.value
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => form.setValue("enquirerType", option.value)}
                              aria-pressed={active}
                              className={cn(
                                "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                                active
                                  ? "border-primary bg-primary/5 text-foreground shadow-sm"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                                  active ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                                )}
                              >
                                <Icon className="size-4" />
                              </span>
                              {option.label}
                            </button>
                          )
                        })}
                      </div>
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={!!form.formState.errors.fullName}>
                        <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                        <IconInput
                          icon={User}
                          id="fullName"
                          autoComplete="name"
                          {...form.register("fullName")}
                        />
                        <FieldError errors={[form.formState.errors.fullName]} />
                      </Field>

                      <Field data-invalid={!!form.formState.errors.email}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <IconInput
                          icon={Mail}
                          id="email"
                          type="email"
                          autoComplete="email"
                          {...form.register("email")}
                        />
                        <FieldError errors={[form.formState.errors.email]} />
                      </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={!!form.formState.errors.mobileNumber}>
                        <FieldLabel htmlFor="mobileNumber">Mobile number</FieldLabel>
                        <IconInput
                          icon={Phone}
                          id="mobileNumber"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="98765 43210"
                          {...form.register("mobileNumber")}
                        />
                        <FieldError errors={[form.formState.errors.mobileNumber]} />
                      </Field>

                      {isBusiness && (
                        <Field data-invalid={!!form.formState.errors.organisation}>
                          <FieldLabel htmlFor="organisation">Company</FieldLabel>
                          <IconInput
                            icon={Building2}
                            id="organisation"
                            autoComplete="organization"
                            {...form.register("organisation")}
                          />
                          <FieldError errors={[form.formState.errors.organisation]} />
                        </Field>
                      )}
                    </div>

                    <Field data-invalid={!!form.formState.errors.message}>
                      <FieldLabel htmlFor="message">What do you need?</FieldLabel>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us about the payment flow you are trying to build, and which services you think you need."
                        {...form.register("message")}
                      />
                      <FieldError errors={[form.formState.errors.message]} />
                    </Field>

                    <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        "Send message"
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      We use what you send here only to answer your enquiry. See our{" "}
                      <a href="/privacy" className="text-primary underline underline-offset-4">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </FieldGroup>
                </form>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card-aurora relative overflow-hidden rounded-2xl p-7 text-white">
              <h3 className="font-heading text-lg font-semibold">
                {channels.length > 0 ? "Reach us directly" : "How we reply"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {channels.length > 0
                  ? "Prefer not to use a form? These reach the same team."
                  : "We answer by email, to the address you give us. Expect a reply within two working days."}
              </p>
              <ul className="mt-6 space-y-5">
                {channels.map((channel) => {
                  const Icon = channel.icon
                  return (
                    <li key={channel.label} className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50">
                          {channel.label}
                        </p>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className="text-sm font-medium text-white hover:underline"
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-white">{channel.value}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Interested in a service that is not live yet?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Say so in your message. Knowing which services people actually want changes the
                order we contract partners in, so it genuinely affects what we build next.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-t border-border bg-card">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Before you write"
              title={
                <>
                  Smart support,{" "}
                  <span className="bg-brand-gradient bg-clip-text text-transparent">
                    answered properly
                  </span>
                </>
              }
              lede="Most questions have a straight answer. Here are the ones we get asked most — if yours is not here, the form above reaches a person, not a queue."
            />

            <dl className="mt-8 space-y-5">
              {supportAnswers.map((item) => (
                <div key={item.q} className="border-l-2 border-primary/25 pl-4">
                  <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <SupportIllustration />
          </motion.div>
        </div>
      </Section>
    </div>
  )
}

export default ContactPage
