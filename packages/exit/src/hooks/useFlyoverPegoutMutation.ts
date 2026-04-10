import type { Flyover } from '@rsksmart/flyover-sdk'
import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { executeFlyoverPegout, type PegoutQuoteSelection } from '../flyover/pegout.js'

export interface UseFlyoverPegoutVariables {
  flyover: Flyover
  selection: PegoutQuoteSelection
}

export function useFlyoverPegoutMutation(): UseMutationResult<string, Error, UseFlyoverPegoutVariables> {
  return useMutation({
    mutationFn: async ({ flyover, selection }) => executeFlyoverPegout(flyover, selection),
  })
}
