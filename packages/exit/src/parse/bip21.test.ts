import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  isBtcTestnetAddress: vi.fn(),
  isBtcMainnetAddress: vi.fn(),
}))

vi.mock('@rsksmart/flyover-sdk', () => ({
  FlyoverUtils: {
    isBtcTestnetAddress: mocks.isBtcTestnetAddress,
    isBtcMainnetAddress: mocks.isBtcMainnetAddress,
  },
}))

import { parseBitcoinPayInput } from './bip21.js'

describe('parseBitcoinPayInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isBtcTestnetAddress.mockImplementation(
      (a: string) => a.startsWith('tb1') || a.startsWith('m') || a.startsWith('n'),
    )
    mocks.isBtcMainnetAddress.mockImplementation(
      (a: string) => a.startsWith('bc1') || a.startsWith('1') || a.startsWith('3'),
    )
  })

  it('parses 1 BTC in satoshis (100_000_000 sats)', () => {
    mocks.isBtcMainnetAddress.mockReturnValue(true)
    const r = parseBitcoinPayInput('bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=1', 'mainnet')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.amountSatoshis).toBe(100_000_000n)
  })

  it('parses fractional BTC to 8 decimal places', () => {
    mocks.isBtcTestnetAddress.mockReturnValue(true)
    const r = parseBitcoinPayInput(
      'bitcoin:tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx?amount=0.0001',
      'testnet',
    )
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.amountSatoshis).toBe(10_000n)
  })

  it('rejects more than 8 fractional digits', () => {
    mocks.isBtcMainnetAddress.mockReturnValue(true)
    const r = parseBitcoinPayInput('bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.000000001', 'mainnet')
    expect(r.ok).toBe(false)
  })

  it('rejects amount above 21M BTC', () => {
    mocks.isBtcMainnetAddress.mockReturnValue(true)
    const r = parseBitcoinPayInput('bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=21000000.00000001', 'mainnet')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/maximum/i)
  })
})
