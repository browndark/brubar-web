export type OrderLine = { quantity: number; unitPriceCents: number }

export type CheckoutInput = {
  lines: OrderLine[]
  discountCents: number
  serviceChargeRate: number
}

export type CheckoutTotals = {
  subtotalCents: number
  serviceChargeCents: number
  totalCents: number
}

export function calculateCheckout({ lines, discountCents, serviceChargeRate }: CheckoutInput): CheckoutTotals {
  const subtotalCents = lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0)
  const safeDiscount = Math.min(Math.max(0, discountCents), subtotalCents)
  const taxableCents = subtotalCents - safeDiscount
  const serviceChargeCents = Math.round(taxableCents * serviceChargeRate)
  return { subtotalCents, serviceChargeCents, totalCents: taxableCents + serviceChargeCents }
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}
