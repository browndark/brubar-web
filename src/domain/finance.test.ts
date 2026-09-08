import { describe, expect, it } from 'vitest'
import { calculateCheckout } from './finance'

describe('calculateCheckout', () => {
  it('calcula subtotal e taxa em centavos', () => {
    expect(calculateCheckout({ lines: [{ quantity: 2, unitPriceCents: 2990 }, { quantity: 1, unitPriceCents: 650 }], discountCents: 0, serviceChargeRate: 0.1 })).toEqual({ subtotalCents: 6630, serviceChargeCents: 663, totalCents: 7293 })
  })

  it('limita desconto ao subtotal antes da taxa', () => {
    expect(calculateCheckout({ lines: [{ quantity: 1, unitPriceCents: 1000 }], discountCents: 1400, serviceChargeRate: 0.1 })).toEqual({ subtotalCents: 1000, serviceChargeCents: 0, totalCents: 0 })
  })

  it('arredonda taxa fracionada para o centavo mais próximo', () => {
    expect(calculateCheckout({ lines: [{ quantity: 1, unitPriceCents: 999 }], discountCents: 0, serviceChargeRate: 0.1 }).serviceChargeCents).toBe(100)
  })
})
