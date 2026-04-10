import { FlyoverUtils } from '@rsksmart/flyover-sdk'
import type { ExitStage } from '../types.js'

/**
 * Map Flyover peg-out status strings (from {@link Flyover.getPegoutStatus}) into coarse UI stages.
 */
export function mapPegoutDetailStatusToExitStage(rawStatus: string): ExitStage {
  const simple = FlyoverUtils.getSimpleQuoteStatus(rawStatus)
  if (simple === 'SUCCESS') return 'confirmed'
  if (simple === 'FAILED' || simple === 'EXPIRED') return 'idle'

  const lower = rawStatus.toLowerCase()
  if (
    simple === 'PENDING' &&
    (lower.includes('mempool') || lower.includes('btc') || lower.includes('bitcoin'))
  ) {
    return 'mempool'
  }

  return 'bridge'
}
