import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { apiClient, ApiError } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlatformLimit {
  id: string
  scope: string
  perTransaction: string
  daily: string
  monthly: string
  updatedAt: string
}

// ── Schema ────────────────────────────────────────────────────────────────────

const editSchema = z.object({
  perTransaction: z.number().positive("Must be greater than 0"),
  daily: z.number().positive("Must be greater than 0"),
  monthly: z.number().positive("Must be greater than 0"),
})

type EditForm = z.infer<typeof editSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminLimitsPage() {
  const qc = useQueryClient()
  const [editLimit, setEditLimit] = useState<PlatformLimit | null>(null)

  const { data: limits, isLoading, isError, refetch } = useQuery<PlatformLimit[]>({
    queryKey: ["admin-platform-limits"],
    queryFn: async () => (await apiClient.get<PlatformLimit[]>("/admin/platform-limits")).data,
  })

  const form = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<EditForm> }) =>
      apiClient.patch(`/admin/platform-limits/${id}`, body),
    onSuccess: () => {
      toast.success("Platform limits updated.")
      setEditLimit(null)
      qc.invalidateQueries({ queryKey: ["admin-platform-limits"] })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update limits."),
  })

  function openEdit(limit: PlatformLimit) {
    setEditLimit(limit)
    form.reset({
      perTransaction: Number(limit.perTransaction),
      daily: Number(limit.daily),
      monthly: Number(limit.monthly),
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Platform Limits</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure per-transaction, daily, and monthly funding limits. Applied globally to all customers.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-destructive">Failed to load limits.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(limits ?? []).map((lim) => (
            <div key={lim.id} className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {lim.scope} Limits
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Last updated {new Date(lim.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => openEdit(lim)}>
                  <Pencil className="size-4" />
                </Button>
              </div>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Per Transaction</dt>
                  <dd className="text-sm font-medium text-foreground">{formatAmount(lim.perTransaction)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Daily Limit</dt>
                  <dd className="text-sm font-medium text-foreground">{formatAmount(lim.daily)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Monthly Limit</dt>
                  <dd className="text-sm font-medium text-foreground">{formatAmount(lim.monthly)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editLimit} onOpenChange={(open) => !open && setEditLimit(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit {editLimit?.scope} Limits</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) =>
              editLimit && updateMutation.mutate({ id: editLimit.id, body: values })
            )}
            className="space-y-4"
            noValidate
          >
            <Field data-invalid={!!form.formState.errors.perTransaction}>
              <FieldLabel>Per Transaction (₹)</FieldLabel>
              <Input type="number" step="1" min="1" {...form.register("perTransaction", { valueAsNumber: true })} />
              <FieldError errors={[form.formState.errors.perTransaction]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.daily}>
              <FieldLabel>Daily Limit (₹)</FieldLabel>
              <Input type="number" step="1" min="1" {...form.register("daily", { valueAsNumber: true })} />
              <FieldError errors={[form.formState.errors.daily]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.monthly}>
              <FieldLabel>Monthly Limit (₹)</FieldLabel>
              <Input type="number" step="1" min="1" {...form.register("monthly", { valueAsNumber: true })} />
              <FieldError errors={[form.formState.errors.monthly]} />
            </Field>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditLimit(null)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminLimitsPage
