import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { createPowPegSdk, estimatePowPegPegoutFees } from '../powpeg/fees.js'
import type { ExitNetwork, PowPegFeeEstimate } from '../types.js'
import { exitLinkQueryKeys } from './queryKeys.js'

export interface UsePowPegFeesOptions {
  network: ExitNetwork
  amountRbtcDecimal: string
  fromRskAddress: string | undefined
  enabled?: boolean
}

export function usePowPegFees(
  options: UsePowPegFeesOptions,
): UseQueryResult<PowPegFeeEstimate, Error> {
  const { network, amountRbtcDecimal, fromRskAddress, enabled = true } = options
  const canRun = enabled && Boolean(fromRskAddress) && amountRbtcDecimal.trim().length > 0

  return useQuery({
    queryKey: exitLinkQueryKeys.powpegFees({
      network,
      amountRbtc: amountRbtcDecimal,
      fromAddress: fromRskAddress ?? '',
    }),
    enabled: canRun,
    queryFn: async () => {
      if (!fromRskAddress) throw new Error('Missing Rootstock address')
      const sdk = createPowPegSdk(network)
      return estimatePowPegPegoutFees(sdk, amountRbtcDecimal.trim(), fromRskAddress)
    },
    staleTime: 30_000,
  })
}
