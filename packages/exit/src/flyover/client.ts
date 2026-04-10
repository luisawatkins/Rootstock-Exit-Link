import { Flyover } from '@rsksmart/flyover-sdk'
import { BlockchainConnection, type CaptchaTokenResolver, type Network } from '@rsksmart/bridges-core-sdk'
import type { ExitNetwork } from '../types.js'

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

export function isEthereumProvider(value: unknown): value is EthereumProvider {
  if (value === null || typeof value !== 'object') return false
  const req = (value as { request?: unknown }).request
  return typeof req === 'function'
}

/**
 * Default: empty captcha token. Works for LPs that do not require captcha.
 * If your liquidity provider requires captcha, pass a `captchaTokenResolver` that returns a valid token or the peg-out flow will fail at the LP.
 */
const defaultCaptcha: CaptchaTokenResolver = async () => ''

/**
 * Build a Flyover client wired to the user wallet (EIP-1193).
 */
export async function createFlyoverClient(
  provider: EthereumProvider,
  network: Network,
  captchaTokenResolver: CaptchaTokenResolver = defaultCaptcha,
): Promise<Flyover> {
  if (!isEthereumProvider(provider)) {
    throw new TypeError('Invalid EIP-1193 provider: expected an object with a request() method.')
  }
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
