import type { RskSwapSDK, SwapEstimation } from '@rsksmart/rsk-swap-sdk'

export interface SwapToRbtcParams {
  fromToken: string
  fromAmount: bigint
  recipientRsk: string
  refundRsk: string
  /** Max allowed adverse move vs first quote, in basis points (100 = 1%). Default 100. */
  slippageBps?: number
}

export interface SwapToRbtcResult {
  txHash: string
  providerId: string
}

const RSK_CHAIN = '30'
const DEFAULT_SLIPPAGE_BPS = 100

function estimationTotalWei(e: SwapEstimation): bigint {
  const t = e.total
  if (typeof t === 'bigint') return t
  if (typeof t === 'number' && Number.isFinite(t)) return BigInt(Math.trunc(t))
  throw new Error('Invalid swap estimation: total is not a finite number')
}

/** Prefer the route with the highest stated `total` in destination units (RBTC wei for swaps → RBTC). */
export function pickBestSwapEstimation(estimations: SwapEstimation[]): SwapEstimation {
  if (estimations.length === 0) {
    throw new Error('No swap estimations to choose from.')
  }
  return estimations.reduce((best, cur) => (estimationTotalWei(cur) > estimationTotalWei(best) ? cur : best))
}

/**
 * Estimate providers, pick the best-priced route, re-quote once for slippage protection, then execute.
 */
export async function runSwapToRbtc(sdk: RskSwapSDK, params: SwapToRbtcParams): Promise<SwapToRbtcResult> {
  const slippageBps = params.slippageBps ?? DEFAULT_SLIPPAGE_BPS
  if (slippageBps < 0 || slippageBps > 10_000) {
    throw new Error('slippageBps must be between 0 and 10000.')
  }

  const estimateArgs = {
    fromChainId: RSK_CHAIN,
    toChainId: RSK_CHAIN,
    fromToken: params.fromToken,
    toToken: 'RBTC',
    fromAmount: params.fromAmount,
    address: params.recipientRsk,
    toAddress: params.recipientRsk,
  }

  const estimations = await sdk.estimateSwap(estimateArgs)

  if (estimations.length === 0) {
    throw new Error(`No swap route found for ${params.fromToken} → RBTC on Rootstock.`)
  }

  const firstPick = pickBestSwapEstimation(estimations)
  const baselineOut = estimationTotalWei(firstPick)

  const refreshed = await sdk.estimateSwap(estimateArgs)
  const refreshedPick = refreshed.find((e) => e.providerId === firstPick.providerId) ?? null
  if (!refreshedPick) {
    throw new Error(`Swap provider "${firstPick.providerId}" no longer quotes this pair; refresh and try again.`)
  }

  const refreshedOut = estimationTotalWei(refreshedPick)
  const minOut = (baselineOut * BigInt(10_000 - slippageBps)) / 10_000n
  if (refreshedOut < minOut) {
    throw new Error(
      `Swap quote moved beyond slippage tolerance (${slippageBps} bps). Expected at least ${minOut} wei RBTC, latest quote ${refreshedOut} wei.`,
    )
  }

  const created = await sdk.createNewSwap({
    providerId: refreshedPick.providerId,
    fromNetwork: RSK_CHAIN,
    toNetwork: RSK_CHAIN,
    fromToken: params.fromToken,
    toToken: 'RBTC',
    fromAmount: params.fromAmount,
    address: params.recipientRsk,
    refundAddress: params.refundRsk,
  })

  const txHash = await sdk.executeSwap(created.action)

  if (created.action.requiresClaim) {
    await sdk.claimSwap(created)
  }

  return { txHash, providerId: refreshedPick.providerId }
}
