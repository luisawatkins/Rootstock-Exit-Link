import {
  isTaprootAddress,
  isBtcNativeSegwitAddress,
  isLegacyBtcAddress,
} from '@rsksmart/bridges-core-sdk'
import type { BtcAddressType } from '@rsksmart/flyover-sdk'

export function inferBtcAddressType(address: string): BtcAddressType {
  if (isTaprootAddress(address)) return 'p2tr'
  if (isBtcNativeSegwitAddress(address)) return 'p2wpkh'
  if (isLegacyBtcAddress(address)) {
    if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) return 'p2pkh'
    return 'p2sh'
  }
  throw new Error('Unrecognized Bitcoin address format for Flyover address-type inference.')
}
