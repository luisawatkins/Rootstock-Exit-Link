import type { Flyover } from '@rsksmart/flyover-sdk'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { fetchBestPegoutQuote, type PegoutQuoteSelection } from '../flyover/pegout.js'
import type { ExitNetwork } from '../types.js'
import { exitLinkQueryKeys } from './queryKeys.js'

export interface UsePegoutQuotesOptions {
  flyover: Flyover | undefined
  network: ExitNetwork
  rskRefundAddress: string | undefined
  btcDestination: string | undefined
  valueWei: bigint | undefined
  enabled?: boolean
}

export function usePegoutQuotes(
  options: UsePegoutQuotesOptions,
): UseQueryResult<PegoutQuoteSelection | null, Error> {
  const {
    flyover,
    network,
    rskRefundAddress,
    btcDestination,
    valueWei,
    enabled = true,
  } = options

  const canRun =
    enabled &&
    Boolean(flyover) &&
    Boolean(rskRefundAddress) &&
    Boolean(btcDestination) &&
    valueWei !== undefined &&
    valueWei > 0n

  return useQuery({
    queryKey: exitLinkQueryKeys.pegoutQuotes({
      network,
      rskRefundAddress: rskRefundAddress ?? '',
      btcDestination: btcDestination ?? '',
      valueWei: valueWei?.toString() ?? '0',
    }),
    enabled: canRun,
    queryFn: async () => {
      if (!flyover || !rskRefundAddress || !btcDestination || valueWei === undefined) return null
      return fetchBestPegoutQuote(flyover, {
        rskRefundAddress,
        btcDestination,
        valueWei,
      })
    },
    staleTime: 5_000,
  })
}
