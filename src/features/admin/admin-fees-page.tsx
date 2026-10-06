import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { apiClient, ApiError } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeeRule {
  id: string
  method: "CREDIT_CARD" | "UPI" | "BANK_TRANSFER"
  feeType: "FIXED" | "PERCENTAGE"
  fixedAmount: string
  percentage: string
  minFee: string
  maxFee: string
  isEnabled: boolean
  updatedAt: string
}

// ── Schema ────────────────────────────────────────────────────────────────────

const editSchema = z.object({
  feeType: z.enum(["FIXED", "PERCENTAGE"]),
  fixedAmount: z.number().min(0),
  percentage: z.number().min(0).max(100),
  minFee: z.number().min(0),
  maxFee: z.number().min(0),
  isEnabled: z.boolean(),
})

type EditForm = z.infer<typeof editSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
}

function formatAmount(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminFeesPage() {
  const qc = useQueryClient()
  const [editRule, setEditRule] = useState<FeeRule | null>(null)

  const { data: rules, isLoading, isError, refetch } = useQuery<FeeRule[]>({
    queryKey: ["admin-fee-rules"],
    queryFn: async () => (await apiClient.get<FeeRule[]>("/admin/fee-rules")).data,
  })

  const form = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<EditForm> }) =>
      apiClient.patch(`/admin/fee-rules/${id}`, body),
    onSuccess: () => {
      toast.success("Fee rule updated.")
      setEditRule(null)
      qc.invalidateQueries({ queryKey: ["admin-fee-rules"] })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update fee rule."),
  })

  function openEdit(rule: FeeRule) {
    setEditRule(rule)
    form.reset({
      feeType: rule.feeType,
      fixedAmount: Number(rule.fixedAmount),
      percentage: Number(rule.percentage),
      minFee: Number(rule.minFee),
      maxFee: Number(rule.maxFee),
      isEnabled: rule.isEnabled,
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Fee Rules</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure platform fees per funding method. Fees are always computed server-side — the frontend never calculates them.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-destructive">Failed to load fee rules.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Method</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Fee Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Fixed</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">%</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Min Fee</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Max Fee</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Enabled</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Last updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {(rules ?? []).map((rule) => (
                <tr key={rule.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {METHOD_LABELS[rule.method] ?? rule.method}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{rule.feeType}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatAmount(rule.fixedAmount)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{rule.percentage}%</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatAmount(rule.minFee)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatAmount(rule.maxFee)}</td>
                  <td className="px-4 py-3">
                    {rule.isEnabled ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Check className="mr-1 size-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-red-300 text-red-600 dark:border-red-800 dark:text-red-400">
                        <X className="mr-1 size-3" /> Disabled
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(rule.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(rule)}>
                      <Pencil className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editRule} onOpenChange={(open) => !open && setEditRule(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit {editRule ? METHOD_LABELS[editRule.method] : ""} Fee Rule
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) =>
              editRule && updateMutation.mutate({ id: editRule.id, body: values })
            )}
            className="space-y-4"
            noValidate
          >
            <Field>
              <FieldLabel>Fee Type</FieldLabel>
              <Select
                defaultValue={editRule?.feeType ?? "PERCENTAGE"}
                onValueChange={(v) => form.setValue("feeType", v as "FIXED" | "PERCENTAGE")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.feeType]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Fixed Amount (₹)</FieldLabel>
                <Input type="number" step="0.01" min="0" {...form.register("fixedAmount", { valueAsNumber: true })} />
                <FieldError errors={[form.formState.errors.fixedAmount]} />
              </Field>
              <Field>
                <FieldLabel>Percentage (%)</FieldLabel>
                <Input type="number" step="0.01" min="0" max="100" {...form.register("percentage", { valueAsNumber: true })} />
                <FieldError errors={[form.formState.errors.percentage]} />
              </Field>
              <Field>
                <FieldLabel>Min Fee (₹)</FieldLabel>
                <Input type="number" step="0.01" min="0" {...form.register("minFee", { valueAsNumber: true })} />
                <FieldError errors={[form.formState.errors.minFee]} />
              </Field>
              <Field>
                <FieldLabel>Max Fee (₹)</FieldLabel>
                <Input type="number" step="0.01" min="0" {...form.register("maxFee", { valueAsNumber: true })} />
                <FieldError errors={[form.formState.errors.maxFee]} />
              </Field>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isEnabled"
                type="checkbox"
                className="size-4 rounded border-input"
                {...form.register("isEnabled")}
              />
              <label htmlFor="isEnabled" className="text-sm text-foreground">
                Enable this fee rule
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditRule(null)}>
                Cancel
              </Button>
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

export default AdminFeesPage
