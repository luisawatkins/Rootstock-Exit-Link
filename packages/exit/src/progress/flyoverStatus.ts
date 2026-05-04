import { FlyoverUtils } from '@rsksmart/flyover-sdk'
import type { ExitStage } from '../types.js'

/**
 * Local mirror of @rsksmart/flyover-sdk `src/constants/status.ts`. The SDK does not
 * re-export this enum from its public entry point, so we pin the strings here and
 * fall back to the simple-status bucket for any value we don't recognise.
 */
export const FlyoverPegoutStatus = {
  WaitingForDeposit: 'WaitingForDeposit',
  WaitingForDepositConfirmations: 'WaitingForDepositConfirmations',
  TimeForDepositElapsed: 'TimeForDepositElapsed',
  SendPegoutSucceeded: 'SendPegoutSucceeded',
  SendPegoutFailed: 'SendPegoutFailed',
  RefundPegOutSucceeded: 'RefundPegOutSucceeded',
  RefundPegOutFailed: 'RefundPegOutFailed',
  BridgeTxSucceeded: 'BridgeTxSucceeded',
  BridgeTxFailed: 'BridgeTxFailed',
} as const
export type FlyoverPegoutStatus =
  (typeof FlyoverPegoutStatus)[keyof typeof FlyoverPegoutStatus]

/**
 * Map Flyover peg-out status strings (from {@link Flyover.getPegoutStatus}) into coarse UI stages.
 */
export function mapPegoutDetailStatusToExitStage(rawStatus: string): ExitStage {
  switch (rawStatus) {
    case FlyoverPegoutStatus.SendPegoutSucceeded:
      return 'mempool'
    case FlyoverPegoutStatus.BridgeTxSucceeded:
    case FlyoverPegoutStatus.RefundPegOutSucceeded:
      return 'confirmed'
    case FlyoverPegoutStatus.WaitingForDeposit:
    case FlyoverPegoutStatus.WaitingForDepositConfirmations:
      return 'bridge'
    case FlyoverPegoutStatus.TimeForDepositElapsed:
    case FlyoverPegoutStatus.SendPegoutFailed:
    case FlyoverPegoutStatus.RefundPegOutFailed:
    case FlyoverPegoutStatus.BridgeTxFailed:
      return 'idle'
  }

  const simple = FlyoverUtils.getSimpleQuoteStatus(rawStatus)
  if (simple === 'SUCCESS') return 'confirmed'
  if (simple === 'FAILED' || simple === 'EXPIRED') return 'idle'
  return 'bridge'
}
