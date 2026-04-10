import { PowPegSDK } from '@rsksmart/powpeg-sdk'
import type { ExitNetwork, PowPegFeeEstimate } from '../types.js'

/** PowPegSDK uses null web3 handles here because fee estimation calls the public API without a wallet signer. */
export function createPowPegSdk(network: ExitNetwork): PowPegSDK {
  return new PowPegSDK(null, null, network === 'mainnet' ? 'MAIN' : 'TEST')
}

export async function estimatePowPegPegoutFees(
  sdk: PowPegSDK,
  amountRbtcDecimal: string,
  fromRskAddress: string,
): Promise<PowPegFeeEstimate> {
  const fees = await sdk.estimatePegoutFees(amountRbtcDecimal, fromRskAddress)
  return {
    bitcoinFee: fees.bitcoinFee,
    rootstockFee: fees.rootstockFee,
  }
}
