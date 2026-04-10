import type { ExitNetwork } from '../types.js'

export const exitLinkQueryKeys = {
  flyoverClient: (network: ExitNetwork, walletAccount: string) =>
    ['exit-link', 'flyover-client', network, walletAccount] as const,
  pegoutQuotes: (p: {
    network: ExitNetwork
    rskRefundAddress: string
    btcDestination: string
    valueWei: string
  }) => ['exit-link', 'pegout-quotes', p] as const,
  powpegFees: (p: { network: ExitNetwork; amountRbtc: string; fromAddress: string }) =>
    ['exit-link', 'powpeg-fees', p] as const,
}
