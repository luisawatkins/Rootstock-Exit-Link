import type { RskSwapSDK } from '@rsksmart/rsk-swap-sdk'

export interface SwapToRbtcParams {
  fromToken: string
  fromAmount: bigint
  recipientRsk: string
  refundRsk: string
}

export interface SwapToRbtcResult {
  txHash: string
  providerId: string
}

const RSK_CHAIN = '30'

/**
 * Estimate providers, pick the first estimation, create the swap, and execute the on-chain action.
 */
export async function runSwapToRbtc(sdk: RskSwapSDK, params: SwapToRbtcParams): Promise<SwapToRbtcResult> {
  const estimations = await sdk.estimateSwap({
    fromChainId: RSK_CHAIN,
    toChainId: RSK_CHAIN,
    fromToken: params.fromToken,
    toToken: 'RBTC',
    fromAmount: params.fromAmount,
    address: params.recipientRsk,
    toAddress: params.recipientRsk,
  })

  if (estimations.length === 0) {
    throw new Error(`No swap route found for ${params.fromToken} → RBTC on Rootstock.`)
  }

  const pick = estimations[0]
  const created = await sdk.createNewSwap({
    providerId: pick.providerId,
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

  return { txHash, providerId: pick.providerId }
}
