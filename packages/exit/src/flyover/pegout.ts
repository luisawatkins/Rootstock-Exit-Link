import { Flyover, FlyoverUtils, type LiquidityProvider, type PegoutQuote } from '@rsksmart/flyover-sdk'
import type { PegoutQuotePreview } from '../types.js'

export interface PegoutQuoteSelection {
  preview: PegoutQuotePreview
  /** Must be selected on the Flyover client before accept/deposit. */
  liquidityProvider: LiquidityProvider
}

/**
 * Request peg-out quotes from every liquidity provider and pick the lowest total cost.
 */
export async function fetchBestPegoutQuote(
  flyover: Flyover,
  params: { rskRefundAddress: string; btcDestination: string; valueWei: bigint },
): Promise<PegoutQuoteSelection | null> {
  const providers = await flyover.getLiquidityProviders()
  if (providers.length === 0) return null

  let best: {
    quote: PegoutQuote
    total: bigint
    liquidityProvider: LiquidityProvider
  } | null = null

  for (const liquidityProvider of providers) {
    flyover.useLiquidityProvider(liquidityProvider)
    const quotes = await flyover.getPegoutQuotes({
      rskRefundAddress: params.rskRefundAddress,
      to: params.btcDestination,
      valueToTransfer: params.valueWei,
    })
    for (const quote of quotes) {
      const total = FlyoverUtils.getQuoteTotal(quote)
      if (!best || total < best.total) {
        best = { quote, total, liquidityProvider }
      }
    }
  }

  if (!best) return null

  return {
    liquidityProvider: best.liquidityProvider,
    preview: {
      quote: best.quote,
      totalWei: best.total,
      providerName: best.liquidityProvider.name,
    },
  }
}

/**
 * Accept the quote and call `depositPegout` on the Liquidity Bridge Contract.
 */
export async function executeFlyoverPegout(flyover: Flyover, selection: PegoutQuoteSelection): Promise<string> {
  flyover.useLiquidityProvider(selection.liquidityProvider)
  const accepted = await flyover.acceptPegoutQuote(selection.preview.quote)
  const amount = FlyoverUtils.getQuoteTotal(selection.preview.quote)
  return flyover.depositPegout(selection.preview.quote, accepted.signature, amount)
}
