/** 1 satoshi = 1e10 wei on Rootstock (RBTC uses 18 decimals, pegged 1:1 with BTC). */
export function satoshisToWei(sats: bigint): bigint {
  return sats * 10_000_000_000n
}

/** Parse decimal RBTC string (e.g. "0.004") to wei. */
export function rbtcDecimalToWei(amount: string): bigint | null {
  const t = amount.trim()
  if (!t || !/^\d+(\.\d+)?$/.test(t)) return null
  const [whole, frac = ''] = t.split('.')
  const fracPadded = `${frac}000000000000000000`.slice(0, 18)
  try {
    return BigInt(whole) * 1_000_000_000_000_000_000n + BigInt(fracPadded)
  } catch {
    return null
  }
}

export function weiToRbtcDecimal(wei: bigint): string {
  const w = wei.toString().padStart(19, '0')
  const whole = w.slice(0, -18) || '0'
  const frac = w.slice(-18).replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole
}

/** Parse a non-negative decimal string into fixed-decimal units (e.g. ERC-20 `amount`). */
export function decimalToUnits(amount: string, decimals: number): bigint | null {
  if (decimals < 0 || decimals > 36) return null
  const t = amount.trim()
  if (!t || !/^\d+(\.\d+)?$/.test(t)) return null
  const [whole, frac = ''] = t.split('.')
  const fracPadded = `${frac}${'0'.repeat(decimals)}`.slice(0, decimals)
  try {
    const base = 10n ** BigInt(decimals)
    return BigInt(whole) * base + BigInt(fracPadded)
  } catch {
    return null
  }
}
