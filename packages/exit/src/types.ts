import type { PegoutQuote } from '@rsksmart/flyover-sdk'

export type ExitNetwork = 'mainnet' | 'testnet'

export type ExitStage = 'idle' | 'rootstock_tx' | 'bridge' | 'mempool' | 'confirmed'

export type BridgeRoute = 'flyover' | 'powpeg'

export type Urgency = 'low' | 'medium' | 'high'

export interface ParsedBitcoinPay {
  address: string
  amountBtc?: string
  amountSatoshis?: bigint
  label?: string
  message?: string
}

export interface RouteRecommendation {
  route: BridgeRoute
  summary: string
  flyoverPreferred: boolean
}

export interface PegoutQuotePreview {
  quote: PegoutQuote
  totalWei: bigint
  providerName?: string
}

export interface PowPegFeeEstimate {
  bitcoinFee: bigint
  rootstockFee: bigint
}
