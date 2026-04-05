import { Flyover } from '@rsksmart/flyover-sdk'
import { BlockchainConnection, type CaptchaTokenResolver, type Network } from '@rsksmart/bridges-core-sdk'
import type { ExitNetwork } from '../types.js'

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

const defaultCaptcha: CaptchaTokenResolver = async () => ''

/**
 * Build a Flyover client wired to the user wallet (EIP-1193).
 */
export async function createFlyoverClient(
  provider: EthereumProvider,
  network: Network,
  captchaTokenResolver: CaptchaTokenResolver = defaultCaptcha,
): Promise<Flyover> {
  // bridges-core-sdk expects an EIP-1193 / ExternalProvider-shaped object
  const rskConnection = await BlockchainConnection.createUsingStandard(
    provider as Parameters<typeof BlockchainConnection.createUsingStandard>[0],
  )
  return new Flyover({
    network,
    rskConnection,
    captchaTokenResolver,
  })
}

export function flyoverNetworkForExit(exitNet: ExitNetwork): Network {
  return exitNet === 'mainnet' ? 'Mainnet' : 'Testnet'
}
