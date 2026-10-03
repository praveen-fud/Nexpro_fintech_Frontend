const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const inrFormatterPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

/** Formats a number as Indian Rupees, e.g. 75000 -> "₹75,000". */
export function formatCurrency(amount: number, precise = false): string {
  return precise ? inrFormatterPrecise.format(amount) : inrFormatter.format(amount)
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  const diffMs = date.getTime() - Date.now()
  const diffSeconds = Math.round(diffMs / 1000)
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ]
  const rtf = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" })
  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return rtf.format(Math.round(diffSeconds / secondsInUnit), unit)
    }
  }
  return rtf.format(diffSeconds, "second")
}

export function maskCardNumber(last4: string): string {
  return `•••• ${last4}`
}
