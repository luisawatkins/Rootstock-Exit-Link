import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { createFlyoverClient, flyoverNetworkForExit, type EthereumProvider } from '../flyover/client.js'
import { fetchBestPegoutQuote, type PegoutQuoteSelection } from '../flyover/pegout.js'
import type { ExitNetwork } from '../types.js'
import { exitLinkQueryKeys } from './queryKeys.js'

export interface UsePegoutQuotesOptions {
  provider: EthereumProvider | undefined
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
    provider,
    network,
    rskRefundAddress,
    btcDestination,
    valueWei,
    enabled = true,
  } = options

  const canRun =
    enabled &&
    Boolean(provider) &&
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
      if (!provider || !rskRefundAddress || !btcDestination || valueWei === undefined) return null
      const flyover = await createFlyoverClient(provider, flyoverNetworkForExit(network))
      return fetchBestPegoutQuote(flyover, {
        rskRefundAddress,
        btcDestination,
        valueWei,
      })
    },
    staleTime: 20_000,
  })
}
