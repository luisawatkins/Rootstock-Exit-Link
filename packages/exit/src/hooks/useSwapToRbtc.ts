import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import type { EthereumProvider } from '../flyover/client.js'
import { createRskSwapSdk } from '../swap/rskSwap.js'
import { runSwapToRbtc, type SwapToRbtcParams, type SwapToRbtcResult } from '../swap/swapToRbtc.js'
import type { ExitNetwork } from '../types.js'

export interface UseSwapToRbtcVariables extends SwapToRbtcParams {
  provider: EthereumProvider
  network: ExitNetwork
}

export function useSwapToRbtc(): UseMutationResult<SwapToRbtcResult, Error, UseSwapToRbtcVariables> {
  return useMutation({
    mutationFn: async (vars: UseSwapToRbtcVariables) => {
      const sdk = await createRskSwapSdk(vars.provider, vars.network)
      return runSwapToRbtc(sdk, {
        fromToken: vars.fromToken,
        fromAmount: vars.fromAmount,
        recipientRsk: vars.recipientRsk,
        refundRsk: vars.refundRsk,
      })
    },
  })
}
