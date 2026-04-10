import { describe, expect, it } from 'vitest'
import { decimalToUnits, rbtcDecimalToWei, weiToRbtcDecimal } from './amount.js'

describe('decimalToUnits', () => {
  it('parses within decimals', () => {
    expect(decimalToUnits('1.5', 18)).toBe(15n * 10n ** 17n)
  })

  it('rejects excess fractional precision', () => {
    expect(decimalToUnits('1.0000000000000000001', 18)).toBeNull()
  })
})

describe('rbtcDecimalToWei', () => {
  it('returns null for invalid input', () => {
    expect(rbtcDecimalToWei('')).toBeNull()
    expect(rbtcDecimalToWei('abc')).toBeNull()
  })

  it('round-trips with weiToRbtcDecimal for simple values', () => {
    const w = rbtcDecimalToWei('0.004')
    expect(w).not.toBeNull()
    if (w !== null) expect(weiToRbtcDecimal(w)).toMatch(/^0\.004/)
  })
})
