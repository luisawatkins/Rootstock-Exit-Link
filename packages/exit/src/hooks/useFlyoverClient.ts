import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Flyover } from '@rsksmart/flyover-sdk'
import { createFlyoverClient, flyoverNetworkForExit, type EthereumProvider } from '../flyover/client.js'
import type { ExitNetwork } from '../types.js'
import { exitLinkQueryKeys } from './queryKeys.js'

/**
 * Single shared Flyover instance per network + connected account so quote fetch and peg-out execute share LP/session state.
 */
export function useFlyoverClient(
  provider: EthereumProvider | undefined,
  network: ExitNetwork,
  walletAccount: string | undefined,
): UseQueryResult<Flyover, Error> {
  const accountKey = walletAccount ?? ''
  return useQuery({
    queryKey: exitLinkQueryKeys.flyoverClient(network, accountKey),
    queryFn: async () => {
      if (!provider) throw new Error('Wallet provider is required.')
      return createFlyoverClient(provider, flyoverNetworkForExit(network))
    },
    enabled: Boolean(provider) && Boolean(walletAccount),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  })
}
