import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSimpleQuoteStatus: vi.fn(),
}))

vi.mock('@rsksmart/flyover-sdk', () => ({
  FlyoverUtils: {
    getSimpleQuoteStatus: mocks.getSimpleQuoteStatus,
  },
}))

import { FlyoverPegoutStatus, mapPegoutDetailStatusToExitStage } from './flyoverStatus.js'

describe('mapPegoutDetailStatusToExitStage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps SendPegoutSucceeded to mempool without consulting the SDK', () => {
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.SendPegoutSucceeded)).toBe(
      'mempool',
    )
    expect(mocks.getSimpleQuoteStatus).not.toHaveBeenCalled()
  })

  it('maps BridgeTxSucceeded and RefundPegOutSucceeded to confirmed', () => {
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.BridgeTxSucceeded)).toBe(
      'confirmed',
    )
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.RefundPegOutSucceeded)).toBe(
      'confirmed',
    )
  })

  it('maps WaitingForDepositConfirmations to bridge', () => {
    expect(
      mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.WaitingForDepositConfirmations),
    ).toBe('bridge')
  })

  it('maps WaitingForDeposit to bridge', () => {
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.WaitingForDeposit)).toBe(
      'bridge',
    )
  })

  it('maps failure / expired statuses to idle', () => {
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.TimeForDepositElapsed)).toBe(
      'idle',
    )
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.SendPegoutFailed)).toBe('idle')
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.RefundPegOutFailed)).toBe('idle')
    expect(mapPegoutDetailStatusToExitStage(FlyoverPegoutStatus.BridgeTxFailed)).toBe('idle')
  })

  it('falls back to the SDK simple-status bucket for unknown PENDING statuses', () => {
    mocks.getSimpleQuoteStatus.mockReturnValue('PENDING')
    expect(mapPegoutDetailStatusToExitStage('SomeFutureStatus')).toBe('bridge')
  })

  it('falls back to confirmed when the SDK reports SUCCESS for an unknown status', () => {
    mocks.getSimpleQuoteStatus.mockReturnValue('SUCCESS')
    expect(mapPegoutDetailStatusToExitStage('SomeFutureSuccess')).toBe('confirmed')
  })

  it('falls back to idle when the SDK reports FAILED or EXPIRED', () => {
    mocks.getSimpleQuoteStatus.mockReturnValue('FAILED')
    expect(mapPegoutDetailStatusToExitStage('SomeFutureFailure')).toBe('idle')
    mocks.getSimpleQuoteStatus.mockReturnValue('EXPIRED')
    expect(mapPegoutDetailStatusToExitStage('SomeFutureExpired')).toBe('idle')
  })
})
