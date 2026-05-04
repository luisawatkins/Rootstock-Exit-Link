import type { SwapEstimation } from '@rsksmart/rsk-swap-sdk'
import { describe, expect, it } from 'vitest'
import { pickBestSwapEstimation } from './swapToRbtc.js'

type EstimationFixture = Pick<SwapEstimation, 'providerId' | 'total'>

describe('pickBestSwapEstimation', () => {
  it('picks provider with highest total when totals are bigints (RBTC wei)', () => {
    const fixtures: EstimationFixture[] = [
      { providerId: 'a', total: 100n },
      { providerId: 'b', total: 500n },
      { providerId: 'c', total: 200n },
    ]
    expect(pickBestSwapEstimation(fixtures).providerId).toBe('b')
  })

  it('picks provider with highest total when totals are numbers', () => {
    const fixtures: EstimationFixture[] = [
      { providerId: 'a', total: 100 },
      { providerId: 'b', total: 500 },
      { providerId: 'c', total: 200 },
    ]
    expect(pickBestSwapEstimation(fixtures).providerId).toBe('b')
  })

  it('throws on a non-finite numeric total', () => {
    const fixtures: EstimationFixture[] = [
      { providerId: 'a', total: 1n },
      { providerId: 'b', total: Number.NaN },
    ]
    expect(() => pickBestSwapEstimation(fixtures)).toThrow(/Invalid swap estimation/)
  })

  it('throws when empty', () => {
    expect(() => pickBestSwapEstimation([])).toThrow(/No swap estimations/)
  })
})
