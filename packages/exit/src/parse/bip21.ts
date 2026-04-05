import { FlyoverUtils } from '@rsksmart/flyover-sdk'
import type { ExitNetwork, ParsedBitcoinPay } from '../types.js'

export type ParseBitcoinPayResult =
  | { ok: true; value: ParsedBitcoinPay }
  | { ok: false; error: string }

function parseBtcToSatoshis(amount: string): bigint | null {
  const t = amount.trim()
  if (!t || !/^\d+(\.\d+)?$/.test(t)) return null
  const [whole, frac = ''] = t.split('.')
  const fracPadded = `${frac}00000000`.slice(0, 8)
  if (!/^\d{8}$/.test(fracPadded)) return null
  try {
    return BigInt(whole) * 10_000_000n + BigInt(fracPadded)
  } catch {
    return null
  }
}

/**
 * Parse a bare Bitcoin address or a BIP-21 URI (`bitcoin:...?amount=&label=`).
 */
export function parseBitcoinPayInput(input: string, network: ExitNetwork): ParseBitcoinPayResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: 'Enter a Bitcoin address or a BIP-21 payment URI.' }

  let addressPart = trimmed
  let query = ''

  if (/^bitcoin:/i.test(trimmed)) {
    let rest = trimmed.slice(trimmed.indexOf(':') + 1)
    if (rest.startsWith('//')) rest = rest.slice(2)
    const q = rest.indexOf('?')
    if (q >= 0) {
      addressPart = rest.slice(0, q)
      query = rest.slice(q + 1)
    } else {
      addressPart = rest
    }
  }

  const address = addressPart.trim()
  const isTestnet = network === 'testnet'
  const valid = isTestnet ? FlyoverUtils.isBtcTestnetAddress(address) : FlyoverUtils.isBtcMainnetAddress(address)
  if (!valid) {
    return {
      ok: false,
      error: isTestnet
        ? 'Not a valid Bitcoin testnet address for this network.'
        : 'Not a valid Bitcoin mainnet address for this network.',
    }
  }

  const params = new URLSearchParams(query)
  const amountBtc = params.get('amount')?.trim() || undefined
  let amountSatoshis: bigint | undefined
  if (amountBtc) {
    const sats = parseBtcToSatoshis(amountBtc)
    if (sats === null || sats <= 0n) return { ok: false, error: 'Invalid amount in payment URI.' }
    amountSatoshis = sats
  }

  return {
    ok: true,
    value: {
      address,
      amountBtc,
      amountSatoshis,
      label: params.get('label') ?? undefined,
      message: params.get('message') ?? undefined,
    },
  }
}
