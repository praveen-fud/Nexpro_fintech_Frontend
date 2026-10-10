import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { UserPlus, Search, MoreHorizontal, ShieldCheck, Loader2, UserX, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { PasswordInput } from "@/components/shared/password-input"
import { apiClient, ApiError } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

type StaffRole = "OPERATIONS" | "SUPER_ADMIN"

interface StaffUser {
  id: string
  fullName: string
  email: string
  mobileNumber: string
  role: StaffRole
  isActive: boolean
  createdAt: string
}

interface UserListResponse {
  items: StaffUser[]
  total: number
}

// ── Schema ────────────────────────────────────────────────────────────────────

const createSchema = z.object({
  fullName: z.string().min(2, "Enter the full name"),
  email: z.string().email("Enter a valid email address"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  role: z.enum(["OPERATIONS", "SUPER_ADMIN"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type CreateForm = z.infer<typeof createSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<StaffRole, string> = {
  OPERATIONS: "Operations",
  SUPER_ADMIN: "Super Admin",
}

function RoleBadge({ role }: { role: StaffRole }) {
  return (
    <Badge
      variant={role === "SUPER_ADMIN" ? "default" : "secondary"}
      className={
        role === "SUPER_ADMIN"
          ? "bg-primary text-primary-foreground hover:bg-brand-primary-dark"
          : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
      }
    >
      {ROLE_LABELS[role]}
    </Badge>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
          : "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400"
      }
    >
      {isActive ? "Active" : "Deactivated"}
    </Badge>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function UserManagementPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<StaffUser | null>(null)

  // ── Queries ──────────────────────────────────────────────────────────────────

  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (roleFilter !== "ALL") params.set("role", roleFilter)

  const { data, isLoading, isError, refetch } = useQuery<UserListResponse>({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: async () => (await apiClient.get<UserListResponse>(`/admin/users?${params}`)).data,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { fullName: "", email: "", mobileNumber: "", role: "OPERATIONS", password: "" },
  })

  const createMutation = useMutation({
    mutationFn: (body: CreateForm) => apiClient.post<StaffUser>("/admin/users", body),
    onSuccess: () => {
      toast.success("User created successfully.")
      form.reset()
      setCreateOpen(false)
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not create user."
      toast.error(msg)
      if (err instanceof ApiError && err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof CreateForm, { message })
        })
      }
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success("User deactivated.")
      setConfirmDeactivate(null)
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not deactivate user."),
  })

  const reactivateMutation = useMutation({
    mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}`, { isActive: true }),
    onSuccess: () => {
      toast.success("User reactivated.")
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not reactivate user."),
  })

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Operations Team</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage staff accounts. Customers self-register — only Operations and Super Admin accounts are created here.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0 gap-2">
          <UserPlus className="size-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="OPERATIONS">Operations</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-sm text-destructive">Failed to load users.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-20 text-center">
          <ShieldCheck className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No staff users yet</p>
          <p className="text-xs text-muted-foreground">
            Click <strong>Add User</strong> to create the first Operations or Super Admin account.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Mobile</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{u.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{u.mobileNumber}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={u.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.isActive ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setConfirmDeactivate(u)}
                          >
                            <UserX className="mr-2 size-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => reactivateMutation.mutate(u.id)}>
                            <RefreshCw className="mr-2 size-4" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-4 py-2.5 text-xs text-muted-foreground">
            {data.total} user{data.total !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.fullName}>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input id="fullName" placeholder="Jane Doe" {...form.register("fullName")} />
                <FieldError errors={[form.formState.errors.fullName]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="jane@yourcompany.com" {...form.register("email")} />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.mobileNumber}>
                <FieldLabel htmlFor="mobileNumber">Mobile Number</FieldLabel>
                <Input id="mobileNumber" placeholder="9876543210" maxLength={10} {...form.register("mobileNumber")} />
                <FieldError errors={[form.formState.errors.mobileNumber]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.role}>
                <FieldLabel>Role</FieldLabel>
                <Select
                  defaultValue="OPERATIONS"
                  onValueChange={(v) => form.setValue("role", v as StaffRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERATIONS">Operations</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.role]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.password}>
                <FieldLabel htmlFor="newPassword">Password</FieldLabel>
                <PasswordInput id="newPassword" placeholder="Min 8 characters" autoComplete="new-password" {...form.register("password")} />
                <FieldError errors={[form.formState.errors.password]} />
              </Field>
            </FieldGroup>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={!!confirmDeactivate} onOpenChange={(open) => !open && setConfirmDeactivate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will prevent <strong>{confirmDeactivate?.fullName}</strong> from signing in. The account and its audit
            history are preserved. You can reactivate it at any time.
          </p>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setConfirmDeactivate(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={() => confirmDeactivate && deactivateMutation.mutate(confirmDeactivate.id)}
              className="gap-2"
            >
              {deactivateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagementPage
