import { describe, expect, it } from 'vitest'
import { recommendBridgeRoute } from './recommendRoute.js'

describe('recommendBridgeRoute', () => {
  it('prefers PowPeg for large low-urgency when Flyover is available', () => {
    const r = recommendBridgeRoute({
      urgency: 'low',
      amountSatoshis: 60_000_000n,
      flyoverQuotesAvailable: true,
    })
    expect(r.route).toBe('powpeg')
  })

  it('suggests Flyover when quotes exist and urgency is high', () => {
    const r = recommendBridgeRoute({
      urgency: 'high',
      flyoverQuotesAvailable: true,
    })
    expect(r.route).toBe('flyover')
    expect(r.flyoverPreferred).toBe(true)
  })
})
