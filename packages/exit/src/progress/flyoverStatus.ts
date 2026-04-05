import { FlyoverUtils } from '@rsksmart/flyover-sdk'
import type { ExitStage } from '../types.js'

/**
 * Map Flyover peg-out status strings (from {@link Flyover.getPegoutStatus}) into coarse UI stages.
 */
export function mapPegoutDetailStatusToExitStage(rawStatus: string): ExitStage {
  const simple = FlyoverUtils.getSimpleQuoteStatus(rawStatus)
  if (simple === 'SUCCESS') return 'confirmed'
  if (simple === 'FAILED' || simple === 'EXPIRED') return 'idle'
  // Distinguishing mempool vs bridge would need BTC / RSK tx inspection; treat in-flight as bridge.
  return 'bridge'
}
