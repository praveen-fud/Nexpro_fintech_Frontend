import { type ComponentProps } from "react"
import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface IconInputProps extends ComponentProps<"input"> {
  icon: LucideIcon
}

export function IconInput({ icon: Icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  )
}
