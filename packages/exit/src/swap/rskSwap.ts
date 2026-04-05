import { BlockchainConnection } from '@rsksmart/bridges-core-sdk'
import { RskSwapSDK, type RskSwapEnvironmentName } from '@rsksmart/rsk-swap-sdk'
import type { EthereumProvider } from '../flyover/client.js'
import type { ExitNetwork } from '../types.js'

export function rskSwapEnvName(network: ExitNetwork): RskSwapEnvironmentName {
  return network === 'mainnet' ? 'Mainnet' : 'Testnet'
}

export async function createRskSwapSdk(
  provider: EthereumProvider,
  network: ExitNetwork,
): Promise<RskSwapSDK> {
  const connection = await BlockchainConnection.createUsingStandard(
    provider as Parameters<typeof BlockchainConnection.createUsingStandard>[0],
  )
  return new RskSwapSDK(rskSwapEnvName(network), connection)
}
