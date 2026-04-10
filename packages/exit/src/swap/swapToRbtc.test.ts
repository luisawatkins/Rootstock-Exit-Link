import { describe, expect, it } from 'vitest'
import { pickBestSwapEstimation } from './swapToRbtc.js'

describe('pickBestSwapEstimation', () => {
  it('picks provider with highest total (RBTC wei)', () => {
    const best = pickBestSwapEstimation([
      { providerId: 'a', total: 100n } as never,
      { providerId: 'b', total: 500n } as never,
      { providerId: 'c', total: 200n } as never,
    ])
    expect(best.providerId).toBe('b')
  })

  it('throws when empty', () => {
    expect(() => pickBestSwapEstimation([])).toThrow(/No swap estimations/)
  })
})
