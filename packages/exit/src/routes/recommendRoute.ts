import type { BridgeRoute, RouteRecommendation, Urgency } from '../types.js'

export interface RecommendRouteInput {
  amountSatoshis?: bigint
  urgency: Urgency
  flyoverQuotesAvailable: boolean
  powPegEtaHours?: number
}

const DEFAULT_POWPEG_HOURS = 34

/**
 * Choose Flyover (fast LP bridge) vs PowPeg (native bridge) using amount and urgency heuristics.
 */
export function recommendBridgeRoute(input: RecommendRouteInput): RouteRecommendation {
  const powEta = input.powPegEtaHours ?? DEFAULT_POWPEG_HOURS
  const flyoverPreferred =
    input.flyoverQuotesAvailable && (input.urgency === 'high' || input.urgency === 'medium')

  const largeSlow =
    input.amountSatoshis !== undefined &&
    input.amountSatoshis > 50_000_000n &&
    input.urgency === 'low'

  let route: BridgeRoute
  let summary: string

  if (input.flyoverQuotesAvailable) {
    if (largeSlow) {
      route = 'powpeg'
      summary = `PowPeg can be cheaper for large, non-urgent amounts (typical completion ~${powEta}h). Flyover remains available if you need speed.`
    } else if (flyoverPreferred) {
      route = 'flyover'
      summary = 'Flyover is the better fit for this urgency; liquidity providers settle in minutes to a few hours.'
    } else {
      route = 'flyover'
      summary = 'Flyover quotes are available and usually complete much faster than PowPeg.'
    }
  } else {
    route = 'powpeg'
    summary = `Flyover quotes are not available (liquidity or connectivity). PowPeg native peg-out typically takes ~${powEta}h.`
  }

  return { route, summary, flyoverPreferred }
}
