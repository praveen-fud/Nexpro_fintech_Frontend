import Select, { type ClassNamesConfig } from "react-select"
import { INDIAN_BANK_GROUPS } from "@/lib/indian-banks"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

const groupedOptions = INDIAN_BANK_GROUPS.map((g) => ({
  label: g.label,
  options: g.banks.map((b) => ({ value: b, label: b })),
}))

// Unstyled + Tailwind classes so the control shares the exact tokens of <Input>
// (height, radius, border, focus ring, dark-mode fill, invalid state).
const classNames = (invalid: boolean): ClassNamesConfig<Option, false> => ({
  control: ({ isFocused }) =>
    cn(
      "min-h-8 w-full rounded-lg border bg-transparent px-1 text-base transition-colors md:text-sm dark:bg-input/30",
      invalid
        ? "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40"
        : isFocused
          ? "border-ring ring-3 ring-ring/50"
          : "border-input"
    ),
  valueContainer: () => "gap-1 px-1.5 py-0.5",
  singleValue: () => "text-foreground",
  input: () => "text-foreground",
  placeholder: () => "text-muted-foreground",
  indicatorsContainer: () => "gap-0.5",
  clearIndicator: () => "rounded-md p-1 text-muted-foreground hover:text-foreground",
  dropdownIndicator: () => "rounded-md p-1 text-muted-foreground hover:text-foreground",
  menu: () => "mt-1 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
  menuList: () => "p-1",
  groupHeading: () => "px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
  option: ({ isFocused, isSelected }) =>
    cn(
      "cursor-pointer rounded-md px-2.5 py-1.5 text-sm",
      isSelected
        ? "bg-primary text-primary-foreground"
        : isFocused
          ? "bg-primary/10 text-foreground"
          : "text-foreground"
    ),
  noOptionsMessage: () => "px-2.5 py-3 text-sm text-muted-foreground",
})

interface BankSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
}

export function BankSelect({ id, value, onChange, onBlur, invalid = false }: BankSelectProps) {
  const selected = value ? { value, label: value } : null
  return (
    <Select<Option, false>
      inputId={id}
      options={groupedOptions}
      value={selected}
      onChange={(opt) => onChange(opt?.value ?? "")}
      onBlur={onBlur}
      placeholder="Search or select your bank"
      noOptionsMessage={() => "No matching bank — choose “Other”"}
      isClearable
      unstyled
      classNames={classNames(invalid)}
      menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
    />
  )
}
