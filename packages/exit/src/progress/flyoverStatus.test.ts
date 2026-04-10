import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSimpleQuoteStatus: vi.fn(),
}))

vi.mock('@rsksmart/flyover-sdk', () => ({
  FlyoverUtils: {
    getSimpleQuoteStatus: mocks.getSimpleQuoteStatus,
  },
}))

import { mapPegoutDetailStatusToExitStage } from './flyoverStatus.js'

describe('mapPegoutDetailStatusToExitStage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps SUCCESS to confirmed', () => {
    mocks.getSimpleQuoteStatus.mockReturnValue('SUCCESS')
    expect(mapPegoutDetailStatusToExitStage('x')).toBe('confirmed')
  })

  it('maps PENDING with btc hint to mempool', () => {
    mocks.getSimpleQuoteStatus.mockReturnValue('PENDING')
    expect(mapPegoutDetailStatusToExitStage('AWAITING_BTC')).toBe('mempool')
  })

  it('maps other PENDING to bridge', () => {
    mocks.getSimpleQuoteStatus.mockReturnValue('PENDING')
    expect(mapPegoutDetailStatusToExitStage('LP_PROCESSING')).toBe('bridge')
  })
})
