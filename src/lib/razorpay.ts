// Minimal typings + loader for Razorpay Standard Checkout.
// The script is only fetched when a customer actually starts a card payment.

interface RazorpaySuccess {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: RazorpaySuccess) => void
  modal?: { ondismiss?: () => void; confirm_close?: boolean }
}

interface RazorpayInstance {
  open: () => void
  on: (event: "payment.failed", cb: (response: unknown) => void) => void
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

export function loadRazorpayCheckout(): Promise<RazorpayConstructor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = CHECKOUT_SRC
    script.async = true
    script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay unavailable")))
    script.onerror = () => reject(new Error("Could not load the secure payment window. Check your connection."))
    document.head.appendChild(script)
  })
}
