import type { ExitNetwork } from '../types.js'

export const exitLinkQueryKeys = {
  pegoutQuotes: (p: {
    network: ExitNetwork
    rskRefundAddress: string
    btcDestination: string
    valueWei: string
  }) => ['exit-link', 'pegout-quotes', p] as const,
  powpegFees: (p: { network: ExitNetwork; amountRbtc: string; fromAddress: string }) =>
    ['exit-link', 'powpeg-fees', p] as const,
  swapEstimate: (p: {
    network: ExitNetwork
    fromToken: string
    fromAmount: string
    userAddress: string
  }) => ['exit-link', 'swap-estimate', p] as const,
}
