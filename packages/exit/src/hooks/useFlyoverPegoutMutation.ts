import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { createFlyoverClient, flyoverNetworkForExit, type EthereumProvider } from '../flyover/client.js'
import { executeFlyoverPegout, type PegoutQuoteSelection } from '../flyover/pegout.js'
import type { ExitNetwork } from '../types.js'

export interface UseFlyoverPegoutVariables {
  provider: EthereumProvider
  network: ExitNetwork
  selection: PegoutQuoteSelection
}

export function useFlyoverPegoutMutation(): UseMutationResult<string, Error, UseFlyoverPegoutVariables> {
  return useMutation({
    mutationFn: async ({ provider, network, selection }) => {
      const flyover = await createFlyoverClient(provider, flyoverNetworkForExit(network))
      return executeFlyoverPegout(flyover, selection)
    },
  })
}
